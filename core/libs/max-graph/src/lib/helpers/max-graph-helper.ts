/*
 * Copyright (c) 2026 Robert Bosch Manufacturing Solutions GmbH
 *
 * See the AUTHORS file(s) distributed with this work for
 * additional information regarding authorship.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * SPDX-License-Identifier: MPL-2.0
 */
import {LoadedFilesService} from '@ame/cache';
import {filterRelations, ModelFilter, ModelTree} from '@ame/loader-filters';
import {RdfModelUtil} from '@ame/rdf/utils';
import {SammLanguageSettingsService} from '@ame/settings-dialog';
import {basicShapeGeometry, ModelCompactTreeLayout, ModelHierarchicalLayout} from '@ame/shared';
import {Injector} from '@angular/core';
import {
  DefaultAspect,
  DefaultCharacteristic,
  DefaultEither,
  DefaultEntity,
  DefaultEntityInstance,
  DefaultEnumeration,
  DefaultOperation,
  DefaultProperty,
  DefaultStructuredValue,
  DefaultTrait,
  ElementSet,
  HasExtends,
  NamedElement,
} from '@esmf/aspect-model-loader';
import {Cell, CellOverlay, CompactTreeLayout, Graph, HierarchicalLayout, Rectangle} from '@maxgraph/core';
import {ModelBaseProperties} from '../models';
import {MaxGraphVisitorHelper, ShapeAttribute} from './max-graph-visitor-helper';

export class MaxGraphHelper {
  static filterMode: ModelFilter = ModelFilter.DEFAULT;
  static injector: Injector;

  /**
   * Gets the node element for a cell
   *
   * @param cell maxgraph element
   */
  static getElementNode<U extends NamedElement = NamedElement>(cell: Cell): ModelTree<U> {
    if (typeof cell?.['getMetaModelElement'] === 'function') {
      return (<any>cell).getMetaModelElement();
    }
    return null;
  }

  /**
   * Gets the element model for a cell
   *
   * @param cell maxgraph element
   */
  static getModelElement<U extends NamedElement = NamedElement>(cell: Cell): U {
    const node = this.getElementNode<U>(cell);
    return node ? node.element : null;
  }

  /**
   * Checks if child (a property) is either an optional, notInPayload or has a payloadName
   *
   * @param child NamedElement
   * @param parent NamedElement
   */
  static isOptionalProperty(child: DefaultProperty, parent: NamedElement) {
    if (!(parent instanceof DefaultAspect || parent instanceof DefaultEntity) || !(child instanceof DefaultProperty)) {
      return false;
    }

    return parent.propertiesPayload[child.aspectModelUrn]?.optional;
  }

  /**
   * Checks if metaModel is characteristic and predefined.
   */
  static isMetaModelPredefined(metaModel: NamedElement): boolean {
    return metaModel instanceof DefaultCharacteristic && metaModel.isPredefined;
  }

  /**
   * Checks if metaModel is characteristic and not predefined.
   */
  static isMetaModelNotPredefined(metaModel: NamedElement): boolean {
    return metaModel instanceof DefaultCharacteristic && !metaModel.isPredefined;
  }

  /**
   *Checks if metaModel is a complex enumeration.
   */
  static isComplexEnumeration(metaModelElement: NamedElement): boolean {
    return metaModelElement instanceof DefaultEnumeration && metaModelElement.dataType instanceof DefaultEntity;
  }

  static isNewConstrainOverlayButton(overlay: CellOverlay): boolean {
    return overlay.verticalAlign === 'top' && overlay.offset.x > 0;
  }

  static setConstrainOverlayOffset(overlay: CellOverlay, cell: Cell): void {
    if (MaxGraphHelper.isNewConstrainOverlayButton(overlay)) {
      overlay.offset.x = cell.geometry.width / 8;
    }
  }

  /**
   * Checks if cell is a characteristic without datatype.
   *
   */
  static isCharacteristicWithoutDataType(cell: Cell): boolean {
    const modelElement = MaxGraphHelper.getModelElement<DefaultCharacteristic>(cell);
    return modelElement ? !modelElement?.dataType : false;
  }

