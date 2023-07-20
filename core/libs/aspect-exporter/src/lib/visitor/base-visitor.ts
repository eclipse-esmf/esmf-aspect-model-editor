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

import {BaseMetaModelElement} from '@ame/meta-model';
import {RdfService} from '@ame/rdf/services';
import {DataFactory} from 'n3';

export abstract class BaseVisitor<T> {
  constructor(protected rdfService: RdfService) {}

  abstract visit(element: BaseMetaModelElement): T;

  protected setPrefix(aspectModelUrn: string) {
    const namespace = `${aspectModelUrn.split('#')[0]}#`;
    if (this.rdfService.currentRdfModel.hasNamespace(namespace)) {
      return;
    }

    const externalRdfModel = this.rdfService.externalRdfModels.find(
      rdfModel => rdfModel.store.getQuads(DataFactory.namedNode(aspectModelUrn), null, null, null).length > 0
    );
    const alias = externalRdfModel?.getAliasByNamespace(namespace);
    this.rdfService.currentRdfModel.addPrefix(alias, namespace);
  }
}
