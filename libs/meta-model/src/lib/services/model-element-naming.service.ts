/*
 *  Copyright (c) 2020 Robert Bosch Manufacturing Solutions GmbH, Germany. All rights reserved.
 */

import {Injectable} from '@angular/core';
import {NamespacesCacheService} from '@bame/cache';
import {BaseMetaModelElement} from '@bame/meta-model';
import {ModelService} from '@bame/rdf/services';

@Injectable({
  providedIn: 'root',
})
export class ModelElementNamingService {
  constructor(private namespacesCacheService: NamespacesCacheService, private modelService: ModelService) {}
  /**
   * Creates a new instance of the element and assigns it a default name
   *
   * @param baseMetaModelElement element being created
   * @returns element being created
   */
  resolveMetaModelElement(baseMetaModelElement: BaseMetaModelElement): BaseMetaModelElement {
    return this.namespacesCacheService.getCurrentCachedFile().resolveCachedElement(this.resolveElementNaming(baseMetaModelElement));
  }

  /**
   * Handles assigning the default name of an element.
   * If name exists an incremented index is added at the end.
   * If parentName is not null, it uses the formula "parentName" + "itemTypeName"
   *
   * @param baseMetaModelElement element being created.
   * @param parentName name of the parent element
   * @returns element with filled version,name,urn
   */
  resolveElementNaming(baseMetaModelElement: BaseMetaModelElement, parentName?: string): BaseMetaModelElement {
    const rdfModel = this.modelService.getLoadedAspectModel().rdfModel;

    if (!rdfModel) {
      return null;
    }
    const mainAspectModelUrn = rdfModel.getAspectModelUrn();
    let counter = 1;
    const name = baseMetaModelElement.name;
    baseMetaModelElement.metaModelVersion = rdfModel.BAMM().version;
    const parentNamePrefix = parentName;
    do {
      baseMetaModelElement.name = `${parentNamePrefix || ''}${name}${parentName ? '' : counter++}`;
      parentName = undefined;
    } while (
      this.namespacesCacheService
        .getCurrentCachedFile()
        .getCachedElement<BaseMetaModelElement>(`${mainAspectModelUrn}${baseMetaModelElement.name}`)
    );
    baseMetaModelElement.aspectModelUrn = `${mainAspectModelUrn}${baseMetaModelElement.name}`;
    return baseMetaModelElement;
  }
}