  static getCellAttribute(newValue) {
    if (newValue instanceof Array) {
      return RdfModelUtil.getValuesWithoutUrnDefinition(newValue);
    }
    return RdfModelUtil.getValueWithoutUrnDefinition(newValue);
  }

  /**
   * Sets the model element for a cell
   *
   * @param cell maxgraph element
   * @param metaModelObject internal model
   */
  static setElementNode(cell: Cell, node: ModelTree<NamedElement>) {
    cell['getMetaModelElement'] = (): ModelTree<NamedElement> => node;
  }

  /**
   * Checks if the parent of one of its properties has StructuredValue as parent
   *
   * @param cell cell you are testing
   * @param graph the graph the cell can be found
   * @returns boolean
   */
  static hasGrandParentStructuredValue(cell: Cell, graph: Graph) {
    return graph
      .getIncomingEdges(cell, null)
      .some(firstEdge =>
        graph
          .getIncomingEdges(firstEdge.source, null)
          .some(secondEdge => MaxGraphHelper.getModelElement(secondEdge.source) instanceof DefaultStructuredValue),
      );
  }

  /**
   * Adds child into children array from parent.
   * Adds parent into parents array from child.
   *
   * @param parent parent for child
   * @param child child for parent
   */
  static establishRelation(parent: NamedElement, child: NamedElement) {
    const hasRelation = filterRelations.some(relation => {
      if (!(parent instanceof relation.from)) {
        return false;
      }

      if (!relation.to.some(defaultClass => child instanceof defaultClass)) {
        return false;
      }

      return !relation.isExceptions(child, this.filterMode);
    });

    if (hasRelation) {
      parent.children.push(child);
      child.parents.push(parent);
    }
  }

  /**
   * Removes child from children array from parent.
   * Removes parent from parents array from child.
   *
   * @param parent parent for child
   * @param child child for parent
   */
  static removeRelation(parent: NamedElement, child: NamedElement) {
    const loadedFiles = this.injector ? this.injector.get(LoadedFilesService) : null;
    const isRemovable = this.isRemovable(parent, child);
    if (!isRemovable || (loadedFiles?.isElementExtern(parent) && child.isPredefined)) {
      return;
    }

    child.parents = new ElementSet(...child.parents.filter(p => p.aspectModelUrn !== parent.aspectModelUrn));
  }

  private static isRemovable(element: NamedElement, elementToRemove: NamedElement) {
    const loadedFiles = this.injector ? this.injector.get(LoadedFilesService) : null;
    const elementNamespace = element.aspectModelUrn.split('#')[0];
    const toRemoveNamespace = elementToRemove.aspectModelUrn.split('#')[0];

    return (
      elementNamespace !== toRemoveNamespace || !(loadedFiles?.isElementExtern(element) || loadedFiles?.isElementExtern(elementToRemove))
    );
  }

  static isEntityCycleInheritance(child: Cell, parent: NamedElement, graph: Graph): boolean {
    const nextGeneration = graph.getOutgoingEdges(child, null)?.map(edge => edge.target) || [];

    for (const cell of nextGeneration) {
      const modelElement = MaxGraphHelper.getModelElement(cell);
      return modelElement.aspectModelUrn === parent.aspectModelUrn || this.isEntityCycleInheritance(cell, parent, graph);
    }

    return false;
  }

  static getNewShapeOverlayButton(cell: Cell): CellOverlay {
    return cell?.overlays?.find(overlay => overlay.verticalAlign === 'bottom');
  }

  static getTopOverlayButton(cell: Cell): CellOverlay {
    return cell?.overlays?.find(overlay => overlay.verticalAlign === 'top' && overlay.align === 'center');
  }

  static getRightOverlayButton(cell: Cell): CellOverlay {
    return cell?.overlays?.find(overlay => overlay.align === 'right');
  }

