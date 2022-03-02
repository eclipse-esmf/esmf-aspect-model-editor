import {Injectable, Injector} from '@angular/core';
import {NamespacesCacheService} from '@bame/cache';
import {mxgraph} from 'mxgraph-factory';
import {MxAttributeName, MxGraphCharacteristicHelper, MxGraphHelper, MxGraphService, MxGraphShapeOverlayService} from '@bame/mx-graph';
import {
  AspectModelService,
  BaseMetaModelElement,
  BaseModelService,
  CharacteristicModelService,
  ConstraintModelService,
  DefaultEntity,
  DefaultEntityValue,
  DefaultEnumeration,
  DefaultProperty,
  EntityModelService,
  EntityValueModelService,
  EventModelService,
  OperationModelService,
  PropertyModelService,
  TraitModelService,
  UnitModelService,
} from '@bame/meta-model';
import {EntityValueService} from '@bame/editor';
import {DefaultStructuredValue} from '../aspect-meta-model';
import {LanguageSettingsService} from '@bame/settings-dialog';

@Injectable({providedIn: 'root'})
export class ElementModelService {
  constructor(
    private injector: Injector,
    private mxGraphShapeOverlayService: MxGraphShapeOverlayService,
    private mxGraphService: MxGraphService,
    private namespacesCacheService: NamespacesCacheService,
    private entityValueService: EntityValueService,
    private languageSettingsService: LanguageSettingsService
  ) {}

  get currentCachedFile() {
    return this.namespacesCacheService.getCurrentCachedFile();
  }

  updateElement(cell: mxgraph.mxCell, form: {[key: string]: any}) {
    if (!cell || cell.isEdge()) {
      return;
    }
    const characteristicModelService = this.injector.get(CharacteristicModelService);
    const modelElement = MxGraphHelper.getModelElement(cell);
    const modelService =
      modelElement instanceof DefaultEnumeration ? characteristicModelService : this.getElementModelService(modelElement);
    modelService.update(cell, form);
  }

  deleteElement(cell: mxgraph.mxCell) {
    if (!cell) {
      return;
    }
    if (cell?.isEdge()) {
      this.decoupleElements(cell);
      return;
    }
    const modelElement = MxGraphHelper.getModelElement(cell);
    const elementModelService = this.getElementModelService(modelElement);
    elementModelService?.delete(cell);
  }

  decoupleElements(edge: mxgraph.mxCell) {
    const sourceModelElement = MxGraphHelper.getModelElement(edge.source);
    const targetModelElement = MxGraphHelper.getModelElement(edge.target);

    if (sourceModelElement.isExternalReference()) {
      return;
    }

    if (sourceModelElement instanceof DefaultEntity && targetModelElement instanceof DefaultProperty) {
      return this.entityValueService.onPropertyRemove(targetModelElement, () => {
        this.removeConnectionBetweenElements(edge, sourceModelElement, targetModelElement);
        this.mxGraphService.removeCells([edge]);
      });
    }
    this.decoupleEnumerationFromEntityValue(sourceModelElement, targetModelElement, edge);

    if (sourceModelElement instanceof DefaultEnumeration && targetModelElement instanceof DefaultEntity) {
      return this.entityValueService.onEntityDisconnect(sourceModelElement, targetModelElement, () => {
        const valuesCell = edge.source.children?.find(
          childCell => childCell.getAttribute(MxAttributeName.META_MODEL_PROPERTY) === 'values'
        );
        const obsoleteEntityValues = MxGraphCharacteristicHelper.findObsoleteEntityValues(edge);
        this.removeConnectionBetweenElements(edge, sourceModelElement, targetModelElement);
        this.mxGraphService.updateEntityValuesWithCellReference(obsoleteEntityValues);
        this.mxGraphService.removeCells([edge, valuesCell, ...obsoleteEntityValues]);
      });
    }

    if (sourceModelElement instanceof DefaultEntityValue && targetModelElement instanceof DefaultEntity) {
      this.mxGraphService.updateEnumerationsWithEntityValue(sourceModelElement);
      this.mxGraphService.updateEntityValuesWithCellReference([edge.source]);
      this.mxGraphService.removeCells([edge.source]);
    } else if (targetModelElement instanceof DefaultEntityValue) {
      this.mxGraphService.updateEnumerationsWithEntityValue(targetModelElement);
      this.mxGraphService.removeCells([edge.target]);
    }

    if (sourceModelElement instanceof DefaultStructuredValue && targetModelElement instanceof DefaultProperty) {
      sourceModelElement.delete(targetModelElement);
      MxGraphHelper.updateLabel(edge.source, this.mxGraphService.graph, this.languageSettingsService);
    }

    this.removeConnectionBetweenElements(edge, sourceModelElement, targetModelElement);
    this.mxGraphService.removeCells([edge]);
  }

  private removeConnectionBetweenElements(edge: mxgraph.mxCell, source: BaseMetaModelElement, target: BaseMetaModelElement) {
    if (MxGraphHelper.isComplexEnumeration(source)) {
      this.mxGraphShapeOverlayService.removeComplexTypeShapeOverlays(edge.source);
    }
    (source as any).delete(target);
    this.mxGraphShapeOverlayService.checkAndAddShapeActionIcon(new Array(edge), source);
    edge.target.removeEdge(edge, false);
    edge.source.removeEdge(edge, true);
  }

  /**
   * Decouple enumeration - entityValue when the edge between them will be deleted
   *
   * @param sourceModelElement - source enumeration
   * @param targetModelElement - target entity value
   * @param edge - deleted edge
   */
  private decoupleEnumerationFromEntityValue(
    sourceModelElement: BaseMetaModelElement,
    targetModelElement: BaseMetaModelElement,
    edge: mxgraph.mxCell
  ): void {
    if (sourceModelElement instanceof DefaultEnumeration && targetModelElement instanceof DefaultEntityValue) {
      const entityValueIndex = sourceModelElement.values.indexOf(targetModelElement);
      const enumerationIndex = targetModelElement.parents.indexOf(sourceModelElement);

      sourceModelElement.values.splice(entityValueIndex, 1);
      targetModelElement.parents.splice(enumerationIndex, 1);

      this.currentCachedFile.removeCachedElement(targetModelElement.aspectModelUrn);
      this.mxGraphService.removeCells([edge.target]);
    }
  }

  private getElementModelService(modelElement: BaseMetaModelElement): BaseModelService {
    // Order is important
    const elementServices: any[] = [
      AspectModelService,
      UnitModelService,
      TraitModelService,
      ConstraintModelService,
      CharacteristicModelService,
      EntityValueModelService,
      EntityModelService,
      PropertyModelService,
      OperationModelService,
      EventModelService
    ];

    // choose the applicable model service
    for (const serviceClass of elementServices) {
      const elementModelService = this.injector.get(serviceClass);
      if (elementModelService.isApplicable(modelElement)) {
        return elementModelService;
      }
    }
    return null;
  }
}
