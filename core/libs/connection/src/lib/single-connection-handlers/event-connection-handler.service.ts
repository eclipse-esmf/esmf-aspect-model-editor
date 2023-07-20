import {FiltersService} from '@ame/loader-filters';
import {ModelElementNamingService, DefaultProperty, DefaultEvent} from '@ame/meta-model';
import {MxGraphService, MxGraphHelper} from '@ame/mx-graph';
import {Injectable} from '@angular/core';
import {SingleShapeConnector} from '../models';
import {mxgraph} from 'mxgraph-factory';

@Injectable({
  providedIn: 'root',
})
export class EventConnectionHandler implements SingleShapeConnector<DefaultEvent> {
  constructor(
    private mxGraphService: MxGraphService,
    private modelElementNamingService: ModelElementNamingService,
    private filtersService: FiltersService
  ) {}

  public connect(event: DefaultEvent, source: mxgraph.mxCell) {
    const defaultProperty = DefaultProperty.createInstance();
    const metaModelElement = this.modelElementNamingService.resolveMetaModelElement(defaultProperty);
    const child = this.mxGraphService.renderModelElement(
      this.filtersService.createNode(metaModelElement, {parent: MxGraphHelper.getModelElement(source)})
    );
    const overWrittenProperty = {property: defaultProperty, keys: {}};
    event.parameters.push(overWrittenProperty);
    this.mxGraphService.assignToParent(child, source);
    this.mxGraphService.formatCell(source);
    this.mxGraphService.formatShapes();
  }
}
