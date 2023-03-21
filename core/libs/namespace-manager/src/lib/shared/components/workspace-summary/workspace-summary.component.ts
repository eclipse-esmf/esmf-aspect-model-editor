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

import {Component, Inject} from '@angular/core';
import {NotificationsService} from '@ame/shared';
import {VisibleStep} from 'libs/editor/src/lib/editor-toolbar/enum';
import {ViolationError} from '@ame/editor';
import {NAMESPACES_SESSION} from '../../services';
import {NamespacesSessionInterface, MissingElement, Violation} from '../../models';

@Component({
  selector: 'ame-workspace-summary',
  templateUrl: './workspace-summary.component.html',
  styleUrls: ['./workspace-summary.component.scss'],
})
export class WorkspaceSummaryComponent {
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

  constructor(
    private notificationService: NotificationsService,
    @Inject(NAMESPACES_SESSION) private importSession: NamespacesSessionInterface
  ) {}

  async copySummaryToClipboard() {
    const textToClipboard = JSON.stringify(
      {
        namespaces: this.violations,
        invalidFiles: this.invalidFiles,
        missingElements: this.missingElements,
      },
      null,
      2
    );

    try {
      await navigator.clipboard.writeText(textToClipboard);
      this.notificationService.success({title: 'Summary copied to clipboard'});
    } catch {
      this.notificationService.success({title: 'Error on copying summary to clipboard'});
    }
  }
}
