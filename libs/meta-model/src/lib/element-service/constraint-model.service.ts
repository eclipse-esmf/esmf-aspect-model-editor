import {Injectable} from '@angular/core';
import {NamespacesCacheService} from '@bame/cache';
import {mxgraph} from 'mxgraph-factory';
import {BaseModelService} from './base-model-service';
import {ConstraintRenderService, MxGraphAttributeService, MxGraphHelper, MxGraphService, MxGraphShapeOverlayService} from '@bame/mx-graph';
import {Base, BaseMetaModelElement, DefaultConstraint, DefaultTrait} from '@bame/meta-model';
import {ModelService} from '@bame/rdf/services';
import {
  DefaultEncodingConstraint,
  DefaultFixedPointConstraint,
  DefaultLanguageConstraint,
  DefaultLengthConstraint,
  DefaultLocaleConstraint,
  DefaultRangeConstraint,
  DefaultRegularExpressionConstraint,
} from '../aspect-meta-model';

@Injectable({providedIn: 'root'})
export class ConstraintModelService extends BaseModelService {
  constructor(
    namespacesCacheService: NamespacesCacheService,
    modelService: ModelService,
    private mxGraphShapeOverlayService: MxGraphShapeOverlayService,
    private mxGraphAttributeService: MxGraphAttributeService,
    private mxGraphService: MxGraphService,
    private constraintRenderer: ConstraintRenderService
  ) {
    super(namespacesCacheService, modelService);
  }

  update(cell: mxgraph.mxCell, form: {[key: string]: any}) {
    let metaModelElement: DefaultConstraint = MxGraphHelper.getModelElement(cell);
    if (form.changedMetaModel) {
      cell = this.mxGraphService.resolveCellByModelElement(metaModelElement);
      const trait: DefaultTrait = MxGraphHelper.getModelElement(cell.edges[0].source);
      trait.constraints = trait.constraints.filter(constraint => constraint.aspectModelUrn !== metaModelElement.aspectModelUrn);

      this.updateModelOfParent(cell, form.changedMetaModel);
      MxGraphHelper.setModelElement(cell, form.changedMetaModel);
      metaModelElement = form.changedMetaModel; // set the changed meta model as the actual
    }
    super.update(cell, form);
    this.updateFields(metaModelElement, form);

    this.constraintRenderer.update({cell});
  }

  isApplicable(metaModelElement: BaseMetaModelElement): boolean {
    return metaModelElement instanceof DefaultConstraint;
  }

  delete(cell: mxgraph.mxCell) {
    super.delete(cell);
    const modelElement = MxGraphHelper.getModelElement(cell);
    const outgoingEdges = this.mxGraphAttributeService.graph.getOutgoingEdges(cell);
    const incomingEdges = this.mxGraphAttributeService.graph.getIncomingEdges(cell);
    this.mxGraphShapeOverlayService.checkAndAddTopShapeActionIcon(outgoingEdges, modelElement);
    this.mxGraphShapeOverlayService.checkAndAddShapeActionIcon(incomingEdges, modelElement);
    this.mxGraphService.removeCells([cell]);
  }

  private updateModelOfParent(cell: mxgraph.mxCell, value: any) {
    this.mxGraphAttributeService.graph.getIncomingEdges(cell).forEach(cellParent => {
      const modelElementParent = MxGraphHelper.getModelElement(cellParent.source);
      if (modelElementParent) {
        (<Base>modelElementParent).update(value);
      }
    });
  }

  private updateFields(metaModelElement: DefaultConstraint, form: {[key: string]: any}) {
    if (metaModelElement instanceof DefaultFixedPointConstraint) {
      metaModelElement.scale = form.scale;
      metaModelElement.integer = form.integer;
    } else if (metaModelElement instanceof DefaultEncodingConstraint) {
      metaModelElement.value = form.value;
    } else if (metaModelElement instanceof DefaultLanguageConstraint) {
      metaModelElement.languageCode = form.languageCode;
    } else if (metaModelElement instanceof DefaultLengthConstraint) {
      metaModelElement.minValue = form.minValue;
      metaModelElement.maxValue = form.maxValue;
    } else if (metaModelElement instanceof DefaultLocaleConstraint) {
      metaModelElement.localeCode = form.localeCode;
    } else if (metaModelElement instanceof DefaultRangeConstraint) {
      metaModelElement.minValue = form.minValue;
      metaModelElement.maxValue = form.maxValue;
      metaModelElement.upperBoundDefinition = form.upperBoundDefinition;
      metaModelElement.lowerBoundDefinition = form.lowerBoundDefinition;
    } else if (metaModelElement instanceof DefaultRegularExpressionConstraint) {
      metaModelElement.value = form.value;
    }
  }
}
