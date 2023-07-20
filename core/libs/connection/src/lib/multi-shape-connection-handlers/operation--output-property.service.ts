import {DefaultOperation, DefaultProperty} from '@ame/meta-model';
import {MxGraphService, MxGraphAttributeService} from '@ame/mx-graph';
import {Injectable} from '@angular/core';
import {MultiShapeConnectorWithProperty} from '../models';
import {mxgraph} from 'mxgraph-factory';

@Injectable({
  providedIn: 'root',
})
export class OperationPropertyOutputConnectionHandler implements MultiShapeConnectorWithProperty<DefaultOperation, DefaultProperty> {
  constructor(private mxGraphService: MxGraphService, private mxGraphAttributeService: MxGraphAttributeService) {}

  public connect(parentMetaModel: DefaultOperation, childMetaModel: DefaultProperty, parent: mxgraph.mxCell, child: mxgraph.mxCell) {
    parentMetaModel.output = {property: childMetaModel, keys: {}};
    this.mxGraphService.assignToParent(child, parent);
  }
}
