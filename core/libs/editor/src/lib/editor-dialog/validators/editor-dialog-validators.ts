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
import {inject, Injectable} from '@angular/core';
import {NamedElement} from '@esmf/aspect-model-loader';
import {map, Observable, of} from 'rxjs';
import {RFC2141} from 'urn-lib';

export type EditorValidationErrors = Record<string, unknown>;

@Injectable({providedIn: 'root'})
export class EditorDialogValidators {
  private modelApiService = inject(ModelApiService);
  private loadedFileService = inject(LoadedFilesService);

  static seeURIValue(value: string): EditorValidationErrors | null {
    if (!value) return null;

    const uriRegEx = /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,4}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)/;
    const values = value.split(',');
    const invalidUris = values.filter(uri => {
      const trimmedUri = uri.trim();
      const parsed = RFC2141.parse(trimmedUri);
      const validUrn = parsed ? RFC2141.validate(parsed) === null : false;
      return !uriRegEx.test(trimmedUri) && !validUrn;
    });

    return invalidUris.length ? {uri: {invalidUris, elementsCount: values.length}} : null;
  }

  duplicateNameValue(value: string, metaModelElement: NamedElement, haveTheSameName = true): Observable<EditorValidationErrors | null> {
    if (!value || (value === metaModelElement.name && haveTheSameName)) {
      return of(null);
    }

    const baseNamespace =
      metaModelElement.aspectModelUrn?.includes('#') && !metaModelElement.isAnonymous?.()
        ? metaModelElement.aspectModelUrn.split('#')[0]
        : this.loadedFileService.currentLoadedFile.rdfModel.getAspectModelUrn().replace(/#$/, '');
    const aspectModelUrn = `${baseNamespace}#${value}`;
    const fileName = this.loadedFileService.currentLoadedFile.name;

    return this.modelApiService
      .checkElementExists(aspectModelUrn, fileName)
      .pipe(
        map(elementExists =>
          elementExists
            ? {checkShapeNameExtRef: true, foundModel: true}
            : this.validateCachedElement(aspectModelUrn, metaModelElement, haveTheSameName),
        ),
      );
  }

  private validateCachedElement(
    aspectModelUrn: string,
    metaModelElement: NamedElement,
    haveTheSameName: boolean,
  ): EditorValidationErrors | null {
    const cachedElement = this.loadedFileService.currentLoadedFile.cachedFile.get<NamedElement>(aspectModelUrn);

    if (!cachedElement) {
      return null;
    }

    const isDuplicateWithDifferentName = !haveTheSameName || cachedElement.name !== metaModelElement.name;

    return isDuplicateWithDifferentName
      ? {
          checkShapeName: true,
          foundModel: cachedElement,
        }
      : null;
  }

  duplicateNameWithDifferentTypeValue(
    value: string,
    metaModelElement: NamedElement,
    modelType: new (...args: any[]) => NamedElement,
  ): Observable<EditorValidationErrors | null> {
    return this.duplicateNameValue(value, metaModelElement, false).pipe(
      map(duplicateNameValidation => {
        if (!duplicateNameValidation) return null;
        const isValidDuplicate =
          duplicateNameValidation['foundModel'] instanceof modelType && !duplicateNameValidation['checkShapeNameExtRef'];
        return isValidDuplicate ? null : duplicateNameValidation;
      }),
    );
  }
}
