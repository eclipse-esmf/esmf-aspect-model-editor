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

import {ViolationError} from '@ame/editor';
import {MxGraphService} from '@ame/mx-graph';
import {NotificationsService} from '@ame/shared';
import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ModelValidatorService {
  constructor(
    private mxGraphService: MxGraphService,
    private notificationsService: NotificationsService,
  ) {
    this.notificationsService.clearNotifications();
  }

  /*
   * Informs user about the errors that are correctable.
   * In this category are included syntactic,processing and semantic errors.
   */
  notifyCorrectableErrors(violationErrors: Array<ViolationError>) {
    if (!violationErrors.length) {
      this.notificationsService.info({title: 'Validation completed successfully', message: 'The model is valid'});
      console.info('Validated completed successfully');
      return;
    }

    this.notificationsService.warning({title: 'Validation completed with errors', message: 'The model is not valid'});
    console.warn('Validated completed with errors');

    violationErrors.forEach((error: ViolationError) => {
      this.notificationsService.validationError({
        title: error.message,
        message: error.fix[0], //TODO should be changed, when more fixes are available
        link: error.focusNode,
        timeout: 5000,
      });
      this.mxGraphService.showValidationErrorOnShape(error.focusNode);
    });
  }
}
