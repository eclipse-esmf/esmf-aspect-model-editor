/*
 * Copyright (c) 2026 Robert Bosch Manufacturing Solutions GmbH
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
import {Cell} from '@maxgraph/core';
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
  private readonly aspectRenderService = inject(AspectRenderService);
  private readonly characteristicRenderService = inject(CharacteristicRenderService);
  private readonly entityRenderService = inject(EntityRenderService);
  private readonly propertyRenderService = inject(PropertyRenderService);
  private readonly traitRenderService = inject(TraitRenderService);
  private readonly entityValueRenderService = inject(EntityValueRenderService);
  private readonly enumerationRenderService = inject(EnumerationRenderService);
  private readonly eventRenderService = inject(EventRenderService);
  private readonly unitRenderService = inject(UnitRenderService);
  private readonly constraintRenderService = inject(ConstraintRenderService);

  update(cell: Cell) {
    this.getElementModelService(cell)?.update({cell});
  }

  private getElementModelService(cell: Cell): BaseRenderService {
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
