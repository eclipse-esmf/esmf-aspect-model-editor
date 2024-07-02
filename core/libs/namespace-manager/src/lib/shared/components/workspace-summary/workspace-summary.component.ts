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

import {Component, inject} from '@angular/core';
import {ViolationError, VisibleStep} from '@ame/editor';
import {NAMESPACES_SESSION} from '../../services';
import {MissingElement, NamespacesSessionInterface, Violation} from '../../models';
import {MatIcon} from '@angular/material/icon';
import {MatDialogContent} from '@angular/material/dialog';
import {MatTooltip} from '@angular/material/tooltip';
import {LanguageTranslateModule} from '@ame/translation';

@Component({
  standalone: true,
  selector: 'ame-workspace-summary',
  templateUrl: './workspace-summary.component.html',
  styleUrls: ['./workspace-summary.component.scss'],
  imports: [MatIcon, MatDialogContent, MatTooltip, LanguageTranslateModule],
})
export class WorkspaceSummaryComponent {
  private importSession: NamespacesSessionInterface = inject(NAMESPACES_SESSION);

  public readonly icons = {
    violation: 'error',
    success: 'done',
  };
  public readonly step = VisibleStep;

  public visibleStep: VisibleStep = VisibleStep.selection;
  public invalidFiles: string[] = this.importSession.invalidFiles;
  public missingElements: MissingElement[] = this.importSession.missingElements;

  public violations: Violation[] = this.importSession.violations;
  public errors: ViolationError[];

  constructor() {}
}
