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

import {ModelApiService} from '@ame/api';
import {LoadedFilesService} from '@ame/cache';
import {MaxGraphHelper, MaxGraphService} from '@ame/max-graph';
import {inject, Injectable} from '@angular/core';
import {NamedElement} from '@esmf/aspect-model-loader';
import {catchError, concatMap, EMPTY, expand, forkJoin, last, map, Observable, of} from 'rxjs';

@Injectable({providedIn: 'root'})
export class ModelElementNamingService {
  private readonly loadedFiles = inject(LoadedFilesService);
  private readonly modelApiService = inject(ModelApiService, {optional: true});
  private readonly maxgraphService = inject(MaxGraphService, {optional: true});

  /**
   * Creates a new instance of the element and assigns it a default name
   *
   * @param NamedElement element being created
   * @returns element being created
   */
  resolveMetaModelElement<T extends NamedElement>(element: T, cached?: boolean): T {
    const mainAspectModelUrn = `urn:samm:${this.loadedFiles.currentLoadedFile?.namespace}#`;
    for (const child of element.children) {
      if (
        !child.isPredefined &&
        (!child.aspectModelUrn || child.aspectModelUrn.startsWith('#') || child.aspectModelUrn.startsWith(mainAspectModelUrn))
      ) {
        this.resolveMetaModelElement(child, cached);
      }
    }
    const resolved = this.resolveElementNaming(element);
    return cached && this.loadedFiles.currentLoadedFile?.cachedFile
      ? this.loadedFiles.currentLoadedFile.cachedFile.resolveInstance(resolved)
      : resolved;
  }

  resolveMetaModelElement$<T extends NamedElement>(element: T, cached = true): Observable<T> {
    const mainAspectModelUrn = `urn:samm:${this.loadedFiles.currentLoadedFile?.namespace}#`;
    const childObservables: Observable<any>[] = [];
    for (const child of element.children) {
      if (
        !child.isPredefined &&
        (!child.aspectModelUrn || child.aspectModelUrn.startsWith('#') || child.aspectModelUrn.startsWith(mainAspectModelUrn))
      ) {
        childObservables.push(this.resolveMetaModelElement$(child, cached));
      }
    }

    const resolveChildren$ = childObservables.length ? forkJoin(childObservables) : of([]);

    return resolveChildren$.pipe(
      concatMap(() => this.resolveElementNaming$(element)),
      map(resolvedElement => {
        return cached && this.loadedFiles.currentLoadedFile?.cachedFile
          ? this.loadedFiles.currentLoadedFile.cachedFile.resolveInstance(resolvedElement)
          : resolvedElement;
      }),
    );
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
    const elements: Record<string, boolean> = {};

    if (!rdfModel) {
      return null;
    }

    const mainAspectModelUrn = `urn:samm:${namespace}#`;
    for (const file of this.loadedFiles.filesAsList) {
      if (file.rdfModel?.store) {
        for (const subject of file.rdfModel.store.getSubjects(null, null, null)) {
          if (subject.value?.startsWith(mainAspectModelUrn)) {
            elements[subject.value] = true;
          }
        }
      }
      if (file.cachedFile) {
        for (const key of file.cachedFile.getKeys()) {
          if (key.startsWith(mainAspectModelUrn) && file.cachedFile.get(key) !== element) {
            elements[key] = true;
          }
        }
      }
    }

    if (this.maxgraphService?.graph) {
      const vertices = this.maxgraphService.graph.getChildVertices(this.maxgraphService.graph.getDefaultParent()) || [];
      for (const cell of vertices) {
        const metaModel = MaxGraphHelper.getModelElement(cell);
        if (metaModel?.aspectModelUrn?.startsWith(mainAspectModelUrn) && metaModel !== element) {
          elements[metaModel.aspectModelUrn] = true;
        }
      }
    }

    let counter = 1;
    let baseName = element.name;
    const match = /(\d+)$/.exec(baseName);
    if (match) {
      baseName = baseName.slice(0, -match[1].length);
      counter = parseInt(match[1], 10);
    }

    element.metaModelVersion = rdfModel.samm.version;
    const parentNamePrefix = parentName;
    let candidateName = '';
    let candidateUrn = '';

    do {
      candidateName = `${parentNamePrefix || ''}${baseName}${parentName ? '' : counter++}`;
      candidateUrn = `${mainAspectModelUrn}${candidateName}`;
      parentName = undefined;
    } while (
      elements[candidateUrn] ||
      (this.loadedFiles.currentLoadedFile.cachedFile?.get<NamedElement>(candidateUrn) &&
        this.loadedFiles.currentLoadedFile.cachedFile.get<NamedElement>(candidateUrn) !== element)
    );

    element.name = candidateName;
    element.aspectModelUrn = candidateUrn;
    element.consumePreviousAspectModelUrn();
    return element;
  }

  resolveElementNaming$<T extends NamedElement = NamedElement>(element: T, parentName?: string): Observable<T> {
    this.resolveElementNaming(element, parentName);
    const fileName = this.loadedFiles.currentLoadedFile?.name || '';
    if (!this.modelApiService || !fileName) {
      return of(element);
    }

    const {namespace} = this.loadedFiles.currentLoadedFile;
    const mainAspectModelUrn = `urn:samm:${namespace}#`;
    let nameBase = element.name;
    let counter = 1;
    const match = /(\d+)$/.exec(nameBase);
    if (match) {
      nameBase = nameBase.slice(0, -match[1].length);
      counter = parseInt(match[1], 10);
    }

    const checkCandidate = (name: string, urn: string): Observable<{exists: boolean; name: string; urn: string}> => {
      const cached = this.loadedFiles.currentLoadedFile.cachedFile?.get<NamedElement>(urn);
      const isCachedCollision = Boolean(cached && cached !== element);
      if (isCachedCollision) {
        return of({exists: true, name, urn});
      }
      return this.modelApiService.checkElementExists(urn, fileName).pipe(
        map(exists => ({exists, name, urn})),
        catchError(() => of({exists: false, name, urn})),
      );
    };

    return checkCandidate(element.name, element.aspectModelUrn).pipe(
      expand(result => {
        if (!result.exists) {
          return EMPTY;
        }
        counter++;
        const candidateName = `${nameBase}${counter}`;
        const candidateUrn = `${mainAspectModelUrn}${candidateName}`;
        return checkCandidate(candidateName, candidateUrn);
      }),
      last(),
      map(finalResult => {
        if (element.name !== finalResult.name) {
          element.name = finalResult.name;
          element.aspectModelUrn = finalResult.urn;
          element.consumePreviousAspectModelUrn();
        }
        return element;
      }),
    );
  }
}
