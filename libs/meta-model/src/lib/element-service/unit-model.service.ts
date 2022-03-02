import {Injectable} from '@angular/core';
import {mxgraph} from 'mxgraph-factory';

import {BaseModelService} from './base-model-service';
import {NamespacesCacheService} from '@bame/cache';
import {MxGraphAttributeService, MxGraphHelper, MxGraphService, MxGraphShapeOverlayService, UnitRenderService} from '@bame/mx-graph';
import {BaseMetaModelElement, DefaultQuantityKind, DefaultUnit} from '@bame/meta-model';
import {ModelService} from '@bame/rdf/services';
import {Bammu} from '@bame/vocabulary';

declare const bammuDefinition: any;

@Injectable({providedIn: 'root'})
export class UnitModelService extends BaseModelService {
  private get bammu(): Bammu {
    return this.modelService.getLoadedAspectModel().rdfModel.BAMMU();
  }

  constructor(
    namespacesCacheService: NamespacesCacheService,
    modelService: ModelService,
    private mxGraphShapeOverlayService: MxGraphShapeOverlayService,
    private mxGraphAttributeService: MxGraphAttributeService,
    private mxGraphService: MxGraphService,
    private unitRenderer: UnitRenderService
  ) {
    super(namespacesCacheService, modelService);
  }

  isApplicable(metaModelElement: BaseMetaModelElement): boolean {
    return metaModelElement instanceof DefaultUnit;
  }

  update(cell: mxgraph.mxCell, form: {[key: string]: any}) {
    const metaModelElement: DefaultUnit = MxGraphHelper.getModelElement(cell);
    super.update(cell, form);
    metaModelElement.referenceUnit = form.referenceUnit;
    metaModelElement.code = form.code;
    metaModelElement.conversionFactor = form.conversionFactor;
    metaModelElement.numericConversionFactor = form.numericConversionFactor;
    metaModelElement.quantityKinds = form.quanitKinds;
    metaModelElement.symbol = form.symbol;

    // update quantity kind
    metaModelElement.quantityKinds = form.quantityKindsChipList.map(qk => {
      const urn = `${this.bammu.getNamespace()}${qk}`;
      const quantityKind = bammuDefinition.quantityKinds[qk];
      return new DefaultQuantityKind(metaModelElement.metaModelVersion, urn, qk, quantityKind.label);
    });
    this.unitRenderer.update({cell, form});
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
}
