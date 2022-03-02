import {Injectable} from '@angular/core';
import {NamespacesCacheService} from '@bame/cache';
import {BaseModelService} from './base-model-service';
import {BaseMetaModelElement, DefaultEvent} from '@bame/meta-model';
import {ModelService} from '@bame/rdf/services';
import {mxgraph} from 'mxgraph-factory';
import {EventRenderService, MxGraphService} from '@bame/mx-graph';

@Injectable({providedIn: 'root'})
export class EventModelService extends BaseModelService {
  constructor(
    namespacesCacheService: NamespacesCacheService,
    modelService: ModelService,
    private mxGraphService: MxGraphService,
    private aspectRenderer: EventRenderService,
  ) {
    super(namespacesCacheService, modelService);
  }

  isApplicable(metaModelElement: BaseMetaModelElement): boolean {
    return metaModelElement instanceof DefaultEvent;
  }

  update(cell: mxgraph.mxCell, form: {[key: string]: any}) {
    super.update(cell, form);
    this.aspectRenderer.update({cell});
  }

  delete(cell: mxgraph.mxCell) {
    super.delete(cell);
    this.mxGraphService.removeCells([cell]);
  }
}
