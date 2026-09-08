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

import {computed, Injectable, signal} from '@angular/core';
import {Aspect, CacheStrategy, DefaultAspect, NamedElement, RdfModel} from '@esmf/aspect-model-loader';
import {environment} from '../../../../environments/environment';

export interface LoadedFilePayload {
  rdfModel: RdfModel;
  sharedRdfModel?: RdfModel;
  cachedFile: CacheStrategy;
  aspect: Aspect;
  absoluteName: string;
  rendered?: boolean;
  fromWorkspace?: boolean;
  aspectModelUrn?: string;
}

export interface UpdateFilePayload {
  aspect?: DefaultAspect;
  name?: string;
  namespace?: string;
}

export class NamespaceFile {
  private _name?: string;
  private _namespace?: string;

  originalName = '';
  originalNamespace = '';
  originalAspectModelUrn?: string;
  rendered = false;
  sharedRdfModel?: RdfModel;
  fromWorkspace = false;
  /** Used in the rendering process. DO NOT USE TO GET THE WORKSPACE STRUCTURE */
  namespaceFiles: Record<string, string> = {};

  get namespace(): string {
    return (this._namespace || this.aspect?.namespace || this.rdfModel.getPrefixes()[''] || '').replace('#', '').replace('urn:samm:', '');
  }

  set namespace(value: string) {
    this._namespace = value;
  }

  set name(value: string) {
    this._name = value;
  }

  get name(): string {
    return this._name || (this.aspect ? this.nameBasedOnAspect || 'aspect.ttl' : 'shared-file.ttl');
  }

  get absoluteName(): string {
    return this.namespace + ':' + this.name;
  }

  get originalAbsoluteName(): string {
    return `${this.originalNamespace}:${this.originalName}`;
  }

  get nameBasedOnAspect(): string | null {
    return this.aspect ? this.aspect.name + '.ttl' : null;
  }

  get isNamespaceChanged(): boolean {
    return this.namespace !== this.originalNamespace;
  }

  get isNameChanged(): boolean {
    return this.name !== this.originalName;
  }

  constructor(
    public rdfModel: RdfModel,
    public cachedFile: CacheStrategy,
    public aspect: Aspect | null,
  ) {}

  resetOriginalUrn() {
    this.originalNamespace = this.namespace;
    this.originalName = this.name;
  }

  setExistsInWorkspace() {
    this.fromWorkspace = true;
  }

  getAnyAspectModelUrn(): string {
    return this.rdfModel.store.getSubjects(null, null, null)[0]?.value || '';
  }
}

@Injectable({providedIn: 'root'})
export class LoadedFilesService {
  private filesSignal = signal<Record<string, NamespaceFile>>({});

  readonly currentLoadedFileSignal = computed<NamespaceFile | null>(() => {
    for (const file of Object.values(this.filesSignal())) {
      if (file.rendered) return file;
    }
    return null;
  });

  readonly hasAspect = computed<boolean>(() => !!this.currentLoadedFileSignal()?.aspect);

  public get files(): Record<string, NamespaceFile> {
    return this.filesSignal();
  }

  get currentLoadedFile(): NamespaceFile | null {
    return this.currentLoadedFileSignal();
  }

  get filesAsList(): NamespaceFile[] {
    return Object.values(this.files);
  }

  get externalFiles(): NamespaceFile[] {
    return this.filesAsList.filter(file => !file.rendered);
  }

  constructor() {
    if (typeof window !== 'undefined' && !environment.production) {
      (window as any)['angular.LoadedFilesService'] = this;
    }
  }

  private updateFiles(fn: (files: Record<string, NamespaceFile>) => Record<string, NamespaceFile>) {
    this.filesSignal.update(fn);
  }

  isElementInCurrentFile(element: NamedElement): boolean {
    if (!element) return false;
    if (!this.currentLoadedFile) return false;
    if (element.name?.includes('[') && element.name?.includes(']')) return true;
    if (!this.currentLoadedFile.cachedFile) return false;

    return Boolean(this.currentLoadedFile.cachedFile.get(element.aspectModelUrn));
  }

  isElementExtern(element: NamedElement): boolean {
    if (!element) return false;

    return (
      !element.isPredefined &&
      !this.isElementInCurrentFile(element) &&
      this.filesAsList.some(file => file.cachedFile.get(element.aspectModelUrn))
    );
  }

