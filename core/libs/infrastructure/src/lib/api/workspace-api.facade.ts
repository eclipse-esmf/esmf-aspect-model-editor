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

import {ClearWorkspaceResult, MigrationStatus, ReferenceReport, StoragePathResponse, WorkspaceFacade} from '@ame/domain';
import {inject, Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {NamespacesManagerService} from '../namespace-manager/shared/services/namespaces-manager.service';
import {MigratorApiService} from './migrator-api.service';
import {ModelApiService} from './model-api.service';

/** Backend-API implementation of the domain WorkspaceFacade. */
@Injectable({providedIn: 'root'})
export class WorkspaceApiFacade implements WorkspaceFacade {
  private readonly modelApi = inject(ModelApiService);
  private readonly migratorApi = inject(MigratorApiService);
  private readonly namespacesManager = inject(NamespacesManagerService);

  getStoragePath(): Observable<StoragePathResponse> {
    return this.modelApi.getStoragePath();
  }

  fetchAspectMetaModel(aspectModelUrn: string): Observable<{content: string; sourceLocation: string | null}> {
    return this.modelApi.fetchAspectMetaModel(aspectModelUrn);
  }

  deleteAspectModel(aspectModelUrn: string): Observable<string> {
    return this.modelApi.deleteAspectModel(aspectModelUrn);
  }

  getReferences(namespace: string, version: string, fileName?: string): Observable<ReferenceReport> {
    return this.modelApi.getReferences(namespace, version, fileName);
  }

  deleteNamespace(namespace: string, version: string): Observable<ReferenceReport> {
    return this.modelApi.deleteNamespace(namespace, version);
  }

  clearWorkspace(backup: boolean): Observable<ClearWorkspaceResult> {
    return this.modelApi.clearWorkspace(backup);
  }

  hasFilesToMigrate(): Observable<boolean> {
    return this.migratorApi.hasFilesToMigrate();
  }

  createBackup(): Observable<string> {
    return this.migratorApi.createBackup();
  }

  migrateWorkspace(setNewVersion: boolean): Observable<MigrationStatus> {
    return this.migratorApi.migrateWorkspace(setNewVersion);
  }

  importNamespaces(zip: File): Observable<unknown> {
    return this.namespacesManager.importNamespaces(zip);
  }
}
