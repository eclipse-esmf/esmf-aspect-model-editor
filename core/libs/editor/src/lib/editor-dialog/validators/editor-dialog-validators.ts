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

import {AbstractControl, ValidatorFn} from '@angular/forms';
import {NamespacesCacheService} from '@ame/cache';
import {BaseMetaModelElement} from '@ame/meta-model';
import {RFC2141} from 'urn-lib';
import {DataFactory} from 'n3';
import {RdfModel} from '@ame/rdf/utils';

export class EditorDialogValidators {
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

  static duplicateName(
    namespaceCacheService: NamespacesCacheService,
    metaModelElement: BaseMetaModelElement,
    extRdfModels: Array<RdfModel>,
    haveTheSameName = true
  ): ValidatorFn {
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
      for (const rdfModel of extRdfModels) {
        const element = rdfModel.store.getQuads(DataFactory.namedNode(aspectModelUrn), null, null, null)?.[0]?.subject;

        if (element) {
          const [namespace] = element.value.split('#');
          namespaceCacheService.sidebarService.loadNamespaceFiles(namespace, namespaceCacheService.getCurrentCachedFile());
          const files = namespaceCacheService.getFiles(namespace);
          foundExternalElement = files.reduce<BaseMetaModelElement>((acc, file) => acc || file.getEitherElement(element.value), null);
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

      const modelElementDefinedInCurrentCachedFile = namespaceCacheService
        .getCurrentCachedFile()
        .getEitherElement<BaseMetaModelElement>(aspectModelUrn);

      return modelElementDefinedInCurrentCachedFile &&
        (!haveTheSameName || modelElementDefinedInCurrentCachedFile.name !== metaModelElement.name)
        ? {
            checkShapeName: true,
            foundModel: modelElementDefinedInCurrentCachedFile,
          }
        : null;
    };
  }

  static duplicateNameWithDifferentType(
    namespaceCacheService: NamespacesCacheService,
    metaModelElement: BaseMetaModelElement,
    extRdfModels: Array<RdfModel>,
    modelType: Function
  ): ValidatorFn {
    return (control: AbstractControl) => {
      const duplicateNameValidation = EditorDialogValidators.duplicateName(
        namespaceCacheService,
        metaModelElement,
        extRdfModels,
        false
      )(control);

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
      return namespacesCacheService.getCurrentCachedFile().getCachedElement<BaseMetaModelElement>(aspectModelUrn)
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
}
