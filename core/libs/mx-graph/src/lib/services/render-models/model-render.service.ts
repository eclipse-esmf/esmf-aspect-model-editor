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

import {inject, Injectable} from '@angular/core';
import {mxgraph} from 'mxgraph-factory';
import {
  CharacteristicRenderService,
  ConstraintRenderService,
  EnumerationRenderService,
  EventRenderService,
  PropertyRenderService,
  TraitRenderService,
  UnitRenderService,
} from '.';
import {AspectRenderService} from './aspect-render.service';
import {BaseRenderService} from './base-render-service';
import {EntityRenderService} from './entity-render.service';
import {EntityValueRenderService} from './entity-value-render.service';

@Injectable({providedIn: 'root'})
export class ModelRenderService {
  private aspectRenderService = inject(AspectRenderService);
  private characteristicRenderService = inject(CharacteristicRenderService);
  private entityRenderService = inject(EntityRenderService);
  private propertyRenderService = inject(PropertyRenderService);
  private traitRenderService = inject(TraitRenderService);
  private entityValueRenderService = inject(EntityValueRenderService);
  private enumerationRenderService = inject(EnumerationRenderService);
  private eventRenderService = inject(EventRenderService);
  private unitRenderService = inject(UnitRenderService);
  private constraintRenderService = inject(ConstraintRenderService);

  update(cell: mxgraph.mxCell) {
    this.getElementModelService(cell)?.update({cell});
  }

  private getElementModelService(cell: mxgraph.mxCell): BaseRenderService {
    // Order is important
    const elementServices: BaseRenderService[] = [
      this.aspectRenderService,
      this.unitRenderService,
      this.traitRenderService,
      this.constraintRenderService,
      this.enumerationRenderService,
      this.characteristicRenderService,
      this.entityValueRenderService,
      this.entityRenderService,
      this.eventRenderService,
      this.propertyRenderService,
    ];

    // choose the applicable model service
    for (const elementModelService of elementServices) {
      if (elementModelService.isApplicable(cell)) {
        return elementModelService;
      }
    }
    return null;
  }
}
