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

import {
  Base,
  BaseMetaModelElement,
  CanExtend,
  DefaultAspect,
  DefaultEntityInstance,
  DefaultEnumeration,
  EntityValueProperty,
} from '@ame/meta-model';
import {mxgraph} from 'mxgraph-factory';
import {NamespacesCacheService} from '@ame/cache';
import {MxGraphHelper} from '@ame/mx-graph';
import {ModelService, RdfService} from '@ame/rdf/services';
import {EditorService} from '@ame/editor';
import {ModelApiService} from '@ame/api';
import {inject} from '@angular/core';

export abstract class BaseModelService {
  protected rdfService: RdfService = inject(RdfService);
  protected namespacesCacheService: NamespacesCacheService = inject(NamespacesCacheService);
  protected modelService: ModelService = inject(ModelService);
  protected editorService: EditorService = inject(EditorService);
  protected modelApiService: ModelApiService = inject(ModelApiService);

  get currentCachedFile() {
    return this.namespacesCacheService.currentCachedFile;
  }

  get currentRdfModel() {
    return this.rdfService.currentRdfModel;
  }

  abstract isApplicable(metaModelElement: BaseMetaModelElement): boolean;

  update(cell: mxgraph.mxCell, form: {[key: string]: any}) {
    const modelElement = MxGraphHelper.getModelElement(cell);
    if (!modelElement) {
      return;
    }
    // Add common operations

    // update name
    const aspect = Object.assign({}, this.modelService?.loadedAspect);
    const aspectModelUrn = this.modelService.currentRdfModel.getAspectModelUrn();

    this.currentCachedFile.updateCachedElementKey(`${aspectModelUrn}${modelElement.name}`, `${aspectModelUrn}${form.name}`);
    modelElement.name = form.name;
    modelElement.aspectModelUrn = `${aspectModelUrn}${form.name}`;

    if (aspect && modelElement instanceof DefaultAspect) {
      this.currentRdfModel.setAspect(modelElement.aspectModelUrn);
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
      const sourceNode = MxGraphHelper.getModelElement<Base>(edge.source);
      if (sourceNode && !(sourceNode instanceof DefaultEnumeration) && !sourceNode.isExternalReference()) {
        this.currentCachedFile.removeElement(modeElement.aspectModelUrn);
        sourceNode.delete(modeElement);
      }
    }

    if (!modeElement.isExternalReference()) {
      this.currentCachedFile.removeElement(modeElement.aspectModelUrn);
    }
  }

  protected updateSee(modelElement: BaseMetaModelElement, form: {[key: string]: any}) {
    const newSeeValue = form.see instanceof Array ? form.see : form.see?.split(',');
    if (modelElement instanceof CanExtend) {
      if (newSeeValue?.join(',') !== modelElement.extendedSee?.join(',')) {
        modelElement.setSeeReferences(form.see ? newSeeValue : null);
      } else {
        modelElement.setSeeReferences([]);
      }
    } else {
      modelElement.setSeeReferences(form.see ? newSeeValue : null);
    }
  }

  protected updateDescriptionWithLocales(modelElement: BaseMetaModelElement, form: {[key: string]: any}) {
    Object.keys(form).forEach(key => {
      if (!key.startsWith('description')) {
        return;
      }

      const locale = key.replace('description', '');
      if (modelElement instanceof CanExtend) {
        if (form[key] !== modelElement.extendedDescription?.get(locale)) {
          modelElement.addDescription(locale, form[key]);
        } else {
          modelElement.addDescription(locale, '');
        }
      } else {
        modelElement.addDescription(locale, form[key]);
      }
    });
  }

  protected updatePreferredWithLocales(modelElement: BaseMetaModelElement, form: {[key: string]: any}) {
    Object.keys(form).forEach(key => {
      if (!key.startsWith('preferredName')) {
        return;
      }
      const locale = key.replace('preferredName', '');
      if (modelElement instanceof CanExtend) {
        if (form[key] !== modelElement.extendedPreferredName?.get(locale)) {
          modelElement.addPreferredName(locale, form[key]);
        } else {
          modelElement.addPreferredName(locale, '');
        }
      } else {
        modelElement.addPreferredName(locale, form[key]);
      }
    });
  }

  protected addNewEntityValues(newEntityValues: DefaultEntityInstance[], parent: BaseMetaModelElement) {
    for (const entityValue of newEntityValues) {
      MxGraphHelper.establishRelation(parent, entityValue);
      this.currentCachedFile.resolveElement(entityValue);
    }
  }

  protected deleteEntityValue(entityValue: DefaultEntityInstance, parent: BaseMetaModelElement) {
    MxGraphHelper.removeRelation(parent, entityValue);
    // delete the element
    this.namespacesCacheService.currentCachedFile.removeElement(entityValue.aspectModelUrn);
    // now delete other underlying entity values that don't belong to an enumeration
    entityValue.properties.forEach((property: EntityValueProperty) => {
      if (property.value instanceof DefaultEntityInstance) {
        // this is another complex value, check if it belongs to an enumeration
        if (!property.value.parents?.length) {
          this.deleteEntityValue(property.value, entityValue);
        }
      }
    });
  }
}
