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

import {ModelApiService} from '@ame/api';
import {LoadedFilesService} from '@ame/cache';
import {inject, Injectable} from '@angular/core';
import {AbstractControl, AsyncValidatorFn, ValidationErrors} from '@angular/forms';
import {CacheStrategy, NamedElement} from '@esmf/aspect-model-loader';
import {from, map, Observable, of} from 'rxjs';
import {RFC2141} from 'urn-lib';

@Injectable({providedIn: 'root'})
export class EditorDialogValidators {
  private modelApiService = inject(ModelApiService);
  private loadedFileService = inject(LoadedFilesService);

  static namingLowerCase(control: AbstractControl) {
    if (!control?.value) {
      return null;
    }
    return /^(\b[a-z]+[a-zA-Z0-9]*)$/.test(control?.value) ? null : {namingLowerCase: true}; //NOSONAR
  }

  static namingUpperCase(control: AbstractControl) {
    if (!control?.value) {
      return null;
    }

    return /^(\b[A-Z]+[a-zA-Z0-9]*)$/.test(control?.value) ? null : {namingUpperCase: true}; //NOSONAR
  }

  static disabled(control: AbstractControl): Observable<ValidationErrors | null> {
    return of(control?.disabled ? null : {disabled: true});
  }

  static seeURI(control: AbstractControl) {
    if (!control?.value) {
      return null;
    }

    const uriRegEx = /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,4}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)/; //NOSONAR

    const invalidUris: string[] = [];
    let elementsCount = 0;
    control.value.split(',').forEach((value: string) => {
      const parsed = RFC2141.parse(value.trim());
      const validUrn = parsed ? RFC2141.validate(parsed) === null : false;
      const validUrl = uriRegEx.test(value.trim());
      if (!(validUrl || validUrn)) {
        invalidUris.push(value);
      }
      elementsCount++;
    });

    return invalidUris.length > 0
      ? {
          uri: {invalidUris: invalidUris, elementsCount: elementsCount},
        }
      : null;
  }

  duplicateName(metaModelElement: NamedElement, haveTheSameName = true): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      if (!control?.value) {
        return of(null);
      }

      if (control.value === metaModelElement.name && haveTheSameName) {
        return of(null);
      }

      const [primaryNamespace] = metaModelElement.aspectModelUrn.split('#');
      const aspectModelUrn = `${primaryNamespace}#${control.value}`;
      const fileName = this.loadedFileService.currentLoadedFile.name;

      return this.modelApiService.checkElementExists(aspectModelUrn, fileName).pipe(
        map(elemenmtExists => {
          if (elemenmtExists) {
            return {
              checkShapeNameExtRef: true,
              foundModel: true,
            };
          }

          // Check cached file
          return this.validateCachedElement(aspectModelUrn, metaModelElement, haveTheSameName);
        }),
      );
    };
  }

  private validateCachedElement(aspectModelUrn: string, metaModelElement: NamedElement, haveTheSameName: boolean): ValidationErrors | null {
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

  duplicateNameWithDifferentType(metaModelElement: NamedElement, modelType: Function): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      const result = this.duplicateName(metaModelElement, false)(control);

      // Convert Promise to Observable if necessary
      const result$ = result instanceof Promise ? from(result) : result;

      return result$.pipe(
        map((duplicateNameValidation: ValidationErrors | null) => {
          if (!duplicateNameValidation) {
            return null;
          }

          const isValidDuplicate =
            duplicateNameValidation['foundModel'] instanceof modelType && !duplicateNameValidation['checkShapeNameExtRef'];

          return isValidDuplicate ? null : duplicateNameValidation;
        }),
      );
    };
  }

  static noWhiteSpace(control: AbstractControl) {
    if (!control?.value) {
      return null;
    }
    const isWhitespace = control.value.indexOf(' ') >= 0;
    return isWhitespace ? {whitespace: true} : null;
  }

  static duplicateNameString(currentCachedFile: CacheStrategy, namespace: string) {
    return (control: AbstractControl) => {
      if (!control?.value) {
        return null;
      }
      const aspectModelUrn = `${namespace}#${control.value}`;
      return currentCachedFile.get<NamedElement>(aspectModelUrn)
        ? {
            checkShapeName: true,
          }
        : null;
    };
  }

  static requiredObject(control: AbstractControl) {
    if (!control?.value) {
      return {
        required: true,
      };
    }
    return null;
  }

  static regexValidator(control: AbstractControl) {
    if (!control.value) {
      return null;
    }

    try {
      new RegExp(control.value);
      return null;
    } catch (e: any) {
      const splitMessage = e?.message?.split(':');
      return {
        regexValidator: {
          message: `${splitMessage[0]}:${splitMessage[2]}`,
        },
      };
    }
  }

  static baseUrl(control: AbstractControl) {
    let validUrl;

    try {
      validUrl = new URL(control.value) && control.value.includes('.');
    } catch {
      validUrl = false;
    }

    return validUrl ? null : {invalidUrl: true};
  }
}
