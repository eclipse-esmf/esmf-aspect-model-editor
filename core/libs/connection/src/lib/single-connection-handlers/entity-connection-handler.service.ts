import {EntityValueService} from '@ame/editor';
import {FiltersService} from '@ame/loader-filters';
import {Entity, ModelElementNamingService, DefaultProperty, DefaultEntity} from '@ame/meta-model';
import {MxGraphService, MxGraphHelper} from '@ame/mx-graph';
import {Injectable} from '@angular/core';
import {SingleShapeConnector} from '../models';
import {mxgraph} from 'mxgraph-factory';

@Injectable({
  providedIn: 'root',
})
export class EntityConnectionHandler implements SingleShapeConnector<Entity> {
  constructor(
    private mxGraphService: MxGraphService,
    private modelElementNamingService: ModelElementNamingService,
    private entityValueService: EntityValueService,
    private filtersService: FiltersService
  ) {}

  public connect(entity: Entity, source: mxgraph.mxCell) {
    const defaultProperty = DefaultProperty.createInstance();
    const metaModelElement = this.modelElementNamingService.resolveMetaModelElement(defaultProperty);
    const child = this.mxGraphService.renderModelElement(
      this.filtersService.createNode(metaModelElement, {parent: MxGraphHelper.getModelElement(source)})
    );
    const overWrittenProperty = {property: defaultProperty, keys: {}};
    entity.properties.push(overWrittenProperty);
    this.entityValueService.onNewProperty(overWrittenProperty, entity as DefaultEntity);
    this.mxGraphService.assignToParent(child, source);
    this.mxGraphService.formatCell(source);
    this.mxGraphService.formatShapes();
  }
}
