import {Injectable} from '@angular/core';
import {NamespacesCacheService} from '@bame/cache';
import {BaseModelService} from './base-model-service';
import {BaseMetaModelElement, DefaultAspect, OverWrittenPropertyKeys} from '@bame/meta-model';
import {ModelService} from '@bame/rdf/services';
import {mxgraph} from 'mxgraph-factory';
import {AspectRenderService, MxGraphHelper} from '@bame/mx-graph';
import {Title} from '@angular/platform-browser';
import {NotificationsService} from '@bame/shared';

@Injectable({providedIn: 'root'})
export class AspectModelService extends BaseModelService {
  constructor(
    namespacesCacheService: NamespacesCacheService,
    modelService: ModelService,
    private notificationsService: NotificationsService,
    private aspectRenderer: AspectRenderService,
    private titleService: Title
  ) {
    super(namespacesCacheService, modelService);
  }

  isApplicable(metaModelElement: BaseMetaModelElement): boolean {
    return metaModelElement instanceof DefaultAspect;
  }

  update(cell: mxgraph.mxCell, form: {[key: string]: any}) {
    const metaModelElement: DefaultAspect = MxGraphHelper.getModelElement(cell);
    super.update(cell, form);

    if (form.editedProperties) {
      for (const {property, keys} of metaModelElement.properties) {
        const newKeys: OverWrittenPropertyKeys = form.editedProperties[property.aspectModelUrn];
        keys.notInPayload = newKeys.notInPayload;
        keys.optional = newKeys.optional;
        keys.payloadName = newKeys.payloadName;
      }
    }

    this.aspectRenderer.update({cell});
    this.titleService.setTitle(`${metaModelElement?.aspectModelUrn}.ttl - Aspect Model Editor`);
  }

  delete() {
    // Aspect model cannot be deleted
    this.notificationsService.info('The Aspect can`t be deleted');
  }
}
