import {DefaultStructuredValue, DefaultProperty} from '@ame/meta-model';
import {MxGraphService, MxGraphAttributeService, MxGraphHelper} from '@ame/mx-graph';
import {Injectable} from '@angular/core';
import {MultiShapeConnector} from '../models';
import {mxgraph} from 'mxgraph-factory';

@Injectable({
  providedIn: 'root',
})
export class StructuredValueCharacteristicPropertyConnectionHandler
  implements MultiShapeConnector<DefaultStructuredValue, DefaultProperty>
{
  constructor(private mxGraphService: MxGraphService, private mxGraphAttributeService: MxGraphAttributeService) {}

  public connect(
    _parentMetaModel: DefaultStructuredValue,
    _childMetaModel: DefaultProperty,
    first: mxgraph.mxCell,
    second: mxgraph.mxCell
  ) {
    const hasPropertyParent = this.mxGraphAttributeService.graph
      .getIncomingEdges(first)
      .some(edge => MxGraphHelper.getModelElement(edge.source) instanceof DefaultProperty);

    if (!hasPropertyParent) {
      this.mxGraphService.assignToParent(first, second);
    } else {
      this.mxGraphService.assignToParent(second, first);
    }

    this.mxGraphService.formatShapes();
  }
}