  /**
   * Stores a file into the service
   *
   * @param fileInfo - a file payload to be used for storing the file
   * @param force - forces the method to proceed even if a file under the specified key already exists
   * @returns - NamespaceFile class instance
   */
  addFile(fileInfo: LoadedFilePayload, force = false): NamespaceFile {
    const newFile = new NamespaceFile(fileInfo.rdfModel, fileInfo.cachedFile, fileInfo.aspect);
    if (fileInfo.absoluteName) {
      const parts = fileInfo.absoluteName.split(':');
      if (parts.length >= 2) {
        newFile.name = parts.pop();

        if (newFile.name === undefined) {
          throw new Error('parts array is empty');
        }

        newFile.namespace = parts.join(':');
      } else {
        newFile.name = parts[0];
      }
    }

    if (this.files[newFile.absoluteName] && !force) {
      return newFile;
    }

    newFile.rendered = Boolean(fileInfo.rendered);
    newFile.originalName = newFile.name;
    newFile.originalNamespace = newFile.namespace;
    newFile.originalAspectModelUrn = fileInfo.aspectModelUrn;
    newFile.sharedRdfModel = fileInfo.sharedRdfModel;

    this.updateFiles(files => {
      const updated = {...files};
      if (updated[newFile.absoluteName] && updated[newFile.absoluteName].fromWorkspace) {
        updated[newFile.absoluteName + '_workspace_duplicate'] = updated[newFile.absoluteName];
      }
      updated[newFile.absoluteName] = newFile;
      return updated;
    });

    return newFile;
  }

  /**
   * Stores files into the service
   *
   * @param filesInfo - a list of files payloads to be used for storing files
   * @returns - a list of NamespaceFile class instances
   */
  addFiles(filesInfo: LoadedFilePayload[]): NamespaceFile[] {
    return filesInfo.map(fileInfo => this.addFile(fileInfo));
  }

  updateFileNaming(file: NamespaceFile, {aspect, name, namespace}: UpdateFilePayload) {
    const oldAbsoluteName = file.absoluteName;
    if (name) file.name = name;
    if (namespace) file.namespace = namespace;
    if (aspect) file.aspect = aspect;
    this.updateAbsoluteName(oldAbsoluteName, file.absoluteName);

    this.updateFiles(files => ({...files}));
  }

  removeFile(absoluteName: string) {
    if (!this.files[absoluteName]) return;

    this.updateFiles(files => {
      const rest = {...files};
      delete rest[absoluteName];
      return rest;
    });
  }

  updateAbsoluteName(oldAbsoluteName: string, newAbsoluteName: string, rewriteOriginal = false) {
    if (oldAbsoluteName === newAbsoluteName) return;

    if (!this.files[oldAbsoluteName]) {
      console.error(`${oldAbsoluteName} is not in the file list`);
      return;
    }

    if (this.files[newAbsoluteName]) {
      console.error(`${newAbsoluteName} already exists in file list`);
      return;
    }

    const file = this.files[oldAbsoluteName];
    const parts = newAbsoluteName.split(':');
    if (parts.length >= 2) {
      const lastPart = parts.pop();

      if (lastPart === undefined) {
        throw new Error('parts array is empty');
      }

      file.name = lastPart;
      file.namespace = parts.join(':');
    }

    if (rewriteOriginal) {
      file.originalName = file.name;
      file.originalNamespace = file.namespace;
    }

    this.updateFiles(files => {
      const {[oldAbsoluteName]: moved, ...rest} = files;
      return {...rest, [newAbsoluteName]: moved};
    });
  }

  getFile(absoluteName: string): NamespaceFile | undefined {
    return this.files[absoluteName];
  }

  getElement<T extends NamedElement>(aspectModelUrn: string): T | null {
    for (const file of Object.values(this.files)) {
      const element = file.cachedFile?.get<T>(aspectModelUrn);
      if (element) return element;
    }

    return null;
  }

  getFileFromElement(element: NamedElement): string | null {
    for (const file of Object.values(this.files)) {
      if (file.rdfModel.store?.getQuads(element.aspectModelUrn, null, null, null)?.length) {
        return file.name;
      }
    }

    return null;
  }

  findElementOnExtReferences<T extends NamedElement>(aspectModelUrn: string): T | null {
    for (const file of this.filesAsList) {
      if (this.currentLoadedFile?.absoluteName === file.absoluteName) continue;
      const element = file.cachedFile?.get<T>(aspectModelUrn);
      if (element) return element;
    }

    return null;
  }

  removeAll() {
    this.updateFiles(() => ({}));
  }
}
