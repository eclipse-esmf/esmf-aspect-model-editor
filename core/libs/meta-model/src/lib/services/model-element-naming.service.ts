/*
 * Copyright (c) 2022 Robert Bosch Manufacturing Solutions GmbH
 *
 * See the AUTHORS file(s) distributed with this work for
 * additional information regarding authorship.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * SPDX-License-Identifier: MPL-2.0
 */

import {Injectable} from '@angular/core';
import {NamespacesCacheService} from '@ame/cache';
import {BaseMetaModelElement} from '@ame/meta-model';
import {ModelService} from '@ame/rdf/services';

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
