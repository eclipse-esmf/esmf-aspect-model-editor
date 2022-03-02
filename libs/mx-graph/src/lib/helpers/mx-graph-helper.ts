import {
  BaseMetaModelElement,
  DefaultProperty,
  DefaultAspect,
  DefaultEntity,
  DefaultCharacteristic,
  DefaultEnumeration,
  DefaultTrait,
  DefaultEntityValue,
  DefaultOperation,
  DefaultEither,
  DefaultStructuredValue
} from '@bame/meta-model';
import {RdfModelUtil} from '@bame/rdf/utils';
import {LanguageSettingsService} from '@bame/settings-dialog';
import {ModelCompactTreeLayout, ModelHierarchicalLayout, ExpandedModelShape} from '@bame/shared';
import {mxgraph} from 'mxgraph-factory';
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
    if (!(parent instanceof DefaultAspect || parent instanceof DefaultEntity)) {
      return false;
    }

    if (!(child instanceof DefaultProperty)) {
      return false;
    }

    const {keys} = parent.properties?.find(({property}) => property.aspectModelUrn === child.aspectModelUrn) || {};
    return !!keys && (keys.optional);
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

  static setCompactTreeLayout(graph: mxgraph.mxGraph, inCollapsedMode: boolean): void {
    const graphLayout = new mxCompactTreeLayout(graph);
    graphLayout.horizontal = false;
    graphLayout.minEdgeJetty = ModelCompactTreeLayout.minEdgeJetty;
    graphLayout.levelDistance = inCollapsedMode
      ? ModelCompactTreeLayout.collapsedLevelDistance
      : ModelCompactTreeLayout.expandedLevelDistance;
    graphLayout.nodeDistance = inCollapsedMode ? ModelCompactTreeLayout.collapsedNodeDistance : ModelCompactTreeLayout.expandedNodeDistance;
    graphLayout.execute(graph.getDefaultParent());
  }

  static setHierarchicalLayout(graph: mxgraph.mxGraph, inCollapsedMode: boolean): void {
    const graphLayout = new mxHierarchicalLayout(graph);
    graphLayout.maintainParentLocation = true;
    graphLayout.edgeStyle = ModelHierarchicalLayout.edgeStyle;
    graphLayout.intraCellSpacing = inCollapsedMode
      ? ModelHierarchicalLayout.collapsedIntraCellSpacing
      : ModelHierarchicalLayout.expandedIntraCellSpacing;
    graphLayout.interRankCellSpacing = inCollapsedMode
      ? ModelHierarchicalLayout.collapsedInterRankCellSpacing
      : ModelHierarchicalLayout.expandedInterRankCellSpacing;
    graphLayout.execute(graph.getDefaultParent());
  }

  static getCellHeight(cell: mxgraph.mxCell) {
    const div = this.createPropertiesLabel(cell);
    return div?.style.height.split('px')[0];
  }

  static createEdgeLabel(cell: mxgraph.mxCell): HTMLElement {
    const sourceElement: BaseMetaModelElement = MxGraphHelper.getModelElement(cell.source);
    const targetElement: BaseMetaModelElement = MxGraphHelper.getModelElement(cell.target);

    if (sourceElement instanceof DefaultOperation) {
      const isInput = sourceElement?.input?.some((overwrittenProp) => overwrittenProp?.property === targetElement);
      const p = document.createElement('p');
      p.className += " edge-label operation";
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
      p.className += " edge-label characteristic";
      if (targetElement === sourceElement?.left) {
        p.innerText = 'left';
      } else if (targetElement === sourceElement?.right) {
        p.innerText = 'right';
      } else {
        return null;
      }
      return p;
    }
    if (targetElement instanceof DefaultProperty && (sourceElement instanceof DefaultEntity || sourceElement instanceof DefaultAspect)) {
      const overwrittenProp = sourceElement.properties.find(prop => prop.property === targetElement);
      if (overwrittenProp.keys.notInPayload) {
        const p = document.createElement('p');
        p.className += " edge-label property";
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
    // number 18 is cell padding (left + right)
    div.style.width = cell.geometry.width - (modelElement instanceof DefaultTrait ? 0 : 18) + 'px';

    const title = document.createElement('span');
    if (!cell.collapsed) {
      title.style.width = cell.geometry.width - 18 + 'px';
    }
    title.innerText = MxGraphHelper.getModelElement(cell).name;
    title.classList.add('element-name');

    div.appendChild(title);
    if (modelElement instanceof DefaultTrait) {
      if (cell.collapsed) {
        div.removeChild(title);
      }
      return div;
    }

    // Generates an one line property to exactly calculate the height
    // After getting the height, this element is removed
    const heightGenerator = MxGraphHelper.createSpanElement({label: 'x', key: ''});
    div.appendChild(heightGenerator);

    if (!cell.collapsed) {
      for (const conf of cell['configuration'] || []) {
        div.appendChild(MxGraphHelper.createSpanElement(conf));
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

    // calculating the height for the cell for mxGraph relative with html height (41 - html, 35 - mxgraph, result: 41/35)
    const elementsSize = (elementHeight * infoElements.length + title.clientHeight) / (41 / 35) + (infoElements.length ? 30 : 0);

    if (cell.collapsed) {
      cell.geometry.width = Math.max(50, title.clientWidth + 10);
      cell.geometry.height = title.clientHeight + 15;
    } else if (!(MxGraphHelper.getModelElement(cell) instanceof DefaultEntityValue)) {
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

  static createSpanElement(content: PropertyInformation) {
    const span = document.createElement('span');
    span.classList.add('element-info');
    span.title = content.label;
    span.innerText = content.label;
    span.dataset.key = content.key;
    span.dataset.lang = content.lang || '';
    return span;
  }

  static updateLabel(cell: mxgraph.mxCell, graph: mxgraph.mxGraph, languageSettingsService: LanguageSettingsService) {
    cell['configuration'] = MxGraphVisitorHelper.getElementProperties(MxGraphHelper.getModelElement(cell), languageSettingsService);
    graph.labelChanged(cell, MxGraphHelper.createPropertiesLabel(cell));
  }
}
