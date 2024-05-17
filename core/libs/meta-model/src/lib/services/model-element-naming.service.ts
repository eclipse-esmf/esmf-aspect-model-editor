/*
 * Copyright (c) 2024 Robert Bosch Manufacturing Solutions GmbH
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
import {RdfService} from '@ame/rdf/services';

@Injectable({
  providedIn: 'root'
})
export class ModelElementNamingService {
  constructor(
    private namespacesCacheService: NamespacesCacheService,
    private rdfService: RdfService
  ) {}
  /**
   * Creates a new instance of the element and assigns it a default name
   *
   * @param baseMetaModelElement element being created
   * @returns element being created
   */
  resolveMetaModelElement(baseMetaModelElement: BaseMetaModelElement): BaseMetaModelElement {
    return this.namespacesCacheService.currentCachedFile.resolveElement(this.resolveElementNaming(baseMetaModelElement));
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
  resolveElementNaming<T extends BaseMetaModelElement = BaseMetaModelElement>(baseMetaModelElement: T, parentName?: string): T {
    const rdfModel = this.rdfService.currentRdfModel;
    const elements = {};

    if (!rdfModel) {
      return null;
    }

    const mainAspectModelUrn = rdfModel.getAspectModelUrn();
    for (const extRdfModel of this.rdfService.externalRdfModels) {
      if (!Object.values(extRdfModel.getPrefixes()).includes(mainAspectModelUrn)) {
        continue;
      }

      for (const subject of extRdfModel.store.getSubjects(null, null, null)) {
        elements[subject.value] = true;
      }
    }

    let counter = 1;
    const name = baseMetaModelElement.name;
    baseMetaModelElement.metaModelVersion = rdfModel.SAMM().version;
    const parentNamePrefix = parentName;
    do {
      baseMetaModelElement.name = `${parentNamePrefix || ''}${name}${parentName ? '' : counter++}`;
      parentName = undefined;
    } while (
      elements[`${mainAspectModelUrn}${baseMetaModelElement.name}`] ||
      this.namespacesCacheService.currentCachedFile.getElement<BaseMetaModelElement>(`${mainAspectModelUrn}${baseMetaModelElement.name}`)
    );
    baseMetaModelElement.aspectModelUrn = `${mainAspectModelUrn}${baseMetaModelElement.name}`;
    return baseMetaModelElement;
  }
}
