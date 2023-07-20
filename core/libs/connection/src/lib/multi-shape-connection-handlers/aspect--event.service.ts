import {DefaultAspect, DefaultEvent} from '@ame/meta-model';
import {MxGraphService} from '@ame/mx-graph';
import {Injectable} from '@angular/core';
import {MultiShapeConnector} from '../models';
import {mxgraph} from 'mxgraph-factory';

@Injectable({
  providedIn: 'root',
})
export class AspectEventConnectionHandler implements MultiShapeConnector<DefaultAspect, DefaultEvent> {
  constructor(private mxGraphService: MxGraphService) {}

  public connect(parentMetaModel: DefaultAspect, childMetaModel: DefaultEvent, parent: mxgraph.mxCell, child: mxgraph.mxCell) {
    if (!parentMetaModel.events.find(operation => operation === childMetaModel)) {
      parentMetaModel.events.push(childMetaModel);
    }
    this.mxGraphService.assignToParent(child, parent);
  }
}