  static getSubtreeCells(graph: Graph, root: Cell): Cell[] {
    const visited = new Set<Cell>();
    const queue = [root];
    while (queue.length > 0) {
      const current = queue.shift();
      if (!current || visited.has(current)) continue;
      visited.add(current);
      const edges = graph.getOutgoingEdges(current, null) || [];
      for (const edge of edges) {
        if (edge.target && !visited.has(edge.target)) {
          queue.push(edge.target);
        }
      }
    }
    return Array.from(visited);
  }

  static getCellsBoundingBox(cells: Cell[]): Rectangle | null {
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    let hasValid = false;

    for (const cell of cells) {
      if (!cell?.isVertex() || !cell.geometry) continue;
      hasValid = true;
      minX = Math.min(minX, cell.geometry.x);
      minY = Math.min(minY, cell.geometry.y);
      maxX = Math.max(maxX, cell.geometry.x + cell.geometry.width);
      maxY = Math.max(maxY, cell.geometry.y + cell.geometry.height);
    }

    return hasValid ? new Rectangle(minX, minY, maxX - minX, maxY - minY) : null;
  }

  static avoidCellCollisions(graph: Graph, movedCells: Cell[], dx: number, dy: number, padding = 20): {dx: number; dy: number} {
    if (!graph || !movedCells || movedCells.length === 0) {
      return {dx, dy};
    }

    const isVertex = (c: Cell) => (typeof c?.isVertex === 'function' ? c.isVertex() : !!c?.vertex);

    const movedVertices = movedCells.filter(c => isVertex(c) && c.geometry);
    if (movedVertices.length === 0) {
      return {dx, dy};
    }

    const allVertices = graph.getChildVertices(graph.getDefaultParent()) || [];
    const otherVertices = allVertices.filter(v => !movedCells.includes(v) && isVertex(v) && v.geometry);

    let adjustedDx = dx;
    let adjustedDy = dy;

    let hasCollision = true;
    let iterations = 0;
    while (hasCollision && iterations < 10) {
      iterations++;
      hasCollision = false;

      for (const cell of movedVertices) {
        let targetX = cell.geometry.x + adjustedDx;
        let targetY = cell.geometry.y + adjustedDy;
        const targetW = cell.geometry.width;
        const targetH = cell.geometry.height;

        for (const other of otherVertices) {
          const oX = other.geometry.x;
          const oY = other.geometry.y;
          const oW = other.geometry.width;
          const oH = other.geometry.height;

          const overlaps =
            targetX < oX + oW + padding &&
            targetX + targetW + padding > oX &&
            targetY < oY + oH + padding &&
            targetY + targetH + padding > oY;

          if (overlaps) {
            hasCollision = true;
            const pushRight = oX + oW + padding - targetX;
            const pushDown = oY + oH + padding - targetY;

            if (Math.abs(pushRight) <= Math.abs(pushDown)) {
              adjustedDx += pushRight;
              targetX += pushRight;
            } else {
              adjustedDy += pushDown;
              targetY += pushDown;
            }
          }
        }
      }
    }

    return {dx: adjustedDx, dy: adjustedDy};
  }

  static findAvailablePosition(
    graph: Graph,
    initialX: number,
    initialY: number,
    width: number,
    height: number,
    padding = 20,
  ): {x: number; y: number} {
    const x = initialX;
    let y = initialY;
    const isVertex = (c: Cell) => (typeof c?.isVertex === 'function' ? c.isVertex() : !!c?.vertex);
    const vertices = (graph?.getChildVertices(graph?.getDefaultParent()) || []).filter(v => isVertex(v) && v.geometry);

    let hasOverlap = true;
    let iterations = 0;
    while (hasOverlap && iterations < 50) {
      iterations++;
      hasOverlap = false;
      for (const v of vertices) {
        const vX = v.geometry.x;
        const vY = v.geometry.y;
        const vW = v.geometry.width;
        const vH = v.geometry.height;

        const overlaps = x < vX + vW + padding && x + width + padding > vX && y < vY + vH + padding && y + height + padding > vY;

        if (overlaps) {
          hasOverlap = true;
          y = vY + vH + padding;
          break;
        }
      }
    }

    return {x, y};
  }

