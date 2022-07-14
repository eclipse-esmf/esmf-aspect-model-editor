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

import {SidebarService} from '@ame/shared';
import {Injectable} from '@angular/core';
import {CachedFile} from './cached-file';
import {Base} from '@ame/meta-model';

@Injectable({
  providedIn: 'root',
})
export class NamespacesCacheService {
  private namespaces = new Map<string, Map<string, CachedFile>>();
  private currentCachedFile: CachedFile;

  constructor(public sidebarService: SidebarService) {}

  /**
   * Return an array with all file from all namespaces when `namespace` is not provided
   * Else, the function return all files from the specified namespace
   *
   * @returns CachedFile[]
   */
  getFiles(namespace: string = ''): CachedFile[] {
    return Array.from(this.namespaces.entries())
      .filter(([existingNamespace]) => existingNamespace.includes(namespace || ''))
      .reduce((acc, [, mapFile]) => [...acc, ...mapFile.values()], []);
  }

  /**
   * Gets the map from this namespace
   *
   * @param namespaceKey - namespace name
   */
  getNamespace(namespaceKey: string): Map<string, CachedFile> {
    return this.namespaces.get(namespaceKey);
  }

  /**
   * Adds an empty CachedFile to path Namespace -> File
   *
   * @param namespaceKey - namespace name
   * @param fileKey - fileName
   */
  addFile(namespaceKey: string, fileKey: string): CachedFile {
    let namespace = this.namespaces.get(namespaceKey);
    if (!namespace) {
      namespace = new Map<string, CachedFile>();
      namespace.set(fileKey, new CachedFile());
      this.namespaces.set(namespaceKey, namespace);
      return namespace.get(fileKey);
    }

    const cachedFile = namespace.get(fileKey);
    if (!cachedFile) {
      namespace.set(fileKey, new CachedFile());
      return namespace.get(fileKey);
    }

    return cachedFile;
  }

  /**
   * Gets the instance of CachedFile for path: `Namespace -> File`
   *
   * @param filePath array which contains 2 strings: `[namespace, fileName]`
   */
  getFile(filePath: [string, string]): CachedFile {
    return Array.isArray(filePath) && filePath.length === 2 ? this.namespaces?.get(filePath[0])?.get(filePath[1]) : null;
  }

  /**
   * Return the file the user is working on
   */
  getCurrentCachedFile(): CachedFile {
    return this.currentCachedFile;
  }

  /**
   * Sets the file the user is working on
   */
  setCurrentCachedFile(file: CachedFile) {
    this.currentCachedFile = file;
  }

  /**
   * Find element on external reference
   *
   * @param aspectModelUrn - urn of the element
   * @return element on external reference
   */
  findElementOnExtReference<T>(aspectModelUrn: string): T {
    const [namespace] = aspectModelUrn.split('#');
    const cachedFiles = Array.from(this.namespaces.get(namespace + '#')?.values() || []);
    return cachedFiles
      .find(cachedFile => this.currentCachedFile !== cachedFile && !!cachedFile.getEitherElement(aspectModelUrn))
      ?.getEitherElement(aspectModelUrn);
  }

  /**
   * Removes a CachedFile in the path Namespace -> Remove File
   *
   * @param namespaceKey - namespace name
   * @param fileKey - fileName
   */
  removeFile(namespaceKey: string, fileKey: string): void {
    const namespace = this.namespaces.get(namespaceKey);
    if (!namespace) {
      return;
    }

    if (namespace.get(fileKey)) {
      namespace.delete(fileKey);
    }
  }

  /**
   * Remove all namespaces and the current cache file
   */
  removeAll(): void {
    this.currentCachedFile = null;
    this.namespaces = new Map<string, Map<string, CachedFile>>();
  }

  /**
   * This method will update the given namspace key with the new one.
   *
   * @param oldUrn - old namespace key
   * @param newUrn - new namespace key
   */
  updateNamespaceKey(oldUrn: string, newUrn: string) {
    const values = this.namespaces.get(oldUrn);

    this.namespaces.delete(oldUrn);
    this.namespaces.set(newUrn, values);
  }

  /**
   * This method will resolve the element when it´s not defined external.
   *
   * @param element - MetaModelElement to resolve
   */
  resolveCachedElement(element: Base) {
    let cachedProperty = this.findElementOnExtReference<Base>(element.aspectModelUrn);
    if (!cachedProperty) {
      cachedProperty = this.currentCachedFile.resolveCachedElement(element);
    }
    return cachedProperty;
  }
}
