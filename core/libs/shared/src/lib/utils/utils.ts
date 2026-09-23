/*
 * Copyright (c) 2026 Robert Bosch Manufacturing Solutions GmbH
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

import {DefaultProperty, NamedElement, RdfModel} from '@esmf/aspect-model-loader';
import {
  createFile,
  decodeText,
  extractNamespace,
  getDeepLookupDataType,
  getDescriptionsLocales,
  getPreferredNamesLocales,
  isVersionOutdated,
  readFile,
} from '../common';
import {ILoadedFilesService} from '../contracts';

export {
  createFile,
  decodeText,
  extractNamespace,
  getDeepLookupDataType,
  getDescriptionsLocales,
  getPreferredNamesLocales,
  isVersionOutdated,
  readFile,
};

/**
 * Sets a unique name for a given model element, ensuring no naming collisions in the provided RDF model.
 *
 * @param {NamedNode} modelElement - The model element whose name should be set.
 * @param {RdfModel} rdfModel - The RDF model in which the element resides.
 * @param {ILoadedFilesService} loadedFiles - The service to check for namespace collisions.
 * @param {string} [name] - An optional initial name suggestion for the element.
 */
export const setUniqueElementName = (modelElement: NamedElement, rdfModel: RdfModel, loadedFiles: ILoadedFilesService, name?: string) => {
  name = name || `${modelElement.className}`.replace('Default', '');

  if (modelElement instanceof DefaultProperty) {
    name = name[0].toLowerCase() + name.substring(1);
  }

  let counter = 1;
  let tmpAspectModelUrnName: string = null;
  let tmpName: string = null;

  do {
    tmpName = `${name}${counter++}`;
    tmpAspectModelUrnName = `${rdfModel.getAspectModelUrn()}${tmpName}`;
  } while (loadedFiles.getElement(tmpAspectModelUrnName));

  modelElement.aspectModelUrn = tmpAspectModelUrnName;
  modelElement.name = tmpName;
};
