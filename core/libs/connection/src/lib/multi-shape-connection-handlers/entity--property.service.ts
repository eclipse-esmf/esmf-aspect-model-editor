import {EntityValueService} from '@ame/editor';
import {DefaultEntity, DefaultProperty} from '@ame/meta-model';
import {MxGraphService} from '@ame/mx-graph';
import {Injectable} from '@angular/core';
import {MultiShapeConnector} from '../models';
import {mxgraph} from 'mxgraph-factory';

@Injectable({
  providedIn: 'root',
})
export class EntityPropertyConnectionHandler implements MultiShapeConnector<DefaultEntity, DefaultProperty> {
  constructor(private mxGraphService: MxGraphService, private entityValueService: EntityValueService) {}

  public connect(parentMetaModel: DefaultEntity, childMetaModel: DefaultProperty, parentCell: mxgraph.mxCell, childCell: mxgraph.mxCell) {
    if (!parentMetaModel.properties.find(({property}) => property.aspectModelUrn === childMetaModel.aspectModelUrn)) {
      const overWrittenProperty = {property: childMetaModel, keys: {}};
      parentMetaModel.properties.push(overWrittenProperty);
      this.entityValueService.onNewProperty(overWrittenProperty, parentMetaModel);
    }
    this.mxGraphService.assignToParent(childCell, parentCell);
  }
}
