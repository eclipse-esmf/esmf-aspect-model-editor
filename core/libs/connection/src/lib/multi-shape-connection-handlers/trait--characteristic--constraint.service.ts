import {DefaultTrait, DefaultCharacteristic, DefaultConstraint} from '@ame/meta-model';
import {MxGraphService} from '@ame/mx-graph';
import {Injectable} from '@angular/core';
import {MultiShapeConnector} from '../models';
import {mxgraph} from 'mxgraph-factory';

@Injectable({
  providedIn: 'root',
})
export class TraitWithCharacteristicOrConstraintConnectionHandler
  implements MultiShapeConnector<DefaultTrait, DefaultCharacteristic | DefaultConstraint>
{
  constructor(private mxGraphService: MxGraphService) {}

  public connect(parentMetaModel: DefaultTrait, childMetaModel: DefaultCharacteristic, parent: mxgraph.mxCell, child: mxgraph.mxCell) {
    parentMetaModel.update(childMetaModel);
    this.mxGraphService.assignToParent(child, parent);
  }
}
