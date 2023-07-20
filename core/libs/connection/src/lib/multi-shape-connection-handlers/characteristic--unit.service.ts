import {DefaultCharacteristic, DefaultUnit, DefaultQuantifiable} from '@ame/meta-model';
import {MxGraphService, MxGraphHelper} from '@ame/mx-graph';
import {Injectable} from '@angular/core';
import {MultiShapeConnector} from '../models';
import {mxgraph} from 'mxgraph-factory';

@Injectable({
  providedIn: 'root',
})
export class CharacteristicUnitConnectionHandler implements MultiShapeConnector<DefaultCharacteristic, DefaultUnit> {
  constructor(private mxGraphService: MxGraphService) {}

  public connect(parentMetaModel: DefaultCharacteristic, childMetaModel: DefaultUnit, parent: mxgraph.mxCell, child: mxgraph.mxCell) {
    if (!(parentMetaModel instanceof DefaultQuantifiable)) {
      return;
    }

    if (parentMetaModel.unit && parentMetaModel.unit !== childMetaModel) {
      const obsoleteEdge = this.mxGraphService.graph
        .getOutgoingEdges(parent)
        .find(edge => MxGraphHelper.getModelElement(edge.target) instanceof DefaultUnit);

      const unit = MxGraphHelper.getModelElement<DefaultUnit>(obsoleteEdge.target);
      MxGraphHelper.removeRelation(parentMetaModel, unit);

      if (unit.isPredefined()) {
        this.mxGraphService.removeCells([obsoleteEdge.target], true);
      } else {
        this.mxGraphService.removeCells([obsoleteEdge]);
      }
    }
    parentMetaModel.unit = childMetaModel;
    this.mxGraphService.assignToParent(child, parent);
  }
}