  static setCompactTreeLayout(graph: Graph, inCollapsedMode: boolean, cell?: Cell): void {
    const graphLayout = new CompactTreeLayout(graph);
    graphLayout.maintainParentLocation = true;
    graphLayout.horizontal = false;
    graphLayout.minEdgeJetty = ModelCompactTreeLayout.minEdgeJetty;
    graphLayout.levelDistance = inCollapsedMode
      ? ModelCompactTreeLayout.collapsedLevelDistance
      : ModelCompactTreeLayout.expandedLevelDistance;
    graphLayout.nodeDistance = inCollapsedMode ? ModelCompactTreeLayout.collapsedNodeDistance : ModelCompactTreeLayout.expandedNodeDistance;
    if (cell) {
      graphLayout.execute(graph.getDefaultParent(), cell);
    } else {
      const rootVertices = (graph.getChildVertices(graph.getDefaultParent()) || []).filter(
        element => (this.getModelElement(element)?.parents?.length ?? 0) === 0,
      );

      let currentRight = 40;
      rootVertices.forEach((root, index) => {
        graphLayout.execute(graph.getDefaultParent(), root);
        const subtreeCells = this.getSubtreeCells(graph, root);
        const bbox = this.getCellsBoundingBox(subtreeCells);
        if (bbox && index > 0) {
          const deltaX = currentRight - bbox.x;
          if (deltaX !== 0) {
            graph.model.beginUpdate();
            try {
              subtreeCells.forEach(c => {
                if (c.geometry) {
                  const geo = c.geometry.clone();
                  geo.x += deltaX;
                  graph.model.setGeometry(c, geo);
                }
              });
            } finally {
              graph.model.endUpdate();
            }
          }
          currentRight += bbox.width + 80;
        } else if (bbox) {
          currentRight = bbox.x + bbox.width + 80;
        }
      });
    }
  }

  static setHierarchicalLayout(graph: Graph, inCollapsedMode: boolean, cell?: Cell): void {
    const graphLayout = new HierarchicalLayout(graph);
    graphLayout.maintainParentLocation = true;
    graphLayout.edgeStyle = ModelHierarchicalLayout.edgeStyle;
    graphLayout.intraCellSpacing = inCollapsedMode
      ? ModelHierarchicalLayout.collapsedIntraCellSpacing
      : ModelHierarchicalLayout.expandedIntraCellSpacing;
    graphLayout.interRankCellSpacing = inCollapsedMode
      ? ModelHierarchicalLayout.collapsedInterRankCellSpacing
      : ModelHierarchicalLayout.expandedInterRankCellSpacing;
    graphLayout.execute(graph.getDefaultParent(), cell);
  }

  static getCellHeight(cell: Cell) {
    const div = this.createPropertiesLabel(cell);
    return div?.style.height.split('px')[0];
  }

  static createEdgeLabel(cell: Cell, graph: Graph): HTMLElement {
    const sourceModelElement = MaxGraphHelper.getModelElement(cell.source);
    const targetModelElement = MaxGraphHelper.getModelElement(cell.target);

    if (sourceModelElement instanceof DefaultOperation) {
      const isInput = sourceModelElement?.input?.some(overwrittenProp => overwrittenProp === targetModelElement);
      const p = document.createElement('p');
      p.className += ' edge-label operation';
      if (targetModelElement === sourceModelElement?.output && isInput) {
        p.innerText = 'input-output';
      } else if (targetModelElement === sourceModelElement?.output) {
        p.innerText = 'output';
      } else if (isInput) {
        p.innerText = 'input';
      } else {
        return null;
      }
      return p;
    }
    if (sourceModelElement instanceof DefaultEither) {
      const p = document.createElement('p');
      p.className += ' edge-label characteristic';
      if (targetModelElement === sourceModelElement?.left) {
        p.innerText = 'left';
      } else if (targetModelElement === sourceModelElement?.right) {
        p.innerText = 'right';
      } else {
        return null;
      }
      return p;
    }

    if (targetModelElement instanceof DefaultProperty && sourceModelElement instanceof DefaultEntity) {
      const entityIncomingEdges = graph.getIncomingEdges(cell.source, null);
      let hasEnumeration = false;
      if (entityIncomingEdges) {
        entityIncomingEdges.forEach((c: Cell) => {
          // first check if it has a parent Enumeration
          if (this.getElementNode(c.source) instanceof DefaultEnumeration) {
            hasEnumeration = true;
          }
        });
      }
      if (!hasEnumeration) {
        return null;
      }

      const propertyPayload = sourceModelElement.propertiesPayload[targetModelElement.aspectModelUrn];

      if (propertyPayload.notInPayload) {
        const p = document.createElement('p');
        p.className += ' edge-label property';
        p.innerText = 'not in payload';
        return p;
      }
    }
    return null;
  }

