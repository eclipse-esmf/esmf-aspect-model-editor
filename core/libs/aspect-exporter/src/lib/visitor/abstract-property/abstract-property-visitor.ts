/*
 * Copyright (c) 2023 Robert Bosch Manufacturing Solutions GmbH
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

import {Injectable, inject} from '@angular/core';
import {DataFactory, Store} from 'n3';
import {BaseVisitor} from '../base-visitor';
import {RdfNodeService} from '../../rdf-node';
import {DefaultAbstractProperty} from '@ame/meta-model';
import {RdfService} from '@ame/rdf/services';

@Injectable()
export class AbstractPropertyVisitor extends BaseVisitor<DefaultAbstractProperty> {
  private rdfNodeService = inject(RdfNodeService);

  private get store(): Store {
    return this.rdfNodeService.modelService.getLoadedAspectModel().rdfModel.store;
  }

  constructor(rdfService: RdfService) {
    super(rdfService);
  }

  visit(abstractProperty: DefaultAbstractProperty): DefaultAbstractProperty {
    if (abstractProperty.isPredefined()) {
      return null;
    }

    this.setPrefix(abstractProperty.aspectModelUrn);
    const oldAspectModelUrn = abstractProperty.aspectModelUrn;
    this.addExtends(abstractProperty);
    this.addProperties(abstractProperty);
    if (oldAspectModelUrn !== abstractProperty.aspectModelUrn) {
      this.removeOldQuads(oldAspectModelUrn);
    }
    return abstractProperty;
  }

  private addProperties(abstractProperty: DefaultAbstractProperty) {
    this.rdfNodeService.update(abstractProperty, {
      exampleValue: abstractProperty.exampleValue,
      preferredName: abstractProperty.getAllLocalesPreferredNames().map(language => ({
        language,
        value: abstractProperty.getPreferredName(language),
      })),
      description: abstractProperty.getAllLocalesDescriptions().map(language => ({
        language,
        value: abstractProperty.getDescription(language),
      })),
      see: abstractProperty.getSeeReferences() || [],
    });
  }

  private addExtends(abstractProperty: DefaultAbstractProperty) {
    if (!abstractProperty.extendedElement) {
      return;
    }

    this.setPrefix(abstractProperty.extendedElement.aspectModelUrn);
    this.store.addQuad(
      DataFactory.namedNode(abstractProperty.aspectModelUrn),
      this.rdfService.currentRdfModel.samm.ExtendsProperty(),
      DataFactory.namedNode(abstractProperty.extendedElement.aspectModelUrn)
    );
  }

  private removeOldQuads(oldAspectModelUrn: string) {
    this.store.removeQuads(this.store.getQuads(DataFactory.namedNode(oldAspectModelUrn), null, null, null));
  }
}
