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

import {
  Base,
  BaseMetaModelElement,
  CanExtend,
  DefaultAspect,
  DefaultEntityValue,
  DefaultEnumeration,
  EntityValueProperty,
} from '@ame/meta-model';
import {mxgraph} from 'mxgraph-factory';
import {NamespacesCacheService} from '@ame/cache';
import {MxGraphHelper} from '@ame/mx-graph';
import {ModelService} from '@ame/rdf/services';
import {EditorService} from '@ame/editor';
import {ModelApiService} from '@ame/api';
import {map} from 'rxjs';

export abstract class BaseModelService {
  abstract isApplicable(metaModelElement: BaseMetaModelElement): boolean;

  constructor(
    protected namespacesCacheService: NamespacesCacheService,
    protected modelService: ModelService,
    protected editorService?: EditorService,
    protected modelApiService?: ModelApiService
  ) {}

  get currentCachedFile() {
    return this.namespacesCacheService.getCurrentCachedFile();
  }

  update(cell: mxgraph.mxCell, form: {[key: string]: any}) {
    const metaModelElement = MxGraphHelper.getModelElement(cell);
    // Add common operations

    // update name
    const aspect = Object.assign({}, this.modelService.getLoadedAspectModel().aspect);
    const aspectModelUrn = this.modelService.getLoadedAspectModel().rdfModel.getAspectModelUrn();
    this.currentCachedFile.updateCachedElementKey(`${aspectModelUrn}${metaModelElement.name}`, `${aspectModelUrn}${form.name}`);
    metaModelElement.name = form.name;
    metaModelElement.aspectModelUrn = `${aspectModelUrn}${form.name}`;

    if (metaModelElement instanceof DefaultAspect && aspect.aspectModelUrn !== metaModelElement.aspectModelUrn) {
      const aspectModelFileName = aspect.aspectModelUrn.replace('urn:bamm:', '').replace('#', ':') + '.ttl';

      this.modelApiService
        .getNamespacesAppendWithFiles()
        .pipe(
          map((fileNames: string[]) => {
            if (fileNames.find(fileName => fileName === aspectModelFileName)) {
              this.editorService.addAspectModelFileIntoStore(aspectModelFileName).subscribe();
            }
          })
        )
        .subscribe();
    }

    // update descriptions (multiple locales)
    this.updateDescriptionWithLocales(metaModelElement, form);

    // update preferred name (multiple locales)
    this.updatePreferredWithLocales(metaModelElement, form);

    // update see
    this.updateSee(metaModelElement, form);
  }

  delete(cell: mxgraph.mxCell) {
    // Add common operations
    const modelElement = MxGraphHelper.getModelElement(cell);
    for (const edge of (cell.edges?.length && cell.edges) || []) {
      const edgeSourceModelElement = MxGraphHelper.getModelElement(edge.source);
      if (
        edgeSourceModelElement &&
        !(edgeSourceModelElement instanceof DefaultEnumeration) &&
        !edgeSourceModelElement.isExternalReference()
      ) {
        this.currentCachedFile.removeCachedElement(modelElement.aspectModelUrn);
        (<Base>edgeSourceModelElement).delete(modelElement);
      }
    }

    if (!modelElement.isExternalReference()) {
      this.currentCachedFile.removeCachedElement(modelElement.aspectModelUrn);
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

  protected addNewEntityValues(newEntityValues: DefaultEntityValue[]) {
    for (const entityValue of newEntityValues) {
      this.currentCachedFile.resolveCachedElement(entityValue);
    }
  }

  protected deleteEntityValue(entityValue: DefaultEntityValue) {
    // delete the element
    this.namespacesCacheService.getCurrentCachedFile().removeCachedElement(entityValue.aspectModelUrn);
    // now delete other underlying entity values that don't belong to an enumeration
    entityValue.properties.forEach((property: EntityValueProperty) => {
      if (property.value instanceof DefaultEntityValue) {
        // this is another complex value, check if it belongs to an enumeration
        if (!property.value.parents?.length) {
          this.deleteEntityValue(property.value);
        }
      }
    });
  }
}
