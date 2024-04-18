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

import {catchError, delayWhen, first, Observable, of, retry, Subscription, switchMap, tap, timer} from 'rxjs';
import {inject, Injectable} from '@angular/core';
import {ModelService, RdfService} from '@ame/rdf/services';
import {LogService, ModelSavingTrackerService, NotificationsService} from '@ame/shared';
import {ConfigurationService} from '@ame/settings-dialog';
import {LanguageTranslationService} from '@ame/translation';
import {NamespacesCacheService} from '@ame/cache';
import {RdfModel} from '@ame/rdf/utils';
import {SidebarStateService} from '@ame/sidebar';

@Injectable({
  providedIn: 'root',
})
export class SaveService {
  private configurationService: ConfigurationService = inject(ConfigurationService);

  private saveModelSubscription$: Subscription;

  private get settings() {
    return this.configurationService.getSettings();
  }

  constructor(
    private modelService: ModelService,
    private sidebarStateService: SidebarStateService,
    private rdfService: RdfService,
    private logService: LogService,
    private notificationsService: NotificationsService,
    private translate: LanguageTranslationService,
    private namespaceCacheService: NamespacesCacheService,
    private modelSavingTracker: ModelSavingTrackerService,
  ) {}

  enableAutoSave(): void {
    this.settings.autoSaveEnabled ? this.startSaveModel() : this.stopSaveModel();
  }

  private startSaveModel(): void {
    this.stopSaveModel();
    this.saveModelSubscription$ = this.autoSaveModel().subscribe();
  }

  private stopSaveModel(): void {
    if (this.saveModelSubscription$) {
      this.saveModelSubscription$.unsubscribe();
    }
  }

  private autoSaveModel(): Observable<RdfModel | object> {
    return of({}).pipe(
      delayWhen(() => timer(this.settings.saveTimerSeconds * 1000)),
      switchMap(() =>
        this.namespaceCacheService.currentCachedFile.hasCachedElements() &&
        !this.rdfService.currentRdfModel.aspectModelFileName.includes('empty.ttl')
          ? this.saveModel().pipe(first())
          : of([]),
      ),
      tap(() => this.enableAutoSave()),
      retry({
        delay: () => timer(this.settings.saveTimerSeconds * 1000),
      }),
    );
  }

  saveModel(): Observable<RdfModel | object> {
    return this.modelService.saveModel().pipe(
      tap(() => {
        this.modelSavingTracker.updateSavedModel();
        this.notificationsService.info({title: this.translate.language.NOTIFICATION_SERVICE.ASPECT_SAVED_SUCCESS});
        this.logService.logInfo('Aspect model was saved to the local folder');
        this.sidebarStateService.workspace.refresh();
      }),
      catchError(error => {
        // TODO Should be refined
        console.groupCollapsed('editor-service -> saveModel', error);
        console.groupEnd();

        this.logService.logError('Error on saving aspect model', error);
        this.notificationsService.error({title: this.translate.language.NOTIFICATION_SERVICE.ASPECT_SAVED_ERROR});
        return of({});
      }),
    );
  }
}
