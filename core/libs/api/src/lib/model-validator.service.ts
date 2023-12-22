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

import {Injectable} from '@angular/core';
import {MxGraphService} from '@ame/mx-graph';
import {ConfigurationService, Settings} from '@ame/settings-dialog';
import {LogService, NotificationsService} from '@ame/shared';
import {ViolationError} from '@ame/editor';

@Injectable({
  providedIn: 'root',
})
export class ModelValidatorService {
  private settings: Settings;

  constructor(
    private mxGraphService: MxGraphService,
    private configurationService: ConfigurationService,
    private notificationsService: NotificationsService,
    private logService: LogService
  ) {
    this.settings = this.configurationService.getSettings();
    this.notificationsService.clearNotifications();
  }

  /*
   * Informs user about the errors that are correctable.
   * In this category are included syntactic,processing and semantic errors.
   */
  notifyCorrectableErrors(violationErrors: Array<ViolationError>) {
    if (!violationErrors.length) {
      this.notificationsService.info({title: 'Validation completed successfully', message: 'The model is valid'});
      this.logService.logInfo('Validated completed successfully');
      return;
    }

    this.notificationsService.warning({title: 'Validation completed with errors', message: 'The model is not valid'});
    this.logService.logWarn('Validated completed with errors');

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
