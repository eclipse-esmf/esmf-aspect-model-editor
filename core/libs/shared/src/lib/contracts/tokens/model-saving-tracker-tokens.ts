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

import {InjectionToken} from '@angular/core';
import {Observable} from 'rxjs';

export interface IModelSavingTrackerService {
  readonly currentModel$: Observable<string>;
  readonly isSaved$: Observable<boolean>;
  getSavedModel(): string;
  setSavedModel(saved: string, firstLoad?: boolean): void;
  updateSavedModel(firstLoad?: boolean): void;
}

export const MODEL_SAVING_TRACKER_SERVICE = new InjectionToken<IModelSavingTrackerService>('MODEL_SAVING_TRACKER_SERVICE');
