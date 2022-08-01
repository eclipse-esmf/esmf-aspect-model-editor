/*
 * Copyright (c) 2022 Robert Bosch Manufacturing Solutions GmbH
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

import {
  BaseMetaModelElement,
  DefaultProperty,
  DefaultCharacteristic,
  DefaultEither,
  DefaultEntity,
  DefaultEntityValue,
  DefaultEnumeration,
  DefaultOperation,
  DefaultStructuredValue,
  DefaultTrait,
  DefaultAbstractEntity,
} from '@ame/meta-model';
import {RdfModelUtil} from '@ame/rdf/utils';
import {LanguageSettingsService} from '@ame/settings-dialog';
import {ExpandedModelShape, ModelCompactTreeLayout, ModelHierarchicalLayout} from '@ame/shared';
import {mxgraph} from 'mxgraph-factory';
import {ModelBaseProperties} from '../models';
import {mxConstants, mxCompactTreeLayout, mxHierarchicalLayout} from '../providers';
import {MxGraphVisitorHelper, PropertyInformation} from './mx-graph-visitor-helper';

export class MxGraphHelper {
  /**
   * Gets the model element for a cell
   *
   * @param cell mx element
   */
  static getModelElement<T = BaseMetaModelElement>(cell: mxgraph.mxCell): T {
    if (typeof cell?.['getMetaModelElement'] === 'function') {
      return (<any>cell).getMetaModelElement();
    }
    return null;
  }

  /**
   * Checks if child (a property) is either an optional, notInPayload or has a payloadName
   *
   * @param child BaseMetaModelElement
   * @param parent BaseMetaModelElement
   */
  static isOptionalProperty(child: DefaultProperty, parent: BaseMetaModelElement) {
    if (!(parent instanceof DefaultEntity) || !(child instanceof DefaultProperty)) {
      return false;
    }

    const {keys} = parent.properties?.find(({property}) => property.aspectModelUrn === child.aspectModelUrn) || {};
    return !!keys && keys.optional;
  }

  /**
   * Checks if metaModel is characteristic and predefined.
   */
  static isMetaModelPredefined(metaModel: BaseMetaModelElement): boolean {
    return metaModel instanceof DefaultCharacteristic && metaModel.isPredefined();
  }

  /**
   * Checks if metaModel is characteristic and not predefined.
   */
  static isMetaModelNotPredefined(metaModel: BaseMetaModelElement): boolean {
    return metaModel instanceof DefaultCharacteristic && !metaModel.isPredefined();
  }

  /**
   *Checks if metaModel is a complex enumeration.
   */
  static isComplexEnumeration(metaModelElement: BaseMetaModelElement): boolean {
    return metaModelElement instanceof DefaultEnumeration && metaModelElement.dataType instanceof DefaultEntity;
  }

  static isNewConstrainOverlayButton(overlay: mxgraph.mxCellOverlay): boolean {
    return overlay.verticalAlign === mxConstants.ALIGN_TOP && overlay.offset.x > 0;
  }

  static setConstrainOverlayOffset(overlay: mxgraph.mxCellOverlay, cell: mxgraph.mxCell): void {
    if (MxGraphHelper.isNewConstrainOverlayButton(overlay)) {
      overlay.offset.x = cell.geometry.width / 8;
    }
  }

  /**
   * Checks if cell is a characteristic without datatype.
   *
   */
  static isCharacteristicWithoutDataType(cell: mxgraph.mxCell): boolean {
    if (MxGraphHelper.getModelElement<DefaultCharacteristic>(cell)) {
      const characteristic = MxGraphHelper.getModelElement(cell) as DefaultCharacteristic;

      return !characteristic.dataType;
    }

    return false;
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
   * @param cell mx element
   * @param metaModelObject internal model
   */
  static setModelElement(cell: mxgraph.mxCell, metaModelObject: BaseMetaModelElement) {
    cell['getMetaModelElement'] = (): BaseMetaModelElement => metaModelObject;
  }

  /**
   * Checks if the parent of one of its properties has StructuredValue as parent
   *
   * @param cell cell you are testing
   * @param graph the graph the cell can be found
   * @returns boolean
   */
  static hasGrandParentStructuredValue(cell: mxgraph.mxCell, graph: mxgraph.mxGraph) {
    return graph
      .getIncomingEdges(cell)
      .some(firstEdge =>
        graph
          .getIncomingEdges(firstEdge.source)
          .some(secondEdge => MxGraphHelper.getModelElement(secondEdge.source) instanceof DefaultStructuredValue)
      );
  }

  static getNewShapeOverlayButton(cell: mxgraph.mxCell): mxgraph.mxCellOverlay {
    return cell?.overlays?.find(overlay => overlay.verticalAlign === mxConstants.ALIGN_BOTTOM);
  }

  static getTopOverlayButton(cell: mxgraph.mxCell): mxgraph.mxCellOverlay {
    return cell?.overlays?.find(overlay => overlay.verticalAlign === mxConstants.ALIGN_TOP && overlay.align === mxConstants.ALIGN_CENTER);
  }

  static getRightOverlayButton(cell: mxgraph.mxCell): mxgraph.mxCellOverlay {
    return cell?.overlays?.find(overlay => overlay.align === mxConstants.ALIGN_RIGHT);
  }

  static setCompactTreeLayout(graph: mxgraph.mxGraph, inCollapsedMode: boolean, cell?: mxgraph.mxCell): void {
    const graphLayout = new mxCompactTreeLayout(graph);
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
      graphLayout.execute(graph.getDefaultParent());
    }
  }

  static setHierarchicalLayout(graph: mxgraph.mxGraph, inCollapsedMode: boolean, cell?: mxgraph.mxCell): void {
    const graphLayout = new mxHierarchicalLayout(graph);
    graphLayout.maintainParentLocation = true;
    graphLayout.edgeStyle = ModelHierarchicalLayout.edgeStyle;
    graphLayout.intraCellSpacing = inCollapsedMode
      ? ModelHierarchicalLayout.collapsedIntraCellSpacing
      : ModelHierarchicalLayout.expandedIntraCellSpacing;
    graphLayout.interRankCellSpacing = inCollapsedMode
      ? ModelHierarchicalLayout.collapsedInterRankCellSpacing
      : ModelHierarchicalLayout.expandedInterRankCellSpacing;
    if (cell) {
      graphLayout.execute(graph.getDefaultParent(), cell);
    } else {
      graphLayout.execute(graph.getDefaultParent());
    }
  }

  static getCellHeight(cell: mxgraph.mxCell) {
    const div = this.createPropertiesLabel(cell);
    return div?.style.height.split('px')[0];
  }

  static createEdgeLabel(cell: mxgraph.mxCell, graph: mxgraph.mxGraph): HTMLElement {
    const sourceElement: BaseMetaModelElement = MxGraphHelper.getModelElement(cell.source);
    const targetElement: BaseMetaModelElement = MxGraphHelper.getModelElement(cell.target);

    if (sourceElement instanceof DefaultOperation) {
      const isInput = sourceElement?.input?.some(overwrittenProp => overwrittenProp?.property === targetElement);
      const p = document.createElement('p');
      p.className += ' edge-label operation';
      if (targetElement === sourceElement?.output?.property && isInput) {
        p.innerText = 'input-output';
      } else if (targetElement === sourceElement?.output?.property) {
        p.innerText = 'output';
      } else if (isInput) {
        p.innerText = 'input';
      } else {
        return null;
      }
      return p;
    }
    if (sourceElement instanceof DefaultEither) {
      const p = document.createElement('p');
      p.className += ' edge-label characteristic';
      if (targetElement === sourceElement?.left) {
        p.innerText = 'left';
      } else if (targetElement === sourceElement?.right) {
        p.innerText = 'right';
      } else {
        return null;
      }
      return p;
    }
    if (targetElement instanceof DefaultProperty && sourceElement instanceof DefaultEntity) {
      const entityIncomingEdges = graph.getIncomingEdges(cell.source);
      let hasEnumeration = false;
      if (entityIncomingEdges) {
        entityIncomingEdges.forEach((c: mxgraph.mxCell) => {
          // first check if it has a parent Enumeration
          if (this.getModelElement(c.source) instanceof DefaultEnumeration) {
            hasEnumeration = true;
          }
        });
      }
      if (!hasEnumeration) {
        return null;
      }
      const overwrittenProp = sourceElement.properties.find(prop => prop.property === targetElement);
      if (overwrittenProp.keys.notInPayload) {
        const p = document.createElement('p');
        p.className += ' edge-label property';
        p.innerText = 'not in payload';
        return p;
      }
    }
    return null;
  }

  static createPropertiesLabel(cell: mxgraph.mxCell) {
    const modelElement = MxGraphHelper.getModelElement(cell);
    if (!modelElement) {
      return null;
    }

    const div = document.createElement('div');
    div.dataset.cellId = cell.id;
    div.dataset.collapsed = cell.collapsed ? 'yes' : 'no';
    div.classList.add('cell-label');
    div.style.width = cell.geometry.width + 'px';

    const title = document.createElement('span');
    if (!cell.collapsed) {
      title.style.width = cell.geometry.width + 'px';
    }
    title.title = modelElement.name;
    title.innerText = modelElement.name.length > 24 ? modelElement.name.substring(0, 21) + '...' : modelElement.name;
    title.classList.add('element-name');

    div.appendChild(title);

    if (modelElement instanceof DefaultEntityValue || modelElement instanceof DefaultAbstractEntity) {
      title.classList.add('simple');
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

    // Generates an one line property to exactly calculate the height
    // After getting the height, this element is removed
    const heightGenerator = MxGraphHelper.createSpanElement({label: 'x', key: ''});
    div.appendChild(heightGenerator);

    if (!cell.collapsed) {
      iconsBar && !(modelElement instanceof DefaultEntityValue) && div.appendChild(iconsBar);
      for (const conf of cell['configuration']?.fields || []) {
        div.appendChild(this.createSpanElement(conf));
      }
    } else {
      title.title = '';
      title.classList.add('simple');
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

    // calculating the height for the cell for mxGraph relative with html height (41 - html, 35 - mxgraph, result: 41/35)
    const elementsSize = (elementHeight * infoElements.length + title.clientHeight) / (41 / 35) + (infoElements.length ? 30 : 0);

    if (cell.collapsed) {
      cell.geometry.width = Math.max(50, title.clientWidth + 10);
      cell.geometry.height = title.clientHeight + 15;
    } else if (!(modelElement instanceof DefaultEntityValue || modelElement instanceof DefaultAbstractEntity)) {
      cell.geometry.height =
        elementsSize < cell.geometry.height && elementsSize < ExpandedModelShape.expandedElementHeight
          ? ExpandedModelShape.expandedElementHeight
          : elementsSize;
      div.style.height = cell.geometry.height + 'px';
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

    if (baseProperties.external && !baseProperties.predefined) {
      const infoLock = document.createElement('div');
      infoLock.title = `Namespace: ${baseProperties.namespace} \nVersion: ${baseProperties.version} \nFile: ${baseProperties.fileName}`;
      infoLock.classList.add('info-shape');
      iconsBar.appendChild(infoLock);
    }

    if (baseProperties.predefined) {
      const infoLock = document.createElement('div');
      infoLock.title = `BAMM Element`;
      infoLock.classList.add('info-shape');
      iconsBar.appendChild(infoLock);
    }

    return iconsBar;
  }

  private static createSpanElement(content: PropertyInformation) {
    const span = document.createElement('span');
    span.classList.add('element-info');
    const sanitizedLabel = `${content.label}`.replace(/\n/g, ' ');
    span.title = content.label;
    span.innerText = sanitizedLabel;
    span.dataset.key = content.key;
    span.dataset.lang = content.lang || '';
    return span;
  }

  static updateLabel(cell: mxgraph.mxCell, graph: mxgraph.mxGraph, languageSettingsService: LanguageSettingsService) {
    cell['configuration'].fields = MxGraphVisitorHelper.getElementProperties(MxGraphHelper.getModelElement(cell), languageSettingsService);
    graph.labelChanged(cell, MxGraphHelper.createPropertiesLabel(cell));
  }

  static getNamespaceFromElement(element: BaseMetaModelElement) {
    const [namespace] = element.aspectModelUrn.split('#');
    const splitted = namespace.split(':');
    return [splitted.pop(), splitted.pop()];
  }
}
