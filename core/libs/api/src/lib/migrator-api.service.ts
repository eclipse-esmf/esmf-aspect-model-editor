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

import {ModelLoaderService} from '@ame/editor';
import {APP_CONFIG, AppConfig, BrowserService} from '@ame/shared';
import {ExporterHelper} from '@ame/sidebar';
import {HttpClient} from '@angular/common/http';
import {Injectable, inject} from '@angular/core';
import {Observable, map} from 'rxjs';
import {ModelApiService} from './model-api.service';
import {MigrationStatus} from './models';

@Injectable({providedIn: 'root'})
export class MigratorApiService {
  private config: AppConfig = inject(APP_CONFIG);
  private http = inject(HttpClient);
  private browserService = inject(BrowserService);
  private modelApiService = inject(ModelApiService);
  private modelLoader = inject(ModelLoaderService);

  private defaultPort = this.config.defaultPort;
  private readonly serviceUrl = this.config.serviceUrl;
  private api = this.config.api;

  public rdfModelsToMigrate = [];

  constructor() {
    if (this.browserService.isStartedAsElectronApp() && !window.location.search.includes('?e2e=true')) {
      const remote = window.require('@electron/remote');
      this.serviceUrl = this.serviceUrl.replace(this.defaultPort, remote.getGlobal('backendPort'));
    }
  }

  public hasFilesToMigrate(): Observable<boolean> {
    this.rdfModelsToMigrate = [];
    return this.modelLoader.getRdfModelsFromWorkspace().pipe(
      map(namedRdfModel => {
        this.rdfModelsToMigrate = namedRdfModel
          .filter(model => ExporterHelper.isVersionOutdated(model.version, this.config.currentSammVersion))
          .map(model => model.rdfModel);

        return this.rdfModelsToMigrate.length > 0;
      }),
    );
  }

  public createBackup(): Observable<string> {
    return this.http.get<string>(`${this.serviceUrl}${this.api.package}/backup-workspace`);
  }

  public migrateWorkspace(setNewVersion: boolean): Observable<MigrationStatus> {
    const params = {setNewVersion: setNewVersion.toString()};
    return this.http.get<MigrationStatus>(`${this.serviceUrl}${this.api.models}/migrate-workspace`, {params});
  }
}
