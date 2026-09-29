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

import {Injectable} from '@angular/core';
import {DefaultEvent, NamedElement} from '@esmf/aspect-model-loader';
import {BaseModelService} from './base-model-service';

@Injectable({providedIn: 'root'})
export class EventModelService extends BaseModelService {
  isApplicable(metaModelElement: NamedElement): boolean {
    return metaModelElement instanceof DefaultEvent;
  }

  update(cell: any, form: {[key: string]: any}) {
    super.update(cell, form);
    this.graphAdapter?.updateCell(cell);
  }

  delete(cell: any) {
    super.delete(cell);
    this.graphAdapter?.removeCells([cell]);
  }
}
