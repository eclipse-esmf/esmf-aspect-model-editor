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
import {EditorService} from '@ame/editor';
import {MxGraphHelper} from '@ame/mx-graph';
import {ModelService, RdfService} from '@ame/rdf/services';
import {inject} from '@angular/core';
import {DefaultAspect, DefaultEntityInstance, DefaultEnumeration, HasExtends, NamedElement} from '@esmf/aspect-model-loader';
import {mxgraph} from 'mxgraph-factory';

export abstract class BaseModelService {
  protected rdfService: RdfService = inject(RdfService);
  protected modelService: ModelService = inject(ModelService);
  protected editorService: EditorService = inject(EditorService);
  protected modelApiService: ModelApiService = inject(ModelApiService);
  protected loadedFilesService: LoadedFilesService = inject(LoadedFilesService);

  get currentCachedFile() {
    return this.loadedFile.cachedFile;
  }

  get loadedFile() {
    return this.loadedFilesService.currentLoadedFile;
  }

  abstract isApplicable(metaModelElement: NamedElement): boolean;

  update(cell: mxgraph.mxCell, form: {[key: string]: any}) {
    const modelElement = MxGraphHelper.getModelElement(cell);
    if (!modelElement) {
      return;
    }
    // Add common operations

    // update name
    const aspect: DefaultAspect = Object.assign({}, this.loadedFile.aspect);
    const aspectModelUrn = this.loadedFile.rdfModel.getAspectModelUrn();

    this.currentCachedFile.updateElementKey(`${aspectModelUrn}${modelElement.name}`, `${aspectModelUrn}${form.name}`);

    modelElement.name = form.name;
    modelElement.aspectModelUrn = `${aspectModelUrn}${form.name}`;

    if (aspect && modelElement instanceof DefaultAspect) {
      this.loadedFilesService.currentLoadedFile.aspect = aspect;
    }

    // update descriptions (multiple locales)
    this.updateDescriptionWithLocales(modelElement, form);

    // update preferred name (multiple locales)
    this.updatePreferredWithLocales(modelElement, form);

    // update see
    this.updateSee(modelElement, form);
  }

  delete(cell: mxgraph.mxCell) {
    // Add common operations
    const modeElement = MxGraphHelper.getModelElement(cell);
    for (const edge of (cell.edges?.length && cell.edges) || []) {
      const sourceNode = MxGraphHelper.getModelElement<NamedElement>(edge.source);
      if (sourceNode && !(sourceNode instanceof DefaultEnumeration) && this.loadedFilesService.isElementInCurrentFile(sourceNode)) {
        this.currentCachedFile.removeElement(modeElement.aspectModelUrn);
        // TODO make functionality for delete
        // sourceNode.delete(modeElement);
      }
    }

    if (this.loadedFilesService.isElementInCurrentFile(modeElement)) {
      this.currentCachedFile.removeElement(modeElement.aspectModelUrn);
    }
  }

  protected updateSee(modelElement: NamedElement, form: {[key: string]: any}) {
    const newSeeValue = form.see instanceof Array ? form.see : form.see?.split(',');
    if (modelElement instanceof HasExtends) {
      if (newSeeValue?.join(',') !== modelElement.extends_?.see?.join(',')) {
        modelElement.see = form.see ? newSeeValue : null;
      } else {
        modelElement.see = [];
      }
    } else {
      modelElement.see = form.see ? newSeeValue : null;
    }
  }

  protected updateDescriptionWithLocales(modelElement: NamedElement, form: {[key: string]: any}) {
    Object.keys(form).forEach(key => {
      if (!key.startsWith('description')) {
        return;
      }

      const locale = key.replace('description', '');
      if (modelElement instanceof HasExtends) {
        if (form[key] !== modelElement.extends_?.descriptions?.get(locale)) {
          modelElement.descriptions.set(locale, form[key]);
        } else {
          modelElement.descriptions.set(locale, '');
        }
      } else {
        modelElement.descriptions.set(locale, form[key]);
      }
    });
  }

  protected updatePreferredWithLocales(modelElement: NamedElement, form: {[key: string]: any}) {
    Object.keys(form).forEach(key => {
      if (!key.startsWith('preferredName')) {
        return;
      }
      const locale = key.replace('preferredName', '');
      if (modelElement instanceof HasExtends) {
        if (form[key] !== modelElement.extends_?.preferredNames?.get(locale)) {
          modelElement.preferredNames.set(locale, form[key]);
        } else {
          modelElement.preferredNames.set(locale, '');
        }
      } else {
        modelElement.preferredNames.set(locale, form[key]);
      }
    });
  }

  protected addNewEntityValues(newEntityValues: DefaultEntityInstance[], parent: NamedElement) {
    for (const entityValue of newEntityValues) {
      MxGraphHelper.establishRelation(parent, entityValue);
      this.currentCachedFile.resolveInstance(entityValue);
    }
  }

  protected deleteEntityValue(entityValue: DefaultEntityInstance, parent: NamedElement) {
    MxGraphHelper.removeRelation(parent, entityValue);
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
