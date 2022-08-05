/*
 * Copyright (c) 2022 Robert Bosch Manufacturing Solutions GmbH
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
import {RdfModel} from '@ame/rdf/utils';
import {ConfigurationService, Settings} from '@ame/settings-dialog';
import {LogService, NotificationsService, ProcessingError, SemanticError, SyntacticError} from '@ame/shared';

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
   * This method will return true if at least one error is critical, otherwise false.
   * In this category are included structural errors.
   */
  checkForCriticalErrors(validationErrors: Array<SemanticError | SyntacticError | ProcessingError>, rdfModel: RdfModel): boolean {
    const metaModelNames = rdfModel.BAMMC().getMetaModelNames();
    const criticalErrors = validationErrors.filter((error: any) => error?.resultMessage && metaModelNames.includes(error.resultPath));

    return criticalErrors.length !== 0;
  }

  /*
   * Informs user about the errors that are correctable.
   * In this category are included syntactic,processing and semantic errors.
   */
  notifyCorrectableErrors(validationErrors: Array<SemanticError | SyntacticError | ProcessingError>): void {
    if (!validationErrors.length) {
      this.notificationsService.info('Validation completed successfully', 'The model is valid');
      this.logService.logInfo('Validated completed successfully');
      return;
    }

    this.notificationsService.warning('Validation completed with errors', 'The model is not valid');
    this.logService.logWarn('Validated completed with errors');

    validationErrors.forEach((error: any) => {
      if (error.originalExceptionMessage) {
        this.notifySyntacticError(error);
      } else if (error.message) {
        this.notifyProcessingError(error);
      } else {
        this.notifySemanticError(error);
      }
    });
  }

  private notifySyntacticError(error: SyntacticError) {
    this.notificationsService.validationError(error.originalExceptionMessage, null, null, 5000);
  }

  private notifyProcessingError(error: ProcessingError) {
    this.notificationsService.validationError(error.message, null, null, 5000);
  }

  private notifySemanticError(error: SemanticError) {
    this.notificationsService.validationError(
      `Error on element ${error.focusNode ? error.focusNode.split('#')[1] + ': ' + error.resultMessage : error.resultMessage}`,
      null,
      error.focusNode,
      5000
    );
    this.mxGraphService.showValidationErrorOnShape(error.focusNode);
  }
}