  private static createLabelElement(cell: Cell) {
    const modelElement = MaxGraphHelper.getModelElement(cell);
    const div = document.createElement('div');
    div.dataset.cellId = cell.id;
    if (modelElement?.name) {
      div.dataset.cellName = modelElement.name;
    }
    div.dataset.collapsed = cell.collapsed ? 'yes' : 'no';
    div.classList.add('cell-label');
    if (cell.geometry?.width != null) {
      div.style.width = cell.geometry.width + 'px';
    }
    return div;
  }

  private static createTitleLabelElement(cell: Cell, isSmallShape: boolean) {
    const modelElement = MaxGraphHelper.getModelElement(cell);
    const title = document.createElement('span');
    if (!cell.collapsed && cell.geometry?.width != null) {
      title.style.width = cell.geometry.width + 'px';
    }

    const displayName = modelElement?.isAnonymous?.()
      ? modelElement.name?.startsWith('[')
        ? modelElement.name
        : `[${modelElement.className?.replace('Default', '') || 'Characteristic'}]`
      : modelElement?.name || '';

    title.title = isSmallShape ? '' : displayName;

    const formattedName = displayName?.length > 24 ? displayName?.substring(0, 21) + '...' : displayName;
    title.textContent = cell.collapsed && modelElement instanceof DefaultEntityInstance ? this.formatSmallName(displayName) : formattedName;

    title.classList.add('element-name');
    if (modelElement?.isAnonymous?.()) {
      title.classList.add('anonymous-node');
    }
    return title;
  }

  private static formatSmallName(name: string) {
    if (name.length < 4) {
      return name;
    } else {
      return name.charAt(0) + '..' + name.charAt(name.length - 1);
    }
  }

