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

import {RdfModel} from '@ame/rdf/utils';
import {catchError, delay, filter, first, forkJoin, mergeMap, Observable, of, switchMap, tap, throwError} from 'rxjs';
import {LargeFileWarningService, ShapeSettingsService} from '@ame/editor';
import {inject, Injectable, Injector} from '@angular/core';
import {ModelApiService} from '@ame/api';
import {ModelService, RdfService} from '@ame/rdf/services';
import {CachedFile, NamespacesCacheService} from '@ame/cache';
import {
  BrowserService,
  ElectronSignalsService,
  FileContentModel,
  LoadingScreenService,
  LogService,
  ModelSavingTrackerService,
  NotificationsService,
  TitleService,
  ValidateStatus,
} from '@ame/shared';
import {Aspect, BaseMetaModelElement} from '@ame/meta-model';
import {SidebarStateService} from '@ame/sidebar';
import {InstantiatorService} from '@ame/instantiator';
import {
  MxGraphAttributeService,
  MxGraphHelper,
  MxGraphRenderer,
  MxGraphService,
  MxGraphSetupService,
  MxGraphShapeOverlayService,
} from '@ame/mx-graph';
import {LoadModelPayload} from '../models';
import {SammLanguageSettingsService} from '@ame/settings-dialog';
import {FiltersService} from '@ame/loader-filters';
import {LanguageTranslationService} from '@ame/translation';

@Injectable({
  providedIn: 'root',
})
export class LoadAspectModelService {
  private filtersService: FiltersService = inject(FiltersService);

  get shapeSettingsService(): ShapeSettingsService {
    return this.injector.get(ShapeSettingsService);
  }

  constructor(
    private modelService: ModelService,
    private modelApiService: ModelApiService,
    private mxGraphService: MxGraphService,
    private rdfService: RdfService,
    private titleService: TitleService,
    private sidebarService: SidebarStateService,
    private notificationsService: NotificationsService,
    private modelSavingTrackerService: ModelSavingTrackerService,
    private browserService: BrowserService,
    private electronSignalsService: ElectronSignalsService,
    private namespaceCacheService: NamespacesCacheService,
    private instantiatorService: InstantiatorService,
    private largeFileWarningService: LargeFileWarningService,
    private logService: LogService,
    private mxGraphShapeOverlayService: MxGraphShapeOverlayService,
    private sammLangService: SammLanguageSettingsService,
    private loadingScreenService: LoadingScreenService,
    private mxGraphAttributeService: MxGraphAttributeService,
    private injector: Injector,
    private mxGraphSetupService: MxGraphSetupService,
    private translate: LanguageTranslationService,
  ) {}

  loadModels(): Observable<RdfModel[]> {
    return this.modelApiService
      .getAllNamespacesFilesContent()
      .pipe(
        mergeMap((fileContentModels: FileContentModel[]) =>
          fileContentModels.length ? this.rdfService.parseModels(fileContentModels) : of([]),
        ),
      );
  }

  loadNewAspectModel(payload: LoadModelPayload): Observable<Array<RdfModel>> {
    this.sidebarService.workspace.refresh();
    this.notificationsService.info({title: 'Loading model', timeout: 2000});

    let rdfModel: RdfModel = null;
    return this.rdfService.loadModel(payload.rdfAspectModel, payload.namespaceFileName || '').pipe(
      tap(() => this.namespaceCacheService.removeAll()),
      tap(loadedRdfModel => (rdfModel = loadedRdfModel)),
      switchMap(() => this.loadExternalModels()),
      tap(() =>
        this.loadCurrentModel(
          rdfModel,
          payload.rdfAspectModel,
          payload.namespaceFileName || rdfModel.absoluteAspectModelFileName,
          payload.editElementUrn,
        ),
      ),
      tap(() => {
        this.modelSavingTrackerService.updateSavedModel();
        const [namespace, version, file] = (payload.namespaceFileName || this.rdfService.currentRdfModel.absoluteAspectModelFileName).split(
          ':',
        );

        if (this.browserService.isStartedAsElectronApp() || window.require) {
          this.electronSignalsService.call('updateWindowInfo', {
            namespace: `${namespace}:${version}`,
            fromWorkspace: payload.fromWorkspace,
            file,
          });
        }
        if (!payload.isDefault) {
          this.notificationsService.info({title: 'Aspect Model loaded', timeout: 3000});
        }
      }),
    );
  }

  loadExternalModels(): Observable<Array<RdfModel>> {
    this.rdfService.externalRdfModels = [];
    return this.modelApiService.getAllNamespacesFilesContent().pipe(
      first(),
      mergeMap((fileContentModels: Array<FileContentModel>) =>
        fileContentModels.length
          ? forkJoin(fileContentModels.map(fileContent => this.rdfService.loadExternalReferenceModelIntoStore(fileContent)))
          : of([] as Array<RdfModel>),
      ),
      tap(extRdfModel => {
        extRdfModel.forEach(extRdfModel => this.loadExternalAspectModel(extRdfModel.absoluteAspectModelFileName));
      }),
    );
  }

