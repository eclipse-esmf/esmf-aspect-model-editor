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
import {AbstractControl, ValidatorFn} from '@angular/forms';
import {NamespacesCacheService} from '@ame/cache';
import {BaseMetaModelElement} from '@ame/meta-model';
import {RFC2141} from 'urn-lib';
import {RdfService} from '@ame/rdf/services';

@Injectable({providedIn: 'root'})
export class EditorDialogValidators {
  constructor(
    private namespaceCacheService: NamespacesCacheService,
    private rdfService: RdfService,
  ) {}

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

  static disabled(control: AbstractControl) {
    return control?.disabled ? null : {disabled: true};
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

  duplicateName(metaModelElement: BaseMetaModelElement, haveTheSameName = true): ValidatorFn {
    return (control: AbstractControl) => {
      if (!control?.value) {
        return null;
      }

      if (control.value === metaModelElement.name && haveTheSameName) {
        return null;
      }

      const [primaryNamespace] = metaModelElement.aspectModelUrn.split('#');
      const aspectModelUrn = `${primaryNamespace}#${control.value}`;

      let foundExternalElement: BaseMetaModelElement;
      for (const rdfModel of this.rdfService.externalRdfModels) {
        if (
          (this.rdfService.currentRdfModel.originalAbsoluteFileName || this.rdfService.currentRdfModel.absoluteAspectModelFileName) ===
          rdfModel.absoluteAspectModelFileName
        ) {
          continue;
        }

        const [namespace, originalAspectName] = aspectModelUrn.split('#');
        const files = this.namespaceCacheService.getFiles(namespace);

        for (const file of files) {
          if (file.originalAspectName === originalAspectName) {
            foundExternalElement = file.aspect;
          } else {
            foundExternalElement = file.getEitherElement(aspectModelUrn);
          }

          if (foundExternalElement) {
            break;
          }
        }
      }

      if (foundExternalElement) {
        return {
          checkShapeNameExtRef: true,
          foundModel: foundExternalElement,
        };
      }

      const modelElementDefinedInCurrentCachedFile =
        this.namespaceCacheService.currentCachedFile.getEitherElement<BaseMetaModelElement>(aspectModelUrn);

      return modelElementDefinedInCurrentCachedFile &&
        (!haveTheSameName || modelElementDefinedInCurrentCachedFile.name !== metaModelElement.name)
        ? {
            checkShapeName: true,
            foundModel: modelElementDefinedInCurrentCachedFile,
          }
        : null;
    };
  }

  duplicateNameWithDifferentType(metaModelElement: BaseMetaModelElement, modelType: Function): ValidatorFn {
    return (control: AbstractControl) => {
      const duplicateNameValidation = this.duplicateName(metaModelElement, false)(control);

      if (
        duplicateNameValidation &&
        duplicateNameValidation.foundModel instanceof modelType &&
        !duplicateNameValidation.checkShapeNameExtRef
      ) {
        return null;
      }

      return duplicateNameValidation;
    };
  }

  static noWhiteSpace(control: AbstractControl) {
    if (!control?.value) {
      return null;
    }
    const isWhitespace = control.value.indexOf(' ') >= 0;
    return isWhitespace ? {whitespace: true} : null;
  }

  static duplicateNameString(namespacesCacheService: NamespacesCacheService, namespace: string) {
    return (control: AbstractControl) => {
      if (!control?.value) {
        return null;
      }
      const aspectModelUrn = `${namespace}#${control.value}`;
      return namespacesCacheService.currentCachedFile.getElement<BaseMetaModelElement>(aspectModelUrn)
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
