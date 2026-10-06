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

import {GraphSettingsPort} from '@ame/domain';
import {inject, Injectable} from '@angular/core';
import {ShapeLanguageRemover} from '../renderers/shape-language-remover';
import {MaxGraphService} from './max-graph.service';

@Injectable({providedIn: 'root'})
export class MaxGraphSettingsBridgeService implements GraphSettingsPort {
  private readonly maxGraphService = inject(MaxGraphService);
  private readonly shapeLanguageRemover = inject(ShapeLanguageRemover);

  formatShapes(enableHierarchicalLayout?: boolean): void {
    this.maxGraphService.formatShapes(enableHierarchicalLayout);
  }

  updateGraph(callback: () => void): void {
    this.maxGraphService.updateGraph(callback);
  }

  removeUnnecessaryLanguages(languages: string[]): void {
    this.shapeLanguageRemover.removeUnnecessaryLanguages(languages);
  }
}
