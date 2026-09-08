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

import {APP_CONFIG, AppConfig, BrowserService, IPC_RENDERER} from '@ame/shared';
import {isVersionOutdated} from '@ame/utils';
import {HttpClient} from '@angular/common/http';
import {inject, Injectable, signal} from '@angular/core';
import {RdfLoader, RdfModel} from '@esmf/aspect-model-loader';
import {forkJoin, map, Observable, of, switchMap} from 'rxjs';
import {ModelApiService} from './model-api.service';
import {MigrationStatus, NamedRdfModel} from './models';

@Injectable({providedIn: 'root'})
export class MigratorApiService {
  private readonly ipcRenderer = inject(IPC_RENDERER);
  private readonly config: AppConfig = inject(APP_CONFIG);
  private readonly http = inject(HttpClient);
  private readonly browserService = inject(BrowserService);
  private readonly modelApiService = inject(ModelApiService);

  private readonly defaultPort = this.config.defaultPort;
  private readonly api = this.config.api;
  private serviceUrl = this.config.serviceUrl;

  private readonly _rdfModelsToMigrate = signal<RdfModel[]>([]);
  /** Rdf models that are outdated and need to be migrated to the current SAMM version. */
  readonly rdfModelsToMigrate = this._rdfModelsToMigrate.asReadonly();

  constructor() {
    if (this.browserService.isStartedAsElectronApp() && !window.location.search.includes('?e2e=true')) {
      this.ipcRenderer.getBackendPort().then((port: string) => (this.serviceUrl = this.serviceUrl.replace(this.defaultPort, port)));
    }
  }

  getRdfModelsFromWorkspace(): Observable<NamedRdfModel[]> {
    return this.modelApiService
      .fetchAllNamespaceFilesContent()
      .pipe(
        switchMap(files =>
          files.length === 0
            ? of([])
            : forkJoin(
                files.map(file =>
                  new RdfLoader()
                    .loadModel([{rdfAspectModel: file.aspectMetaModel, sourceLocation: ''}])
                    .pipe(map(rdfModel => ({name: file.name, version: file.version, rdfModel}) as NamedRdfModel)),
                ),
              ),
        ),
      );
  }

  hasFilesToMigrate(): Observable<boolean> {
    this._rdfModelsToMigrate.set([]);
    return this.getRdfModelsFromWorkspace().pipe(
      map(namedRdfModels => {
        const outdatedRdfModels = namedRdfModels
          .filter(model => isVersionOutdated(model.version, this.config.currentSammVersion))
          .map(model => model.rdfModel);

        this._rdfModelsToMigrate.set(outdatedRdfModels);
        return outdatedRdfModels.length > 0;
      }),
    );
  }

  createBackup(): Observable<string> {
    return this.http.get<string>(`${this.serviceUrl}${this.api.package}/backup-workspace`);
  }

  migrateWorkspace(setNewVersion: boolean): Observable<MigrationStatus> {
    const params = {setNewVersion: setNewVersion.toString()};
    return this.http.get<MigrationStatus>(`${this.serviceUrl}${this.api.models}/migrate-workspace`, {params});
  }
}
