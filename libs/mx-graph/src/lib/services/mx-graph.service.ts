import {Injectable} from '@angular/core';
import {mxgraph} from 'mxgraph-factory';
import {Observable, Subject} from 'rxjs';
import {MxGraphShapeOverlayService} from './mx-graph-shape-overlay.service';
import {MxGraphAttributeService} from './mx-graph-attribute.service';
import {MxGraphShapeSelectorService} from './mx-graph-shape-selector.service';
import {environment} from 'environments/environment';
import {MxGraphSetupService, MxGraphGeometryProviderService} from '.';
import {MxGraphHelper, MxGraphCharacteristicHelper, PropertyInformation} from '../helpers';
import {mxUtils, mxCell, mxConstants} from '../providers';
import {BaseMetaModelElement, DefaultEntityValue} from '@bame/meta-model';
import {ModelStyleResolver, MxAttributeName} from '../models';
import {ConfigurationService, LanguageSettingsService} from '@bame/settings-dialog';
import {CollapsedOverlay, ExpandedOverlay, NotificationsService} from '@bame/shared';
import {NamespacesCacheService} from '@bame/cache';

@Injectable()
export class MxGraphService {
  private document: HTMLDocument;

  public firstTimeFold = true;
  public graph: mxgraph.mxGraph;

  get currentCachedFile() {
    return this.namespacesCacheService.getCurrentCachedFile();
  }

  constructor(
    private namespacesCacheService: NamespacesCacheService,
    private languageSettingsService: LanguageSettingsService,
    private configurationService: ConfigurationService,
    private graphSetupService: MxGraphSetupService,
    private mxGraphGeometryProviderService: MxGraphGeometryProviderService,
    private mxGraphShapeOverlayService: MxGraphShapeOverlayService,
    private mxGraphAttributeService: MxGraphAttributeService,
    private mxGraphShapeSelectorService: MxGraphShapeSelectorService,
    private notificationsService: NotificationsService
  ) {
    this.document = mxUtils.createXmlDocument();
    if (!environment.production) {
      window['angular.mxGraphService'] = this;
    }
  }

  initGraph(): void {
    this.graphSetupService.setUp();
    this.graph = this.mxGraphAttributeService.graph;

    mxCell.prototype.clone = function () {
      return this;
    };
  }

  /**
   * Method to update the graph.Increments the updateLevel by one.
   * The event notification is queued until updateLevel reaches 0 by use of endUpdate.
   * All changes on mxGraphModel are transactional, that is, they are executed in a single un-doable change on the model
   * (without transaction isolation).  Therefore, if you want to combine any number of changes into a single un-doable change,
   * you should group any two or more API calls that modify the graph model between beginUpdate and endUpdate
   */
  updateGraph(updateFunction: Function): Observable<boolean> {
    const subject = new Subject<boolean>();
    this.mxGraphAttributeService.graph.model.beginUpdate();
    try {
      updateFunction?.();
    } finally {
      this.mxGraphAttributeService.graph.model.endUpdate();
      requestAnimationFrame(() => subject.next(true));
    }

    return subject.asObservable();
  }

  /**
   * Gets cell parents
   *
   * @param cell most basic entity of a mx-graph model,
   * @returns array of parent cells
   */
  resolveParents(cell: mxgraph.mxCell): Array<mxgraph.mxCell> {
    return this.mxGraphAttributeService.graph.getIncomingEdges(cell).map(parent => parent.source);
  }

  /**
   * Gets the cell for a specific model element
   *
   * @param metaModelElement
   * @returns the cell that you want to resolve
   */
  resolveCellByModelElement(metaModelElement: BaseMetaModelElement): mxgraph.mxCell {
    return this.mxGraphAttributeService.graph
      .getChildVertices(this.mxGraphAttributeService.graph.getDefaultParent())
      .find(
        cell =>
          MxGraphHelper.getModelElement(cell) && MxGraphHelper.getModelElement(cell).aspectModelUrn === metaModelElement.aspectModelUrn
      );
  }

