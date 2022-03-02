import {Injectable} from '@angular/core';
import {mxgraph} from 'mxgraph-factory';
import {NamespacesCacheService} from '@bame/cache';
import {MxGraphAttributeService, MxGraphHelper, MxGraphService, MxGraphShapeOverlayService} from '@bame/mx-graph';
import {BaseMetaModelElement, BaseModelService, DefaultQuantifiable, DefaultUnit} from '@bame/meta-model';
import {ModelService} from '@bame/rdf/services';

@Injectable({providedIn: 'root'})
export class QuantifiableModelService extends BaseModelService {
  constructor(
    namespacesCacheService: NamespacesCacheService,
    modelService: ModelService,
    private mxGraphShapeOverlayService: MxGraphShapeOverlayService,
    private mxGraphAttributeService: MxGraphAttributeService,
    private mxGraphService: MxGraphService
  ) {
    super(namespacesCacheService, modelService);
  }

  isApplicable(metaModelElement: BaseMetaModelElement): boolean {
    return metaModelElement instanceof DefaultQuantifiable;
  }

  update(cell: mxgraph.mxCell, form: {[key: string]: any}) {
    const metaModelElement: DefaultQuantifiable = MxGraphHelper.getModelElement(cell);
    if (!form.unit) {
      metaModelElement.unit = DefaultUnit.createInstance();
    } else {
      metaModelElement.unit = form.unit;
    }
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
