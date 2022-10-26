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
import {ListProperties, RdfListService, RdfNodeService} from '@ame/aspect-exporter';
import {DefaultOperation} from '@ame/meta-model';
import {RdfService} from '@ame/rdf/services';

@Injectable()
export class OperationVisitor extends BaseVisitor<DefaultOperation> {
  private get store(): Store {
    return this.rdfNodeService.modelService.getLoadedAspectModel().rdfModel.store;
  }

  constructor(private rdfNodeService: RdfNodeService, rdfService: RdfService, public rdfListService: RdfListService) {
    super(rdfService);
  }

  visit(cell: mxgraph.mxCell): DefaultOperation {
    const operation: DefaultOperation = MxGraphHelper.getModelElement<DefaultOperation>(cell);
    this.setPrefix(operation.aspectModelUrn);
    const oldAspectModelUrn = operation.aspectModelUrn;
    this.addProperties(operation);
    if (oldAspectModelUrn !== operation.aspectModelUrn) {
      this.removeOldQuads(oldAspectModelUrn);
    }
    return operation;
  }

  private addProperties(operation: DefaultOperation) {
    this.rdfNodeService.update(operation, {
      preferredName: operation.getAllLocalesPreferredNames().map(language => ({
        language,
        value: operation.getPreferredName(language),
      })),
      description: operation.getAllLocalesDescriptions().map(language => ({
        language,
        value: operation.getDescription(language),
      })),
      see: operation.getSeeReferences() || [],
    });

    if (operation.input?.length) {
      this.rdfListService.push(operation, ...operation.input);
      for (const input of operation.input) {
        this.setPrefix(input.property.aspectModelUrn);
      }
    } else {
      this.rdfListService.createEmpty(operation, ListProperties.input);
    }

    if (operation.output) {
      const property = operation.output.property;

      this.setPrefix(property.aspectModelUrn);
      this.store.addQuad(
        DataFactory.namedNode(operation.aspectModelUrn),
        this.rdfService.currentRdfModel.BAMM().OutputProperty(),
        DataFactory.namedNode(property.aspectModelUrn)
      );
    }
  }

  private removeOldQuads(oldAspectModelUrn: string) {
    this.store.removeQuads(this.store.getQuads(DataFactory.namedNode(oldAspectModelUrn), null, null, null));
  }
}
