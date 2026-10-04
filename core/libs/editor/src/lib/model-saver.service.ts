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

import {
  ConfigurationService,
  getNamespaceModels,
  LoadedFilesService,
  ModelApiPort,
  ModelDocumentService,
  ModelSaverPort,
  ModelService,
  NamespaceFile,
  RdfPort,
  WorkspaceStore,
} from '@ame/domain';
import {LanguageTranslationService, NotificationsService, SaveValidateErrorsCodes} from '@ame/shared';
import {DestroyRef, inject, Injectable} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {RdfModel} from '@esmf/aspect-model-loader';
import {catchError, delayWhen, first, map, Observable, of, retry, Subscription, switchMap, tap, throwError, timer} from 'rxjs';
import {ModelSavingTrackerService} from './model-saving-tracker.service';

import {TabStateService} from './tabs/tab-state.service';

@Injectable({providedIn: 'root'})
export class ModelSaverService implements ModelSaverPort {
  private destroyRef = inject(DestroyRef);
  private modelApiService = inject(ModelApiPort);
  private rdfSerializer = inject(RdfPort);
  private loadedFiles = inject(LoadedFilesService);
  private modelService = inject(ModelService);
  private modelSavingTracker = inject(ModelSavingTrackerService);
  private notificationsService = inject(NotificationsService);
  private workspaceStore = inject(WorkspaceStore);
  private translate = inject(LanguageTranslationService);
  private configurationService = inject(ConfigurationService);
  private modelDocumentService = inject(ModelDocumentService);

  private readonly tabStateService = inject(TabStateService);

  private saveModelSubscription$: Subscription;

  private get settings() {
    return this.configurationService.getSettings();
  }

  private get currentFile(): NamespaceFile | undefined {
    return this.loadedFiles.currentLoadedFile;
  }

  saveModel(rdfModel?: RdfModel) {
    const synchronizedModel = this.modelService.synchronizeModelToRdf();
    return (synchronizedModel || throwError(() => ({type: SaveValidateErrorsCodes.desynchronized}))).pipe(
      takeUntilDestroyed(this.destroyRef),
      switchMap(() => this.writeModelToWorkspace(rdfModel)),
      tap(() => {
        this.modelSavingTracker.updateSavedModel();
        this.tabStateService.setTabDirty(this.tabStateService.activeTabId(), false);
        this.notificationsService.info({title: this.translate.language.notificationService.aspectSavedSuccess});
        console.info('Aspect model was saved to the local folder');
        this.workspaceStore.triggerRefresh();
      }),
      catchError(error => {
        console.error('Error on saving aspect model', error);
        this.notificationsService.error({
          title: this.translate.language.notificationService.aspectSavedError,
          message: error?.error?.message,
        });
        return of(null);
      }),
    );
  }

  autoSaveModel(): Observable<RdfModel> {
    return of({}).pipe(
      takeUntilDestroyed(this.destroyRef),
      delayWhen(() => timer(this.settings.saveTimerSeconds * 1000)),
      switchMap(() =>
        this.currentFile.cachedFile.getKeys().length && !this.currentFile.name.includes('empty.ttl')
          ? this.saveModel().pipe(takeUntilDestroyed(this.destroyRef), first())
          : of(null),
      ),
      tap(() => {
        this.enableAutoSave();
      }),
      retry({
        delay: () => timer(this.settings.saveTimerSeconds * 1000),
      }),
    );
  }

  enableAutoSave(): void {
    if (this.settings.autoSaveEnabled) {
      this.startSaveModel();
    } else {
      this.stopSaveModel();
    }
  }

  private startSaveModel(): void {
    this.stopSaveModel();
    this.saveModelSubscription$ = this.autoSaveModel().subscribe();
  }

  private stopSaveModel() {
    if (this.saveModelSubscription$) {
      this.saveModelSubscription$.unsubscribe();
    }
  }

  private writeModelToWorkspace(rdfModel?: RdfModel): Observable<RdfModel> {
    const currentModel = rdfModel || this.currentFile?.rdfModel;
    const rdfContent = this.rdfSerializer.serializeModel(currentModel);

    if (!rdfContent || !/\S/.test(rdfContent.replace(/@prefix[^\n]*\n/g, ''))) {
      console.info('Model is empty. Skipping saving.');
      return throwError(() => ({
        error: {
          message: this.translate.language.notificationService.aspectSavedEmptyModel,
        },
      }));
    }

    return this.modelApiService.fetchFormatedAspectModel(rdfContent, currentModel?.getSourceLocation()).pipe(
      takeUntilDestroyed(this.destroyRef),
      switchMap(content => {
        if (!content) {
          return throwError(() => ({
            error: {
              message: this.translate.language.notificationService.aspectSavedEmptyModel,
            },
          }));
        }

        const contentWithCopyright = this.modelDocumentService.toDocument(content, currentModel);

        const originalAspectModelUrn = this.currentFile?.originalAspectModelUrn;
        const newAspectModelUrn = this.currentFile?.getAnyAspectModelUrn();

        const saveModel = () =>
          this.modelApiService.saveAspectModel(contentWithCopyright, newAspectModelUrn, this.currentFile?.absoluteName || '');
        if (this.currentFile) {
          this.currentFile.originalAspectModelUrn = newAspectModelUrn;
        }

        if (this.currentFile?.isNameChanged || this.currentFile?.isNamespaceChanged) {
          const model = this.currentFile?.originalNamespace.split(':');
          const [namespaceName, namespaceVersion] = model && model.length === 2 ? model : ['', ''];
          const originalName = this.currentFile?.originalName;

          return this.modelApiService.loadNamespacesStructure().pipe(
            map(structure => getNamespaceModels(structure, namespaceName, namespaceVersion).some(m => m.name === originalName)),
            map(exists => (exists ? this.modelApiService.deleteAspectModel(originalAspectModelUrn) : of(null))),
            switchMap(() => saveModel()),
          );
        }

        return saveModel();
      }),
      map(() => this.currentFile?.rdfModel),
    );
  }
}
