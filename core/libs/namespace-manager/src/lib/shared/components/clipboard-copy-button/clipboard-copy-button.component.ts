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

import {Component, inject} from '@angular/core';
import {NamespacesSessionInterface} from '../../models';
import {NAMESPACES_SESSION} from '../../services';
import {NotificationsService} from '@ame/shared';
import {LanguageTranslationService} from '@ame/translation';

@Component({
  selector: 'ame-clipboard-copy-button',
  templateUrl: './clipboard-copy-button.component.html',
  styleUrls: ['./clipboard-copy-button.component.scss'],
})
export class ClipboardCopyButtonComponent {
  private namespaceSession: NamespacesSessionInterface = inject(NAMESPACES_SESSION);
  private notificationService: NotificationsService = inject(NotificationsService);

  constructor(private translate: LanguageTranslationService) {}

  async copySummaryToClipboard() {
    const textToClipboard = JSON.stringify(
      {
        namespaces: this.namespaceSession.violations,
        invalidFiles: this.namespaceSession.invalidFiles,
        missingElements: this.namespaceSession.missingElements,
      },
      null,
      2
    );

    try {
      await navigator.clipboard.writeText(textToClipboard);
      this.notificationService.success({title: this.translate.language.NOTIFICATION_SERVICE.SUMMARY_CLIPBOARD_SUCCESS});
    } catch {
      this.notificationService.success({title: this.translate.language.NOTIFICATION_SERVICE.SUMMARY_CLIPBOARD_FAILURE});
    }
  }
}
