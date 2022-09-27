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

import {EditorService} from '@ame/editor';
import {ExporterHelper} from '@ame/migrator';
import {RdfModel} from '@ame/rdf/utils';
import {BrowserService, APP_CONFIG, AppConfig} from '@ame/shared';
import {HttpClient} from '@angular/common/http';
import {Inject, Injectable} from '@angular/core';
import {map, switchMap} from 'rxjs';
import {ModelApiService} from './model-api.service';

export interface MigrationResponse {
  namespaces: NamespaceStatus[];
}

export interface NamespaceStatus {
  namespace: string;
  files: FileStatus[];
}

export interface FileStatus {
  name: string;
  success: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class MigratorApiService {
  private defaultPort = this.config.defaultPort;
  private readonly serviceUrl = this.config.serviceUrl;
  private api = this.config.api;

  constructor(
    private http: HttpClient,
    private browserService: BrowserService,
    private modelApiService: ModelApiService,
    private editorService: EditorService,
    @Inject(APP_CONFIG) private config: AppConfig
  ) {
    if (this.browserService.isStartedAsElectronApp() && !window.location.search.includes('e2e=true')) {
      const remote = window.require('@electron/remote');
      this.serviceUrl = this.serviceUrl.replace(this.defaultPort, remote.getGlobal('backendPort'));
    }
  }

  public hasFilesToMigrate() {
    return this.editorService
      .loadExternalModels()
      .pipe(
        map((rdfModels: RdfModel[]) =>
          rdfModels.some(rdfModel => ExporterHelper.isVersionOutdated(rdfModel?.BAMM().version, this.config.currentBammVersion))
        )
      );
  }

  public createBackup() {
    return this.http.get(`${this.serviceUrl}${this.api.package}/backup-workspace`);
  }

  public migrateWorkspace() {
    return this.http.get(`${this.serviceUrl}${this.api.models}/migrate-workspace`);
  }

  public rewriteFile(payload: any) {
    return this.modelApiService
      .saveModel(payload.serializedUpdatedModel, payload.rdfModel.aspectUrn)
      .pipe(switchMap(() => this.modelApiService.deleteNamespace(payload.oldNamespaceFile)));
  }
}
