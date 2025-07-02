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

import {LoadedFilesService} from '@ame/cache';
import {getDescriptionsLocales, getPreferredNamesLocales} from '@ame/utils';
import {Injectable} from '@angular/core';
import {DefaultAspect} from '@esmf/aspect-model-loader';
import {ListProperties, RdfListService} from '../../rdf-list';
import {RdfNodeService} from '../../rdf-node';
import {BaseVisitor} from '../base-visitor';

@Injectable()
export class AspectVisitor extends BaseVisitor<DefaultAspect> {
  constructor(
    public rdfNodeService: RdfNodeService,
    public rdfListService: RdfListService,
    loadedFiles: LoadedFilesService,
  ) {
    super(loadedFiles);
  }

  visit(aspect: DefaultAspect): DefaultAspect {
    this.setPrefix(aspect.aspectModelUrn);
    this.updateProperties(aspect);
    return aspect;
  }

  private updateProperties(aspect: DefaultAspect) {
    this.rdfNodeService.update(aspect, {
      preferredName: getPreferredNamesLocales(aspect).map(language => ({
        language,
        value: aspect.getPreferredName(language),
      })),
      description: getDescriptionsLocales(aspect).map(language => ({
        language,
        value: aspect.getDescription(language),
      })),
      see: aspect.getSee() || [],
    });

    if (aspect.properties?.length) {
      this.rdfListService.push(aspect, ...aspect.properties);
      for (const property of aspect.properties) {
        this.setPrefix(property.aspectModelUrn);
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