  /**
   * Modifies certain model Element with a new cell configuration
   *
   * @param metaModelElement element model
   * @param cellConfiguration cell visual configuration
   * @param x optional x parameter used for shape geometry
   * @param y optional y parameter used for shape geometry
   * @returns a new configured cell
   */
  renderModelElement(
    metaModelElement: BaseMetaModelElement,
    cellConfiguration: PropertyInformation[] = [],
    x?: number,
    y?: number
  ): mxgraph.mxCell {
    let modelShape: mxgraph.mxCell;
    const geometry = this.mxGraphGeometryProviderService.createGeometry(metaModelElement, x, y);
    try {
      modelShape = this.mxGraphShapeOverlayService.createShape(
        metaModelElement.name,
        ModelStyleResolver.resolve(metaModelElement),
        metaModelElement.name,
        this.document.createElement('model'),
        geometry,
        cellConfiguration
      );
      MxGraphHelper.setModelElement(modelShape, metaModelElement);

      if (metaModelElement.isExternalReference()) {
        const style = this.mxGraphAttributeService.graph.getModel().getStyle(modelShape);
        const newStyle = mxUtils.setStyle(style, mxConstants.STYLE_FILL_OPACITY, 80);
        this.mxGraphAttributeService.graph.setCellStyle(newStyle, [modelShape]);
      }

      this.mxGraphShapeOverlayService.checkComplexEnumerationOverlays(metaModelElement, modelShape);

      if (
        metaModelElement.isExternalReference() &&
        !(metaModelElement instanceof DefaultEntityValue) &&
        !this.mxGraphAttributeService.inCollapsedMode
      ) {
        this.mxGraphShapeOverlayService.addExternalReferenceOverlay(modelShape);
      }

      if (!metaModelElement.isExternalReference()) {
        this.mxGraphShapeOverlayService.addBottomShapeOverlay(modelShape);
        this.mxGraphShapeOverlayService.addTopShapeOverlay(modelShape);
      }
    } finally {
      this.mxGraphAttributeService.inCollapsedMode ? this.foldCell(modelShape) : this.expandCell(modelShape);
      this.mxGraphAttributeService.graph.resizeCell(modelShape, geometry);
    }
    return modelShape;
  }

  /**
   * Update all enumerations, parent entity values where deleted entityValue is linked.
   * Delete all child entity values
   *
   * @param selectedModelElement - EntityValue meta model which will be deleted
   */
  public updateEnumerationsWithEntityValue(selectedModelElement: DefaultEntityValue): void {
    if (selectedModelElement.isExternalReference()) {
      return;
    }

    selectedModelElement.parents.forEach(enumeration => {
      const entityValueIndex = enumeration.values.indexOf(selectedModelElement);
      if (entityValueIndex >= 0) {
        enumeration.values.splice(entityValueIndex, 1);
      }
    });

    // update all parent entity values
    const allEntityValues = this.currentCachedFile.getCachedEntityValues();
    allEntityValues.forEach(entityValue => {
      entityValue.properties.forEach(prop => {
        if (prop.value?.['aspectModelUrn'] === selectedModelElement.aspectModelUrn) {
          prop.value = undefined;
        }
      });
    });

    this.currentCachedFile.removeCachedElement(selectedModelElement.aspectModelUrn);
    // delete all lower entity values that don't belong to an enumeration
    const lowerEntityValuesToDelete = MxGraphCharacteristicHelper.getChildEntityValuesToDelete(selectedModelElement, []);
    lowerEntityValuesToDelete.forEach(entityValue => {
      this.currentCachedFile.removeCachedElement(entityValue.aspectModelUrn);
      this.removeCells([this.resolveCellByModelElement(entityValue)]);
    });
  }

  removeCellChild(parent: mxgraph.mxCell, childName: string) {
    const child = parent?.children?.find(childCell => childCell.getAttribute(MxAttributeName.META_MODEL_PROPERTY) === childName);
    this.removeCells([child]);
  }

  getAllEdges(cellId: string): mxgraph.mxCell[] {
    return this.mxGraphAttributeService.graph.model.getCell(cellId)?.edges;
  }

  /**
   * Navigate to a cell based on URN
   *
   * @param aspectModelUrn aspect URN
   * @returns navigated cell
   */
  navigateToCellByUrn(aspectModelUrn: string): mxgraph.mxCell {
    const cellToNavigate = Object.values<mxgraph.mxCell>(this.mxGraphAttributeService.graph.model.cells).find((cell: mxgraph.mxCell) => {
      const metaElement = MxGraphHelper.getModelElement(cell);
      if (metaElement && metaElement.aspectModelUrn === aspectModelUrn) {
        return cell;
      }
      return null;
    });

    return this.navigateToCell(cellToNavigate, true);
  }

  /**
   * Navigate to a cell
   *
   * @param cell mx element
   * @param center flag to signal if the cell should be visible on the center
   * @returns navigated cell
   */
  navigateToCell(cell: mxgraph.mxCell, center: boolean): mxgraph.mxCell {
    if (!cell) {
      this.notificationsService.error('The shape you are looking for was not found');
      return null;
    }

    this.mxGraphAttributeService.graph.selectCellForEvent(cell);
    this.mxGraphAttributeService.graph.scrollCellToVisible(cell, center);

    return cell;
  }