  loadExternalAspectModel(extRefAbsoluteAspectModelFileName: string): CachedFile {
    const extRdfModel = this.rdfService.externalRdfModels.find(
      extRef => extRef.absoluteAspectModelFileName === extRefAbsoluteAspectModelFileName,
    );
    const fileName = extRdfModel.aspectModelFileName;
    let foundCachedFile = this.namespaceCacheService.getFile([extRdfModel.getAspectModelUrn(), fileName]);
    if (!foundCachedFile) {
      foundCachedFile = this.namespaceCacheService.addFile(extRdfModel.getAspectModelUrn(), fileName);
      foundCachedFile = this.instantiatorService.instantiateFile(extRdfModel, foundCachedFile, fileName);
    }

    return foundCachedFile;
  }

  private loadCurrentModel(loadedRdfModel: RdfModel, rdfAspectModel: string, namespaceFileName: string, editElementUrn?: string): void {
    const [namespace, version, fileName] = namespaceFileName.split(':');
    this.namespaceCacheService.removeFile(`urn:samm:${namespace}:${version}#`, fileName);

    this.modelService
      .loadRdfModel(loadedRdfModel, rdfAspectModel, namespaceFileName)
      .pipe(
        first(),
        tap((aspect: Aspect) => {
          this.removeOldGraph();
          this.initializeNewGraph(editElementUrn);
          this.titleService.updateTitle(namespaceFileName || aspect?.aspectModelUrn, aspect ? 'Aspect' : 'Shared');
        }),
        catchError(error => {
          this.logService.logError('Error on loading aspect model', error);
          this.notificationsService.error({title: 'Error on loading the aspect model', message: error});
          // TODO: Use 'null' instead of empty object (requires thorough testing)
          return of({} as null);
        }),
      )
      .subscribe();
  }

  private removeOldGraph() {
    this.mxGraphService.deleteAllShapes();
  }

  private initializeNewGraph(editElementUrn?: string): void {
    try {
      const rdfModel = this.modelService.currentRdfModel;
      const mxGraphRenderer = new MxGraphRenderer(
        this.mxGraphService,
        this.mxGraphShapeOverlayService,
        this.namespaceCacheService,
        this.sammLangService,
        rdfModel,
      );

      const elements = this.namespaceCacheService.currentCachedFile.getAllElements();
      this.prepareGraphUpdate(mxGraphRenderer, elements, editElementUrn);
    } catch (error) {
      console.groupCollapsed('editor.service', error);
      console.groupEnd();
      throwError(() => error);
    }
  }

  private prepareGraphUpdate(mxGraphRenderer: MxGraphRenderer, elements: BaseMetaModelElement[], editElementUrn?: string): void {
    this.largeFileWarningService
      .openDialog(elements.length)
      .pipe(
        first(),
        filter(response => response !== 'cancel'),
        tap(() => this.toggleLoadingScreen()),
        delay(500), // Wait for modal animation
        switchMap(() => this.graphUpdateWorkflow(mxGraphRenderer, elements)),
      )
      .subscribe({
        next: () => this.finalizeGraphUpdate(editElementUrn),
        error: () => this.loadingScreenService.close(),
      });
  }

  private toggleLoadingScreen(): void {
    this.loadingScreenService.close();
    requestAnimationFrame(() => {
      this.loadingScreenService.open({title: this.translate.language.LOADING_SCREEN_DIALOG.MODEL_GENERATION});
    });
  }

  private graphUpdateWorkflow(mxGraphRenderer: MxGraphRenderer, elements: BaseMetaModelElement[]): Observable<boolean> {
    return this.mxGraphService.updateGraph(() => {
      this.mxGraphService.firstTimeFold = true;
      MxGraphHelper.filterMode = this.filtersService.currentFilter.filterType;
      const rootElements = elements.filter(e => !e.parents.length);
      const filtered = this.filtersService.filter(rootElements);

      for (const elementTree of filtered) {
        mxGraphRenderer.render(elementTree, null);
      }

      if (this.mxGraphAttributeService.inCollapsedMode) {
        this.mxGraphService.foldCells();
      }
    });
  }

  private finalizeGraphUpdate(editElementUrn?: string): void {
    this.mxGraphService.formatShapes(true);
    this.handleEditOrCenterView(editElementUrn);
    localStorage.removeItem(ValidateStatus.validating);
    this.loadingScreenService.close();
  }

  private handleEditOrCenterView(editElementUrn: string | null): void {
    if (editElementUrn) {
      this.shapeSettingsService.editModelByUrn(editElementUrn);
      this.mxGraphService.navigateToCellByUrn(editElementUrn);
    } else {
      this.mxGraphSetupService.centerGraph();
    }
  }
}
