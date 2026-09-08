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
import {MaxGraphHelper} from '@ame/max-graph';
import {ModelService, RdfService} from '@ame/rdf/services';
import {useUpdater} from '@ame/utils';
import {inject} from '@angular/core';
import {DefaultAspect, DefaultEntityInstance, DefaultEnumeration, HasExtends, NamedElement} from '@esmf/aspect-model-loader';
import {Cell} from '@maxgraph/core';

export abstract class BaseModelService {
  protected readonly rdfService: RdfService = inject(RdfService);
  protected readonly modelService: ModelService = inject(ModelService);
  protected readonly modelApiService: ModelApiService = inject(ModelApiService);
  protected readonly loadedFilesService: LoadedFilesService = inject(LoadedFilesService);

  get currentCachedFile() {
    return this.loadedFile.cachedFile;
  }

  get loadedFile() {
    return this.loadedFilesService.currentLoadedFile;
  }

  abstract isApplicable(metaModelElement: NamedElement): boolean;

  update(cell: Cell, form: {[key: string]: any}) {
    const modelElement = MaxGraphHelper.getModelElement(cell);
    if (!modelElement) {
      return;
    }
    // Add common operations

    // update name
    const aspectModelUrn = this.loadedFile.rdfModel.getAspectModelUrn();
    const oldUrn = modelElement.aspectModelUrn || `${aspectModelUrn}${modelElement.name}`;

    if (form.isAnonymous !== undefined) {
      modelElement.anonymous = Boolean(form.isAnonymous);
    }

    if (modelElement.isAnonymous?.()) {
      const typeName = modelElement.className ? modelElement.className.replace('Default', '') : 'Characteristic';
      const anonName = `[${typeName}]`;
      modelElement.name = anonName;
      if (!modelElement.aspectModelUrn || !modelElement.aspectModelUrn.includes('[')) {
        const newUrn = `${aspectModelUrn}${anonName}_${Math.floor(Math.random() * 9000) + 1000}`;
        this.currentCachedFile.updateElementKey(oldUrn, newUrn);
        modelElement.aspectModelUrn = newUrn;
      }
    } else if (form.name !== undefined) {
      const newName = form.name?.startsWith('[')
        ? modelElement.className
          ? modelElement.className.replace('Default', '')
          : 'Characteristic'
        : form.name;
      const newUrn = `${aspectModelUrn}${newName}`;
      this.currentCachedFile.updateElementKey(oldUrn, newUrn);
      modelElement.name = newName;
      modelElement.aspectModelUrn = newUrn;
    }

    if (modelElement instanceof DefaultAspect) {
      this.loadedFilesService.currentLoadedFile.aspect = modelElement;
    }

    // update descriptions (multiple locales)
    this.updateDescriptionWithLocales(modelElement, form);

    // update preferred name (multiple locales)
    this.updatePreferredWithLocales(modelElement, form);

    // update see
    this.updateSee(modelElement, form);
  }

  delete(cell: Cell) {
    // Add common operations
    const modelElement = MaxGraphHelper.getModelElement(cell);
    for (const edge of (cell.edges?.length && cell.edges) || []) {
      const sourceNode = MaxGraphHelper.getModelElement<NamedElement>(edge.source);
      if (sourceNode && !(sourceNode instanceof DefaultEnumeration) && this.loadedFilesService.isElementInCurrentFile(sourceNode)) {
        this.currentCachedFile.removeElement(modelElement.aspectModelUrn);
        useUpdater(sourceNode).delete(modelElement);
      }
    }

    if (this.loadedFilesService.isElementInCurrentFile(modelElement)) {
      this.currentCachedFile.removeElement(modelElement.aspectModelUrn);
    }
  }

  protected updateSee(modelElement: NamedElement, form: {[key: string]: any}) {
    const newSeeValue = form.see instanceof Array ? form.see : form.see?.split(',');
    const extending = modelElement as HasExtends;
    if (extending.extends_) {
      if (newSeeValue?.join(',') !== extending.extends_?.see?.join(',')) {
        extending.see = form.see ? newSeeValue : null;
      } else {
        extending.see = [];
      }
    } else {
      modelElement.see = form.see ? newSeeValue : null;
    }
  }

  protected updateDescriptionWithLocales(modelElement: NamedElement, form: {[key: string]: any}) {
    const extending = modelElement as HasExtends;
    Object.keys(form).forEach(key => {
      if (!key.startsWith('description')) {
        return;
      }

      const locale = key.replace('description', '');
      if (extending.extends_) {
        if (form[key] !== extending.extends_?.descriptions?.get(locale)) {
          extending.descriptions.set(locale, form[key]);
        } else {
          extending.descriptions.set(locale, '');
        }
      } else {
        modelElement.descriptions.set(locale, form[key]);
      }
    });
  }

  protected updatePreferredWithLocales(modelElement: NamedElement, form: {[key: string]: any}) {
    const extending = modelElement as HasExtends;
    Object.keys(form).forEach(key => {
      if (!key.startsWith('preferredName')) {
        return;
      }
      const locale = key.replace('preferredName', '');
      if (extending.extends_) {
        if (form[key] !== extending.extends_?.preferredNames?.get(locale)) {
          extending.preferredNames.set(locale, form[key]);
        } else {
          extending.preferredNames.set(locale, '');
        }
      } else {
        modelElement.preferredNames.set(locale, form[key]);
      }
    });
  }

  protected addNewEntityValues(newEntityValues: DefaultEntityInstance[], parent: NamedElement) {
    for (const entityValue of newEntityValues) {
      MaxGraphHelper.establishRelation(parent, entityValue);
      this.currentCachedFile.resolveInstance(entityValue);
    }
  }

  protected deleteEntityValue(entityValue: DefaultEntityInstance, parent: NamedElement) {
    MaxGraphHelper.removeRelation(parent, entityValue);
    // delete the element
    this.loadedFile.cachedFile.removeElement(entityValue.aspectModelUrn);
    // now delete other underlying entity values that don't belong to an enumeration
    entityValue.getTuples().forEach(([, value]) => {
      if (value instanceof DefaultEntityInstance) {
        this.deleteEntityValue(value, entityValue);
      }
    });
  }
}
