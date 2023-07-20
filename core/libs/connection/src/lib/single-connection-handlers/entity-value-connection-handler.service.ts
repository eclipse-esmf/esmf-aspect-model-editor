import {FiltersService} from '@ame/loader-filters';
import {DefaultEntityValue, DefaultEnumeration} from '@ame/meta-model';
import {MxGraphService, MxGraphHelper, EdgeStyles} from '@ame/mx-graph';
import {Injectable} from '@angular/core';
import {SingleShapeConnector} from '../models';
import {mxgraph} from 'mxgraph-factory';

@Injectable({
  providedIn: 'root',
})
export class EntityValueConnectionHandler implements SingleShapeConnector<DefaultEntityValue> {
  constructor(private mxGraphService: MxGraphService, private filtersService: FiltersService) {}

  public connect(entityValue: DefaultEntityValue, source: mxgraph.mxCell) {
    const child = this.mxGraphService.renderModelElement(
      this.filtersService.createNode(entityValue, {parent: MxGraphHelper.getModelElement(source)})
    );

    // connect: EntityValue - Enumeration
    if (MxGraphHelper.getModelElement(source) instanceof DefaultEnumeration) {
      this.mxGraphService.assignToParent(child, source);
    }
    const entityCell = this.mxGraphService.resolveCellByModelElement(entityValue.entity);

    // connect: EntityValue - Entity
    this.mxGraphService.assignToParent(entityCell, child, EdgeStyles.entityValueEntityEdge);
    this.mxGraphService.formatCell(source);
    this.mxGraphService.formatShapes();
  }
}
