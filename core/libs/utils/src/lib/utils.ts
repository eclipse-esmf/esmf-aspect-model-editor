/*
 * Copyright (c) 2023 Robert Bosch Manufacturing Solutions GmbH
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

import {Observable} from 'rxjs';
import {BaseMetaModelElement, DefaultAbstractProperty, DefaultProperty} from '@ame/meta-model';
import {RdfModel} from '@ame/rdf/utils';
import {NamespacesCacheService} from '@ame/cache';

/**
 * Reads file via FileReader
 *
 * @param file specific file retrieved from a FileList object
 * @returns Observable with file content represented as a string
 * (completes automatically after receiving file's content)
 */
export const readFile = (file: File): Observable<string> => {
  return new Observable(observer => {
    const reader = new FileReader();
    try {
      reader.onload = () => {
        observer.next(reader.result.toString());
        observer.complete();
      };
      reader.readAsText(file);
    } catch (error) {
      console.error(`An error occurred while attempting to read "${file.name}" file:`, error);
      reader.onerror = () => observer.error(error);
    }
  });
};

/**
 * Sets a unique name for a given model element, ensuring no naming collisions in the provided RDF model.
 *
 * @param {BaseMetaModelElement} modelElement - The model element whose name should be set.
 * @param {RdfModel} rdfModel - The RDF model in which the element resides.
 * @param {NamespacesCacheService} namespaceCacheService - The service to check for namespace collisions.
 * @param {string} [name] - An optional initial name suggestion for the element.
 */
export const setUniqueElementName = (
  modelElement: BaseMetaModelElement,
  rdfModel: RdfModel,
  namespaceCacheService: NamespacesCacheService,
  name?: string
) => {
  name = name || `${modelElement.className}`.replace('Default', '');

  if (modelElement instanceof DefaultProperty || modelElement instanceof DefaultAbstractProperty) {
    name = name[0].toLowerCase() + name.substring(1);
  }

  let counter = 1;
  let tmpAspectModelUrnName: string = null;
  let tmpName: string = null;

  do {
    tmpName = `${name}${counter++}`;
    tmpAspectModelUrnName = `${rdfModel.getAspectModelUrn()}${tmpName}`;
  } while (namespaceCacheService.getElementFromNamespace(rdfModel.getAspectModelUrn(), tmpAspectModelUrnName));

  modelElement.aspectModelUrn = tmpAspectModelUrnName;
  modelElement.name = tmpName;
};

/**
 * Extracts the namespace part from a given URN.
 *
 * @param {string} urn - The Uniform Resource Name (URN) from which to extract the namespace.
 * @returns {string} The extracted namespace from the URN. If the URN doesn't contain a '#', the entire URN is returned.
 */
export const extractNamespace = (urn: string) => urn.split('#')[0];

/**
 * Remove comments from an Aspect Model
 *
 * @param {string} aspectModel - The Aspect Model as a string.
 * @returns {string} - Aspect Model without comments.
 */
export const removeCommentsFromTTL = (aspectModel: string): string => {
  return aspectModel
    .split('\n')
    .filter(line => !line.trim().startsWith('#'))
    .join('\n');
};
