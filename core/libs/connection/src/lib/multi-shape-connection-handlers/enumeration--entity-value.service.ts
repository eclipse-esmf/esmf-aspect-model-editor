import {DefaultEnumeration, DefaultEntityValue} from '@ame/meta-model';
import {MxGraphService, MxGraphHelper} from '@ame/mx-graph';
import {Injectable} from '@angular/core';
import {mxgraph} from 'mxgraph-factory';
import {MultiShapeConnector} from '../models';

@Injectable({
  providedIn: 'root',
})
export class EnumerationEntityValueConnectionHandler implements MultiShapeConnector<DefaultEnumeration, DefaultEntityValue> {
  constructor(private mxGraphService: MxGraphService) {}

  connect(parentMetaModel: DefaultEnumeration, childMetaModel: DefaultEntityValue, parent: mxgraph.mxCell, child: mxgraph.mxCell): void {
    childMetaModel.addParent(parentMetaModel);
    parentMetaModel.values.push(childMetaModel);

    this.mxGraphService.graph.labelChanged(parent, MxGraphHelper.createPropertiesLabel(parent));
    this.mxGraphService.assignToParent(child, parent);
  }
}
