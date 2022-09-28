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
import {NamespacesCacheService} from '@ame/cache';
import {BaseModelService} from './base-model-service';
import {BaseMetaModelElement, DefaultAspect, OverWrittenPropertyKeys} from '@ame/meta-model';
import {ModelService} from '@ame/rdf/services';
import {mxgraph} from 'mxgraph-factory';
import {AspectRenderService, MxGraphHelper} from '@ame/mx-graph';
import {Title} from '@angular/platform-browser';
import {NotificationsService} from '@ame/shared';
import {EditorService} from '@ame/editor';
import {ModelApiService} from '@ame/api';

@Injectable({providedIn: 'root'})
export class AspectModelService extends BaseModelService {
  constructor(
    namespacesCacheService: NamespacesCacheService,
    modelService: ModelService,
    editorService: EditorService,
    modelApiService: ModelApiService,
    private notificationsService: NotificationsService,
    private aspectRenderer: AspectRenderService,
    private titleService: Title
  ) {
    super(namespacesCacheService, modelService, editorService, modelApiService);
  }

  isApplicable(metaModelElement: BaseMetaModelElement): boolean {
    return metaModelElement instanceof DefaultAspect;
  }

  update(cell: mxgraph.mxCell, form: {[key: string]: any}) {
    const metaModelElement: DefaultAspect = MxGraphHelper.getModelElement(cell);
    super.update(cell, form);

    if (form.editedProperties) {
      for (const {property, keys} of metaModelElement.properties) {
        const newKeys: OverWrittenPropertyKeys = form.editedProperties[property.aspectModelUrn];
        keys.notInPayload = newKeys.notInPayload;
        keys.optional = newKeys.optional;
        keys.payloadName = newKeys.payloadName;
      }
    }

    this.aspectRenderer.update({cell});
    this.titleService.setTitle(`${metaModelElement?.aspectModelUrn}.ttl - Aspect Model Editor`);
  }

  delete() {
    // Aspect model cannot be deleted
    this.notificationsService.info({title: 'The Aspect can`t be deleted'});
  }
}
