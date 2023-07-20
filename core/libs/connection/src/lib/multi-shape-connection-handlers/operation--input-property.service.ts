import {DefaultOperation, DefaultProperty} from '@ame/meta-model';
import {MxGraphService} from '@ame/mx-graph';
import {Injectable} from '@angular/core';
import {MultiShapeConnectorWithProperty} from '../models';
import {mxgraph} from 'mxgraph-factory';

@Injectable({
  providedIn: 'root',
})
export class OperationPropertyInputConnectionHandler implements MultiShapeConnectorWithProperty<DefaultOperation, DefaultProperty> {
  constructor(private mxGraphService: MxGraphService) {}

  public connect(parentMetaModel: DefaultOperation, childMetaModel: DefaultProperty, parent: mxgraph.mxCell, child: mxgraph.mxCell) {
    const isInputAlreadyDefined = parentMetaModel.input.some(value => value.property.aspectModelUrn === childMetaModel.aspectModelUrn);
    if (!isInputAlreadyDefined) {
      parentMetaModel.input.push({property: childMetaModel, keys: {}});
    }
    this.mxGraphService.assignToParent(child, parent);
  }
}
