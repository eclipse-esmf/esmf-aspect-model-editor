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

import {ModelLoaderService} from '@ame/editor';
import {ExporterHelper} from '@ame/migrator';
import {APP_CONFIG, AppConfig, BrowserService} from '@ame/shared';
import {HttpClient} from '@angular/common/http';
import {Injectable, inject} from '@angular/core';
import {Observable, map, switchMap} from 'rxjs';
import {ModelApiService} from './model-api.service';

export interface NamespaceStatus {
  namespace: string;
  files: MigratedFileStatus[];
}

export interface MigratedFileStatus {
  name: string;
  success: boolean;
  message?: string;
}

@Injectable({
  providedIn: 'root',
})
export class MigratorApiService {
  private config: AppConfig = inject(APP_CONFIG);
  private defaultPort = this.config.defaultPort;
  private readonly serviceUrl = this.config.serviceUrl;
  private api = this.config.api;

  public rdfModelsToMigrate: string[] = [];

  constructor(
    private http: HttpClient,
    private browserService: BrowserService,
    private modelApiService: ModelApiService,
    private modelLoader: ModelLoaderService,
  ) {
    if (this.browserService.isStartedAsElectronApp() && !window.location.search.includes('?e2e=true')) {
      const remote = window.require('@electron/remote');
      this.serviceUrl = this.serviceUrl.replace(this.defaultPort, remote.getGlobal('backendPort'));
    }
  }

  public hasFilesToMigrate(): Observable<boolean> {
    this.rdfModelsToMigrate = [];
    return this.modelLoader.getRdfModelsFromWorkspace().pipe(
      map(rdfModels => {
        this.rdfModelsToMigrate = Object.keys(rdfModels).filter(absoluteName =>
          ExporterHelper.isVersionOutdated(rdfModels[absoluteName].samm.version, this.config.currentSammVersion),
        );

        return this.rdfModelsToMigrate.length > 0;
      }),
    );
  }

  public createBackup(): Observable<NamespaceStatus[]> {
    return this.http.get<Array<NamespaceStatus>>(`${this.serviceUrl}${this.api.package}/backup-workspace`);
  }

  public migrateWorkspace(): Observable<NamespaceStatus[]> {
    return this.http.get<Array<NamespaceStatus>>(`${this.serviceUrl}${this.api.models}/migrate-workspace`);
  }

  public rewriteFile(payload: any): Observable<string> {
    return this.modelApiService
      .formatModel(payload.serializedUpdatedModel)
      .pipe(switchMap(formattedModel => this.modelApiService.saveModel(formattedModel, payload.rdfModel.absoluteAspectModelFileName)));
  }
}
