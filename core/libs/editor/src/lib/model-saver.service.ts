import {ModelApiService} from '@ame/api';
import {LoadedFilesService, NamespaceFile} from '@ame/cache';
import {FileHandlingService} from '@ame/editor';
import {ModelService, RdfSerializerService} from '@ame/rdf/services';
import {ConfigurationService} from '@ame/settings-dialog';
import {ModelSavingTrackerService, NotificationsService, SaveValidateErrorsCodes} from '@ame/shared';
import {SidebarStateService} from '@ame/sidebar';
import {LanguageTranslationService} from '@ame/translation';
import {DestroyRef, Injectable, Injector, inject, runInInjectionContext} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {RdfModel} from '@esmf/aspect-model-loader';
import {Observable, Subscription, catchError, delayWhen, filter, first, map, of, retry, switchMap, tap, throwError, timer} from 'rxjs';
import {finalize} from 'rxjs/operators';

@Injectable({providedIn: 'root'})
export class ModelSaverService {
  private destroyRef = inject(DestroyRef);
  private modelApiService = inject(ModelApiService);
  private rdfSerializer = inject(RdfSerializerService);
  private loadedFiles = inject(LoadedFilesService);
  private modelService = inject(ModelService);
  private modelSavingTracker = inject(ModelSavingTrackerService);
  private notificationsService = inject(NotificationsService);
  private sidebarService = inject(SidebarStateService);
  private translate = inject(LanguageTranslationService);
  private configurationService = inject(ConfigurationService);
  private injector = inject(Injector);

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
        this.notificationsService.info({title: this.translate.language.NOTIFICATION_SERVICE.ASPECT_SAVED_SUCCESS});
        console.info('Aspect model was saved to the local folder');
        this.sidebarService.workspace.refresh();
      }),
      catchError(error => {
        console.error('Error on saving aspect model', error);
        this.notificationsService.error({
          title: this.translate.language.NOTIFICATION_SERVICE.ASPECT_SAVED_ERROR,
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
    this.settings.autoSaveEnabled ? this.startSaveModel() : this.stopSaveModel();
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
    const rdfContent = this.rdfSerializer.serializeModel(rdfModel || this.currentFile?.rdfModel);

    if (!rdfContent) {
      console.info('Model is empty. Skipping saving.');
      return throwError(() => ({code: SaveValidateErrorsCodes.emptyModel}));
    }

    return this.modelApiService.fetchFormatedAspectModel(rdfContent).pipe(
      takeUntilDestroyed(this.destroyRef),
      switchMap(content => {
        if (!content) {
          return throwError(() => ({code: SaveValidateErrorsCodes.emptyModel}));
        }

        const copyright = this.settings.copyrightHeader.join('\n');
        const contentWithCopyright = `${copyright}\n${content}`;

        const originalAspectModelUrn = this.currentFile?.originalAspectModelUrn;
        const newAspectModelUrn = this.currentFile?.getAnyAspectModelUrn();

        const saveModel = () =>
          this.modelApiService.saveAspectModel(contentWithCopyright, newAspectModelUrn, this.currentFile?.absoluteName || '');
        if (this.currentFile) {
          this.currentFile.originalAspectModelUrn = newAspectModelUrn;
        }

        if (this.currentFile?.isNameChanged || this.currentFile?.isNamespaceChanged) {
          return runInInjectionContext(this.injector, () => {
            const model = this.currentFile?.originalNamespace.split(':');
            const [namespaceName, namespaceVersion] = model && model.length === 2 ? model : ['', ''];

            return inject(FileHandlingService)
              .isFileExistOnWorkspace(namespaceName, namespaceVersion, this.currentFile?.originalName)
              .pipe(
                filter(Boolean),
                switchMap(() => this.modelApiService.deleteAspectModel(originalAspectModelUrn)),
                finalize(saveModel),
              );
          });
        }

        return saveModel();
      }),
      map(() => this.currentFile?.rdfModel),
    );
  }
}