  static createPropertiesLabel(cell: Cell) {
    const modelElement = MaxGraphHelper.getModelElement(cell);
    if (!modelElement) {
      return null;
    }

    const node = this.getElementNode(cell);
    if (node.filterType === 'properties' && !(modelElement instanceof DefaultProperty || modelElement instanceof DefaultAspect)) {
      return null;
    }

    const isSmallShape = [DefaultEntityInstance].some(c => modelElement instanceof c);
    const div = this.createLabelElement(cell);
    const title = this.createTitleLabelElement(cell, isSmallShape);

    div.appendChild(title);

    if (isSmallShape) {
      title.classList.add('simple');
      const extending = modelElement as HasExtends;
      if (extending.extends_ && cell.collapsed) {
        div.removeChild(title);
      }
      return div;
    }

    if (modelElement instanceof DefaultTrait) {
      title.classList.add('simple');
      if (cell.collapsed) {
        div.removeChild(title);
      }
      return div;
    }

    const iconsBar = this.createShapeIconsBar(cell['configuration']?.baseProperties);

    // Generates a one line property to exactly calculate the height
    // After getting the height, this element is removed
    const heightGenerator = MaxGraphHelper.createSpanElement({label: 'x', key: ''});
    div.appendChild(heightGenerator);

    if (cell.collapsed) {
      title.title = '';
      title.classList.add('simple');
    } else {
      if (iconsBar && !(modelElement instanceof DefaultEntityInstance)) {
        div.appendChild(iconsBar);
      }
      const fields = cell['configuration']?.fields || [];
      const extendedFields = fields.filter(({extended}) => extended);
      const normalFields = fields.filter(({extended}) => !extended);
      for (const conf of [...normalFields, ...extendedFields]) {
        div.appendChild(this.createSpanElement(conf));
      }
    }

    // to get the calculated height, the div needs to be inserted in body
    document.body.appendChild(div);

    // getting all properties
    const infoElements = Array.from(div.querySelectorAll('.element-info'));

    // getting the heightGenerator span created above
    const elementToRemove = infoElements.shift();

    // getting the height then removing the heightGenerator
    const elementHeight = elementToRemove.clientHeight;
    div.removeChild(elementToRemove);
    infoElements.push(iconsBar);

    // calculating the height for the cell for maxGraph relative with HTML height (41 - HTML, 35 - maxgraph, result: 41/35)
    const elementsSize = (elementHeight * infoElements.length + title.clientHeight) / (41 / 35) + (infoElements.length ? 30 : 0);

    if (cell.geometry) {
      if (cell.collapsed) {
        cell.geometry.width = Math.max(50, title.clientWidth + 10);
        cell.geometry.height = title.clientHeight + 15;
      } else if (!isSmallShape) {
        cell.geometry.height =
          elementsSize < cell.geometry.height && elementsSize < basicShapeGeometry.expandedHeight
            ? basicShapeGeometry.expandedHeight
            : elementsSize;
        div.style.height = cell.geometry.height + 'px';
      }
    }

    // removing the element from body since the height was got
    document.body.removeChild(div);
    return div;
  }

  private static createShapeIconsBar(baseProperties: ModelBaseProperties) {
    if (!baseProperties) {
      return null;
    }

    const iconsBar = document.createElement('div');
    iconsBar.classList.add('icons-bar');
    const infoLock = document.createElement('div');
    infoLock.title = '';

    if (baseProperties.external && !baseProperties.predefined) {
      infoLock.title += `Namespace: ${baseProperties.namespace} \nVersion: ${baseProperties.version} \nFile: ${baseProperties.fileName}\n`;
      infoLock.classList.add('info-shape');
      iconsBar.appendChild(infoLock);
    }

    if (baseProperties.predefined) {
      infoLock.title += `SAMM Element\n`;
      infoLock.classList.add('info-shape');
      iconsBar.appendChild(infoLock);
    }

    if (baseProperties.isAbstract) {
      infoLock.title += `Abstract Element\n`;
      infoLock.classList.add('info-shape');
      iconsBar.appendChild(infoLock);
    }

    return iconsBar;
  }

  private static createSpanElement(content: ShapeAttribute) {
    const span = document.createElement('span');
    if (content.extended) {
      span.style.opacity = '0.75';
    }
    span.classList.add('element-info');
    const sanitizedLabel = `${content.label}`.replace(/\n/g, ' ');
    span.title = (content.extended ? 'Inherited\n' : '') + content.label;
    span.innerText = sanitizedLabel;
    span.dataset.key = content.key;
    span.dataset.lang = content.lang || '';
    return span;
  }

  static updateLabel(cell: Cell, graph: Graph, sammLangService: SammLanguageSettingsService) {
    if (!cell) {
      return;
    }
    if (!cell['configuration']) {
      cell['configuration'] = {};
    }
    cell['configuration'].fields = MaxGraphVisitorHelper.getElementProperties(MaxGraphHelper.getModelElement(cell), sammLangService);
    graph?.labelChanged?.(cell, MaxGraphHelper.createPropertiesLabel(cell), null);
  }

  static getNamespaceFromElement(element: NamedElement) {
    const [namespace] = element?.aspectModelUrn.split('#') || ['', ''];
    const splitted = namespace.split(':');
    return [splitted.pop(), splitted.pop()];
  }

  static isChildOf(parent: NamedElement, child: NamedElement) {
    return parent.children.some(el => el.aspectModelUrn === child.aspectModelUrn);
  }
}
