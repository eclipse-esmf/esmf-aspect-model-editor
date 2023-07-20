import {FiltersService} from '@ame/loader-filters';
import {Aspect, ModelElementNamingService, DefaultProperty} from '@ame/meta-model';
import {MxGraphService} from '@ame/mx-graph';
import {Injectable} from '@angular/core';
import {SingleShapeConnector} from '../models';
import {mxgraph} from 'mxgraph-factory';

@Injectable({
  providedIn: 'root',
})
export class AspectConnectionHandler implements SingleShapeConnector<Aspect> {
  constructor(
    private mxGraphService: MxGraphService,
    private modelElementNamingService: ModelElementNamingService,
    private filtersService: FiltersService
  ) {}

  public connect(aspect: Aspect, source: mxgraph.mxCell) {
    const defaultProperty = DefaultProperty.createInstance();
    const metaModelElement = this.modelElementNamingService.resolveMetaModelElement(defaultProperty);
    const child = this.mxGraphService.renderModelElement(this.filtersService.createNode(metaModelElement, {parent: aspect}));
    aspect.properties.push({property: defaultProperty, keys: {}});
    this.mxGraphService.assignToParent(child, source);
    this.mxGraphService.formatCell(source);
    this.mxGraphService.formatShapes();
  }
}
