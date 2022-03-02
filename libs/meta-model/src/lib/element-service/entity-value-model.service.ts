import {Injectable} from '@angular/core';
import {NamespacesCacheService} from '@bame/cache';
import {mxgraph} from 'mxgraph-factory';
import {BaseMetaModelElement, DefaultEntityValue, EntityValueProperty} from '@bame/meta-model';
import {BaseModelService} from './base-model-service';
import {EntityValueRenderService, MxGraphHelper} from '@bame/mx-graph';
import {ModelService} from '@bame/rdf/services';

@Injectable({providedIn: 'root'})
export class EntityValueModelService extends BaseModelService {
  constructor(
    namespacesCacheService: NamespacesCacheService,

    modelService: ModelService,
    private entityValueRenderService: EntityValueRenderService
  ) {
    super(namespacesCacheService, modelService);
  }

  isApplicable(metaModelElement: BaseMetaModelElement): boolean {
    return metaModelElement instanceof DefaultEntityValue;
  }

  update(cell: mxgraph.mxCell, form: {[key: string]: any}) {
    const metaModelElement: DefaultEntityValue = MxGraphHelper.getModelElement(cell);
    // update name
    const aspectModelUrn = this.modelService.getLoadedAspectModel().rdfModel.getAspectModelUrn();
    this.currentCachedFile.updateCachedElementKey(`${aspectModelUrn}${metaModelElement.name}`, `${aspectModelUrn}${form.name}`);
    metaModelElement.name = form.name;
    metaModelElement.aspectModelUrn = `${aspectModelUrn}${form.name}`;

    // in case some entity values are no longer assigned as property values to the current entity, remove them from the model
    this.removeObsoleteEntityValues(metaModelElement);

    const newEntityValues = form.newEntityValues;
    // check if there are any new entity values to add to the cache service
    if (newEntityValues) {
      this.addNewEntityValues(newEntityValues);
    }

    this.updatePropertiesEntityValues(metaModelElement, form);
    this.entityValueRenderService.update({cell, form});
  }

  delete(cell: mxgraph.mxCell) {
    super.delete(cell);
    this.entityValueRenderService.delete(cell);
  }

  private updatePropertiesEntityValues(metaModelElement: DefaultEntityValue, form: {[key: string]: any}) {
    const newPropertyValues = form.entityValueProperties;
    metaModelElement.properties.forEach((property: EntityValueProperty) => {
      property.value = newPropertyValues[property.key.property.name];
    });
  }

  private removeObsoleteEntityValues(metaModelElement: DefaultEntityValue) {
    metaModelElement.properties.forEach((property: EntityValueProperty) => {
      if (property.value instanceof DefaultEntityValue && !property.value.parents?.length) {
        this.deleteEntityValue(property.value);
      }
    });
  }
}