  /** Removes all elements of the current aspect  */
  deleteAllShapes(): void {
    this.updateGraph(() =>
      this.mxGraphAttributeService.graph.removeCells(
        this.mxGraphAttributeService.graph.getChildVertices(this.mxGraphAttributeService.graph.getDefaultParent())
      )
    );
  }

  /** Expand all cells*/
  expandCells() {
    this.updateGraph(() => {
      const cells = this.mxGraphAttributeService.graph.getChildCells(this.mxGraphAttributeService.graph.getDefaultParent(), true, false);
      this.mxGraphAttributeService.graph.foldCells(false, true, cells);
      this.mxGraphAttributeService.inCollapsedMode = false;

      cells.forEach(cell => {
        this.mxGraphAttributeService.graph.resizeCell(
          cell,
          this.mxGraphGeometryProviderService.createGeometry(MxGraphHelper.getModelElement(cell), cell?.geometry?.x, cell?.geometry?.y)
        );
        const modelElement = MxGraphHelper.getModelElement(cell);
        if (MxGraphHelper.isComplexEnumeration(modelElement)) {
          this.mxGraphShapeOverlayService.addComplexEnumerationShapeOverlay(cell);
        }
        cell.overlays?.forEach(overlay => {
          overlay.image.width = ExpandedOverlay.width;
          overlay.image.height = ExpandedOverlay.height;

          MxGraphHelper.setConstrainOverlayOffset(overlay, cell);
        });
        this.mxGraphShapeOverlayService.addOrRemoveExternalReferenceShapeOverlay(cell);
      });
      this.formatShapes();
    }).subscribe(() => {
      const selectedCell = this.mxGraphShapeSelectorService.getSelectedShape();
      if (selectedCell) {
        this.navigateToCell(selectedCell, true);
      }
      if (this.firstTimeFold) {
        this.firstTimeFold = false;
        this.formatShapes();
        this.graph.refresh();
      }
    });
  }

  /** Collapse all cells */
  foldCells() {
    this.updateGraph(() => {
      const cells = this.mxGraphAttributeService.graph.getChildCells(this.mxGraphAttributeService.graph.getDefaultParent(), true, false);
      this.mxGraphAttributeService.graph.foldCells(true, true, cells);

      cells.forEach(cell => {
        const modelElement = MxGraphHelper.getModelElement(cell);
        if (MxGraphHelper.isComplexEnumeration(modelElement)) {
          this.mxGraphShapeOverlayService.removeOverlay(cell, MxGraphHelper.getRightOverlayButton(cell));
        }
        cell.overlays?.forEach(overlay => {
          overlay.image.width = CollapsedOverlay.width;
          overlay.image.height = CollapsedOverlay.height;

          MxGraphHelper.setConstrainOverlayOffset(overlay, cell);
        });

        const geometry = this.mxGraphAttributeService.graph.model.getGeometry(cell);
        const isVertex = this.mxGraphAttributeService.graph.model.isVertex(cell);
        this.mxGraphGeometryProviderService.upgradeTraitGeometry(cell, geometry, isVertex);
        this.mxGraphGeometryProviderService.upgradeEntityValueGeometry(cell, geometry, isVertex);
        this.mxGraphShapeOverlayService.addOrRemoveExternalReferenceShapeOverlay(cell);
      });

      this.mxGraphAttributeService.inCollapsedMode = true;
      this.formatShapes();
    }).subscribe(() => {
      const selectedCell = this.mxGraphShapeSelectorService.getSelectedShape();
      if (selectedCell) {
        this.navigateToCell(selectedCell, true);
      }
      if (this.firstTimeFold) {
        this.formatShapes();
        this.firstTimeFold = false;
        this.graph.refresh();
      }
    });
  }

  /**
   * Expand a targeted cell
   *
   * @param cell mx element
   */
  expandCell(cell: mxgraph.mxCell): void {
    this.mxGraphAttributeService.graph.foldCells(false, false, [cell]);
  }

  /**
   * Collapse a targeted cell
   *
   * @param cell mx element
   */
  foldCell(cell: mxgraph.mxCell): void {
    this.mxGraphAttributeService.graph.foldCells(true, false, [cell]);
  }

  /** Re-formats entire schematic. */
  formatShapes(): void {
    if (this.mxGraphAttributeService.graph.getDefaultParent().children !== undefined) {
      this.configurationService.getSettings().enableHierarchicalLayout
        ? MxGraphHelper.setHierarchicalLayout(this.mxGraphAttributeService.graph, this.mxGraphAttributeService.inCollapsedMode)
        : MxGraphHelper.setCompactTreeLayout(this.mxGraphAttributeService.graph, this.mxGraphAttributeService.inCollapsedMode);
    }
  }

