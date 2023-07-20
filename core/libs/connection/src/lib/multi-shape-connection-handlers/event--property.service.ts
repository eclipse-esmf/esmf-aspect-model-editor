import {DefaultEvent, DefaultProperty} from '@ame/meta-model';
import {MxGraphService} from '@ame/mx-graph';
import {Injectable} from '@angular/core';
import {MultiShapeConnector} from '../models';
import {mxgraph} from 'mxgraph-factory';

@Injectable({
  providedIn: 'root',
})
export class EventPropertyConnectionHandler implements MultiShapeConnector<DefaultEvent, DefaultProperty> {
  constructor(private mxGraphService: MxGraphService) {}

  public connect(parentMetaModel: DefaultEvent, childMetaModel: DefaultProperty, parent: mxgraph.mxCell, child: mxgraph.mxCell) {
    if (!parentMetaModel.parameters.find(param => param.property.aspectModelUrn === childMetaModel.aspectModelUrn)) {
      parentMetaModel.parameters.push({property: childMetaModel, keys: {}});
    }
    this.mxGraphService.assignToParent(child, parent);
  }
}
