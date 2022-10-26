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
import {DefaultAspect} from '@ame/meta-model';
import {MxGraphHelper} from '@ame/mx-graph';
import {RdfService} from '@ame/rdf/services';
import {mxgraph} from 'mxgraph-factory';
import {ListProperties, RdfListService} from '../../rdf-list';
import {RdfNodeService} from '../../rdf-node';
import {BaseVisitor} from '../base-visitor';

@Injectable()
export class AspectVisitor extends BaseVisitor<DefaultAspect> {
  constructor(public rdfNodeService: RdfNodeService, public rdfListService: RdfListService, rdfService: RdfService) {
    super(rdfService);
  }

  visit(cell: mxgraph.mxCell): DefaultAspect {
    const aspect: DefaultAspect = MxGraphHelper.getModelElement(cell);
    this.setPrefix(aspect.aspectModelUrn);
    aspect.aspectModelUrn = `${aspect.aspectModelUrn.split('#')[0]}#${aspect.name}`;
    this.updateProperties(aspect);
    return aspect;
  }

  private updateProperties(aspect: DefaultAspect) {
    this.rdfListService.setRdfModel(this.rdfNodeService.modelService.getLoadedAspectModel().rdfModel);
    this.rdfNodeService.update(aspect, {
      preferredName: aspect.getAllLocalesPreferredNames().map(language => ({
        language,
        value: aspect.getPreferredName(language),
      })),
      description: aspect.getAllLocalesDescriptions().map(language => ({
        language,
        value: aspect.getDescription(language),
      })),
      see: aspect.getSeeReferences() || [],
    });

    if (aspect.properties?.length) {
      this.rdfListService.push(aspect, ...aspect.properties);
      for (const property of aspect.properties) {
        this.setPrefix(property.property.aspectModelUrn);
      }
    } else {
      this.rdfListService.createEmpty(aspect, ListProperties.properties);
    }

    if (aspect.operations?.length) {
      this.rdfListService.push(aspect, ...aspect.operations);
      for (const operation of aspect.operations) {
        this.setPrefix(operation.aspectModelUrn);
      }
    } else {
      this.rdfListService.createEmpty(aspect, ListProperties.operations);
    }

    if (aspect.events?.length) {
      this.rdfListService.push(aspect, ...aspect.events);
      for (const event of aspect.events) {
        this.setPrefix(event.aspectModelUrn);
      }
    } else {
      this.rdfListService.createEmpty(aspect, ListProperties.events);
    }
  }
}