  /**
   * Connect a cell to parent
   *
   * @param child child mx element
   * @param parent parent mx element
   */
  assignToParent(child: mxgraph.mxCell, parent?: mxgraph.mxCell): void {
    const parentModel = MxGraphHelper.getModelElement(parent);
    const cellStyle =
      parentModel instanceof DefaultEntityValue && !(MxGraphHelper.getModelElement(child) instanceof DefaultEntityValue)
        ? 'entityValueEntityEdge'
        : MxGraphHelper.isOptionalProperty(MxGraphHelper.getModelElement(child), parentModel)
        ? 'optionalPropertyEdge'
        : 'defaultEdge';

    if (parent.edges && parent.edges.find(edge => edge.target.id === child.id)) {
      return;
    }
    this.mxGraphAttributeService.graph.insertEdge(
      this.mxGraphAttributeService.graph.getDefaultParent(),
      null,
      null,
      parent,
      child,
      cellStyle
    );
  }

  /**
   * Show validation error on a cell based on an URN string
   *
   * @param focusNodeUrn focused node URN
   */
  showValidationErrorOnShape(focusNodeUrn: string): void {
    Object.values<mxgraph.mxCell>(this.mxGraphAttributeService.graph.model.cells).forEach((cell: mxgraph.mxCell) => {
      const modelElement = MxGraphHelper.getModelElement(cell);
      if (modelElement && modelElement.aspectModelUrn === focusNodeUrn) {
        this.mxGraphAttributeService.graph.setCellStyles(mxConstants.STYLE_STROKECOLOR, 'red', [cell]);
        this.mxGraphAttributeService.graph.setCellStyles(mxConstants.STYLE_STROKEWIDTH, 3, [cell]);
      }
    });
  }

  /** Resets entire validation */
  resetValidationErrorOnAllShapes(): void {
    this.updateGraph(() => {
      Object.values<mxgraph.mxCell>(this.mxGraphAttributeService.graph.model.cells).forEach((cell: mxgraph.mxCell) => {
        if (!cell.isEdge()) {
          this.mxGraphAttributeService.graph.setCellStyles(mxConstants.STYLE_STROKECOLOR, '#FFFFFF', [cell]);
          this.mxGraphAttributeService.graph.setCellStyles(mxConstants.STYLE_STROKEWIDTH, 0, [cell]);
        }
      });
    });
  }

  removeCells(cells: Array<mxgraph.mxCell>): void {
    this.mxGraphAttributeService.graph.removeCells(cells);
  }

  /**
   *
   * @returns array with all available cells(mx elements)
   */
  getAllCells(): mxgraph.mxCell[] {
    return this.mxGraphAttributeService.graph.getChildVertices(this.mxGraphAttributeService.graph.getDefaultParent());
  }

  // private removeMetaModelRelatedChildren(parentCell: mxgraph.mxCell): void {
  //   if (parentCell.children && parentCell.children.length > 0) {
  //     this.mxGraphAttributeService.graph.removeCells(
  //       parentCell.children.filter(childCell => childCell.getAttribute(MxAttributeName.META_MODEL_PROPERTY, null) !== null)
  //     );
  //   }
  // }

  /**
   * This method will search in cache for all entryValues, find the ones with properties = deleted entity value and clear this properties.
   *
   * @param deletedEntityValue - EntityValueProperty.value that needs to be cleared.
   */
  public updateEntityValuesWithReference(deletedEntityValue: DefaultEntityValue): void {
    if (deletedEntityValue.isExternalReference()) {
      return;
    }

    this.namespacesCacheService
      .getCurrentCachedFile()
      .getCachedEntityValues()
      .forEach(entityValue =>
        entityValue.properties
          .filter(property => property.value instanceof DefaultEntityValue)
          .filter(property => (<DefaultEntityValue>property.value).aspectModelUrn === deletedEntityValue.aspectModelUrn)
          .forEach(entityValueToUpdate => (entityValueToUpdate.value = ''))
      );
  }

  /**
   * This method will transform cell to modelElement and update all the references where deletedEntityValueCells ar present.
   *
   * @param deletedEntityValueCells - cell which needs to be cleaned
   */
  public updateEntityValuesWithCellReference(deletedEntityValueCells: Array<mxgraph.mxCell>): void {
    deletedEntityValueCells
      .filter(entityValueCell => entityValueCell.isVertex())
      .forEach(entityValueCell => this.updateEntityValuesWithReference(MxGraphHelper.getModelElement(entityValueCell)));
  }
}
