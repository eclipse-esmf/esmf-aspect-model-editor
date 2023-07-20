import {DefaultAspect, DefaultProperty, DefaultOperation} from '@ame/meta-model';
import {MxGraphService} from '@ame/mx-graph';
import {Injectable} from '@angular/core';
import {MultiShapeConnector} from '../models';
import {mxgraph} from 'mxgraph-factory';

@Injectable({
  providedIn: 'root',
})
export class AspectPropertyConnectionHandler implements MultiShapeConnector<DefaultAspect, DefaultProperty | DefaultOperation> {
  constructor(private mxGraphService: MxGraphService) {}

  public connect(
    parentMetaModel: DefaultAspect,
    childMetaModel: DefaultProperty | DefaultOperation,
    parent: mxgraph.mxCell,
    child: mxgraph.mxCell
  ) {
    if (childMetaModel instanceof DefaultProperty && !parentMetaModel.properties.find(({property}) => property === childMetaModel)) {
      parentMetaModel.properties.push({property: childMetaModel, keys: {}});
    } else if (childMetaModel instanceof DefaultOperation && !parentMetaModel.operations.find(operation => operation === childMetaModel)) {
      parentMetaModel.operations.push(childMetaModel);
    }
    this.mxGraphService.assignToParent(child, parent);
  }
}
