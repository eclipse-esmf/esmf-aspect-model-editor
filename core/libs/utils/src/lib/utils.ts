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
import {DefaultCharacteristic, DefaultProperty, DefaultTrait, NamedElement, RdfModel, Type} from '@esmf/aspect-model-loader';
import {Observable} from 'rxjs';

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
 * Creates a new File instance with the given file content
 *
 * @param content a content to be used in the file
 * @param fileName a name of the file
 * @param mimeType MIME type to be used (default is 'text/plain')
 * @returns new File instance
 */
export const createFile = (content: string | BufferSource, fileName: string, mimeType = 'text/plain'): File => {
  const blob = new Blob([content], {type: mimeType});
  return new File([blob], fileName, {type: mimeType});
};

/**
 * Decodes Buffer-like content back to its string representation
 *
 * @param content data to decode
 * @param encoding is an encoding type to be used while decoding (default is 'utf-8')
 * @returns decoded string
 */
export const decodeText = (content: BufferSource, encoding = 'utf-8'): string => {
  const decoder = new TextDecoder(encoding);
  return decoder.decode(content);
};

/**
 * Sets a unique name for a given model element, ensuring no naming collisions in the provided RDF model.
 *
 * @param {NamedNode} modelElement - The model element whose name should be set.
 * @param {RdfModel} rdfModel - The RDF model in which the element resides.
 * @param {LoadedFilesService} loadedFiles - The service to check for namespace collisions.
 * @param {string} [name] - An optional initial name suggestion for the element.
 */
export const setUniqueElementName = (modelElement: NamedElement, rdfModel: RdfModel, loadedFiles: LoadedFilesService, name?: string) => {
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

/**
 * Get the preferred names locales of a NamedElement
 *
 * @param {NamedElement} element - The NamedElement to get the preferred names locales from.
 * @returns {string[]} - Array of preferred names locales.
 */
export const getPreferredNamesLocales = (element: NamedElement) => [...element.preferredNames.keys()];

/**
 * Get the descriptions locales of a NamedElement
 *
 * @param {NamedElement} element - The NamedElement to get the descriptions locales from.
 * @returns {string[]} - Array of descriptions locales.
 */
export const getDescriptionsLocales = (element: NamedElement) => [...element.descriptions.keys()];

/**
 * Get the data type of a characteristic
 *
 * @param {DefaultCharacteristic} characteristic - The characteristic to get the data type from.
 * @returns {Type} - The data type of the characteristic.
 */
export const getDeepLookupDataType = (characteristic: DefaultCharacteristic): Type => {
  if (characteristic instanceof DefaultTrait) {
    return characteristic?.baseCharacteristic?.dataType;
  }
  return characteristic ? characteristic.dataType : null;
};
