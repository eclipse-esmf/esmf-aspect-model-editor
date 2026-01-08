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

import {LoadedFilesService} from '@ame/cache';
import {inject, Injectable} from '@angular/core';
import {NamedElement} from '@esmf/aspect-model-loader';

@Injectable({providedIn: 'root'})
export class ModelElementNamingService {
  private loadedFiles = inject(LoadedFilesService);

  /**
   * Creates a new instance of the element and assigns it a default name
   *
   * @param NamedElement element being created
   * @returns element being created
   */
  resolveMetaModelElement<T extends NamedElement>(element: T, cached?: boolean): T {
    for (const child of element.children) {
      if (!child.aspectModelUrn) {
        if (cached) this.loadedFiles.currentLoadedFile.cachedFile.resolveInstance(this.resolveElementNaming(child));
        else this.resolveElementNaming(child);
      }
    }
    return cached
      ? this.loadedFiles.currentLoadedFile.cachedFile.resolveInstance(this.resolveElementNaming(element))
      : this.resolveElementNaming(element);
  }

  /**
   * Handles assigning the default name of an element.
   * If name exists an incremented index is added at the end.
   * If parentName is not null, it uses the formula "parentName" + "itemTypeName"
   *
   * @param element element being created.
   * @param parentName name of the parent element
   * @returns element with filled version, name, urn
   */
  resolveElementNaming<T extends NamedElement = NamedElement>(element: T, parentName?: string): T {
    const {rdfModel, namespace} = this.loadedFiles.currentLoadedFile;
    const elements = {};

    if (!rdfModel) {
      return null;
    }

    const mainAspectModelUrn = `urn:samm:${namespace}#`;
    for (const extRdfModel of this.loadedFiles.externalFiles.map(f => f.rdfModel)) {
      if (!Object.values(extRdfModel.getPrefixes()).includes(mainAspectModelUrn)) {
        continue;
      }

      for (const subject of extRdfModel.store.getSubjects(null, null, null)) {
        elements[subject.value] = true;
      }
    }

    let counter = 1;
    const name = element.name;
    element.metaModelVersion = rdfModel.samm.version;
    const parentNamePrefix = parentName;
    do {
      element.name = `${parentNamePrefix || ''}${name}${parentName ? '' : counter++}`;
      parentName = undefined;
    } while (
      elements[`${mainAspectModelUrn}${element.name}`] ||
      this.loadedFiles.currentLoadedFile.cachedFile.get<NamedElement>(`${mainAspectModelUrn}${element.name}`)
    );
    element.aspectModelUrn = `${mainAspectModelUrn}${element.name}`;
    return element;
  }
}
