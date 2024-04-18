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

import {BehaviorSubject, delayWhen, first, Observable, of, retry, Subscription, switchMap, tap, throwError, timer} from 'rxjs';
import {ViolationError} from '@ame/editor';
import {inject, Injectable} from '@angular/core';
import {ModelApiService} from '@ame/api';
import {ModelService, RdfService} from '@ame/rdf/services';
import {LogService, NotificationsService, SaveValidateErrorsCodes, ValidateStatus} from '@ame/shared';
import {ConfigurationService} from '@ame/settings-dialog';
import {LanguageTranslationService} from '@ame/translation';
import {MxGraphService} from '@ame/mx-graph';
import {NamespacesCacheService} from '@ame/cache';

@Injectable({
  providedIn: 'root',
})
export class ValidateService {
  private configurationService: ConfigurationService = inject(ConfigurationService);

  private validateModelSubscription$: Subscription;

  private get settings() {
    return this.configurationService.getSettings();
  }

  constructor(
    private mxGraphService: MxGraphService,
    private modelService: ModelService,
    private modelApiService: ModelApiService,
    private rdfService: RdfService,
    private logService: LogService,
    private notificationsService: NotificationsService,
    private translate: LanguageTranslationService,
    private namespaceCacheService: NamespacesCacheService,
  ) {}

  enableAutoValidation(): void {
    this.settings.autoValidationEnabled ? this.startValidateModel() : this.stopValidateModel();
  }

  private startValidateModel(): void {
    this.stopValidateModel();
    localStorage.removeItem(ValidateStatus.validating);
    this.validateModelSubscription$ = this.autoValidateModel().subscribe();
  }

  private stopValidateModel(): void {
    localStorage.removeItem(ValidateStatus.validating);
    if (this.validateModelSubscription$) {
      this.validateModelSubscription$.unsubscribe();
    }
  }

  private autoValidateModel(): Observable<ViolationError[]> {
    return of({}).pipe(
      delayWhen(() => timer(this.settings.validationTimerSeconds * 1000)),
      switchMap(() => (this.namespaceCacheService.currentCachedFile.hasCachedElements() ? this.validate().pipe(first()) : of([]))),
      tap(() => localStorage.removeItem(ValidateStatus.validating)),
      tap(() => this.enableAutoValidation()),
      retry({
        delay: error => {
          if (!Object.values(SaveValidateErrorsCodes).includes(error?.type)) {
            this.logService.logError(`Error occurred while validating the current model (${error})`);
            this.notificationsService.error({
              title: this.translate.language.NOTIFICATION_SERVICE.VALIDATION_ERROR_TITLE,
              message: this.translate.language.NOTIFICATION_SERVICE.VALIDATION_ERROR_MESSAGE,
              timeout: 5000,
            });
          }
          localStorage.removeItem(ValidateStatus.validating);

          return timer(this.settings.validationTimerSeconds * 1000);
        },
      }),
    );
  }

  validate(): Observable<Array<ViolationError>> {
    this.mxGraphService.resetValidationErrorOnAllShapes();

    return this.modelService.synchronizeModelToRdf().pipe(
      switchMap(value =>
        localStorage.getItem(ValidateStatus.validating)
          ? throwError(() => ({type: SaveValidateErrorsCodes.validationInProgress}))
          : of(value),
      ),
      switchMap(() => {
        localStorage.setItem(ValidateStatus.validating, 'yes');
        const rdfModel = this.modelService.currentRdfModel;
        return rdfModel
          ? this.modelApiService.validate(this.rdfService.serializeModel(rdfModel))
          : throwError(() => ({type: SaveValidateErrorsCodes.emptyModel}));
      }),
    );
  }
}
