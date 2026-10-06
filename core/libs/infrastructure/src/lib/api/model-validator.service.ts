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

import {GraphValidationErrorHighlighterPort, ModelValidationStore, ViolationError} from '@ame/domain';
import {NotificationsService} from '@ame/shared';
import {inject, Injectable} from '@angular/core';

@Injectable({providedIn: 'root'})
export class ModelValidatorService {
  private readonly shapeHighlighter = inject(GraphValidationErrorHighlighterPort, {optional: true});
  private readonly notificationsService = inject(NotificationsService);
  private readonly validationStore = inject(ModelValidationStore);

  constructor() {
    this.notificationsService.clearNotifications();
  }

  /** Forgets the violations of the last validation, e.g. because the model could not be validated this time. */
  clearViolations() {
    this.validationStore.setViolations([]);
  }

  /*
   * Informs user about the errors that are correctable.
   * In this category are included syntactic,processing and semantic errors.
   */
  notifyCorrectableErrors(violationErrors: Array<ViolationError>, validInfo = false) {
    this.validationStore.setViolations(violationErrors ?? []);

    if (!violationErrors.length) {
      if (validInfo) {
        this.notificationsService.info({title: 'Validation completed successfully', message: 'The model is valid'});
        console.info('Validated completed successfully');
      }
      return;
    }

    this.notificationsService.warning({title: 'Validation completed with errors', message: 'The model is not valid'});
    console.warn('Validated completed with errors');

    violationErrors.forEach((error: ViolationError) => {
      this.notificationsService.validationError({
        title: error.message,
        message: error.fix.join('; '),
        link: error.focusNode,
        timeout: 5000,
      });
      this.shapeHighlighter?.showValidationErrorOnShape(error.focusNode);
    });
  }
}
