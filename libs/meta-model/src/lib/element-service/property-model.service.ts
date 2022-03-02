import {Injectable} from '@angular/core';
import {NamespacesCacheService} from '@bame/cache';
import {mxgraph} from 'mxgraph-factory';
import {BaseModelService} from './base-model-service';
import {EntityValueService} from '@bame/editor';
import {MxGraphHelper, MxGraphService, PropertyRenderService} from '@bame/mx-graph';
import {BaseMetaModelElement, DefaultProperty} from '@bame/meta-model';
import {ModelService} from '@bame/rdf/services';
import {DefaultStructuredValue} from '../aspect-meta-model';
import {LanguageSettingsService} from '@bame/settings-dialog';

@Injectable({providedIn: 'root'})
export class PropertyModelService extends BaseModelService {
  constructor(
    namespacesCacheService: NamespacesCacheService,
    modelService: ModelService,
    private entityValueService: EntityValueService,
    private mxGraphService: MxGraphService,
    private languageSettingsService: LanguageSettingsService,
    private propertyRenderer: PropertyRenderService
  ) {
    super(namespacesCacheService, modelService);
  }

  isApplicable(metaModelElement: BaseMetaModelElement): boolean {
    return metaModelElement instanceof DefaultProperty;
  }

  update(cell: mxgraph.mxCell, form: {[key: string]: any}) {
    const metaModelElement: DefaultProperty = MxGraphHelper.getModelElement(cell);
    super.update(cell, form);
    metaModelElement.exampleValue = form.exampleValue;

    this.propertyRenderer.update({cell});
  }

  delete(cell: mxgraph.mxCell) {
    const modelElement: DefaultProperty = MxGraphHelper.getModelElement(cell);

    const parents = this.mxGraphService.resolveParents(cell);
    for (const parent of parents) {
      const parentModel = MxGraphHelper.getModelElement(parent);
      if (parentModel instanceof DefaultStructuredValue) {
        parentModel.delete(modelElement);
        MxGraphHelper.updateLabel(parent, this.mxGraphService.graph, this.languageSettingsService);
      }
    }

    super.delete(cell);
    this.entityValueService.onPropertyRemove(modelElement, () => {
      this.mxGraphService.removeCells([cell]);
    });
  }
}
