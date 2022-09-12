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

import {Injectable} from '@angular/core';
import {mxgraph} from 'mxgraph-factory';
import {DataFactory, Store} from 'n3';
import {BaseVisitor} from '../base-visitor';
import {MxGraphHelper} from '@ame/mx-graph';
import {RdfNodeService} from '../../rdf-node';
import {DefaultAbstractProperty} from '@ame/meta-model';
import {RdfService} from '@ame/rdf/services';

@Injectable()
export class AbstractPropertyVisitor extends BaseVisitor<DefaultAbstractProperty> {
  private get store(): Store {
    return this.rdfNodeService.modelService.getLoadedAspectModel().rdfModel.store;
  }

  constructor(private rdfNodeService: RdfNodeService, rdfService: RdfService) {
    super(rdfService);
  }

  visit(cell: mxgraph.mxCell): DefaultAbstractProperty {
    const abstractProperty: DefaultAbstractProperty = MxGraphHelper.getModelElement<DefaultAbstractProperty>(cell);
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
      this.rdfService.currentRdfModel.BAMM().ExtendsProperty(),
      DataFactory.namedNode(abstractProperty.extendedElement.aspectModelUrn)
    );
  }

  private removeOldQuads(oldAspectModelUrn: string) {
    this.store.removeQuads(this.store.getQuads(DataFactory.namedNode(oldAspectModelUrn), null, null, null));
  }
}
