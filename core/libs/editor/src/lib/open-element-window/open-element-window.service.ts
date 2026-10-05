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

import {LoadedFilesService} from '@ame/domain';
import {LanguageTranslationService, NotificationsService} from '@ame/shared';
import {inject, Injectable} from '@angular/core';
import {NamedElement} from '@esmf/aspect-model-loader';
import {ModelOpenerService} from '../model-opener/model-opener.service';

@Injectable({providedIn: 'root'})
export class OpenReferencedElementService {
  private readonly loadedFiles = inject(LoadedFilesService);
  private readonly modelOpener = inject(ModelOpenerService);
  private readonly notifications = inject(NotificationsService);
  private readonly translate = inject(LanguageTranslationService);

  openReferencedElement(element: NamedElement) {
    if (!element) {
      return;
    }

    if (this.loadedFiles.isElementUnresolved(element)) {
      this.notifications.warning({
        title: this.translate.translateService.translate('notificationService.unresolvedElementTitle'),
        message: this.translate.translateService.translate('notificationService.unresolvedElementMessage', {
          element: element.aspectModelUrn,
        }),
      });
      return;
    }

    const namespaceFile = this.loadedFiles.getNamespaceFileFromElement(element);
    const file = namespaceFile?.name || this.loadedFiles.getFileFromElement(element) || 'aspect.ttl';
    const namespace = namespaceFile?.namespace || element.aspectModelUrn.split('#')[0].replace('urn:samm:', '').replace('urn:bamm:', '');

    this.modelOpener
      .promptAndOpen({
        file,
        namespace,
        aspectModelUrn: element.aspectModelUrn,
        editElementUrn: element.aspectModelUrn,
      })
      .subscribe();
  }
}
