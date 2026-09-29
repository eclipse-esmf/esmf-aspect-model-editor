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

import {MigrationStatus, MigratorApiService, ModelApiService, NamespacesManagerService} from '@ame/infrastructure';
import {inject, Injectable} from '@angular/core';
import {Observable} from 'rxjs';

export type {MigrationStatus};

/** Feature-facing workspace operations (storage, model files, migration) backed by the backend API. */
@Injectable({providedIn: 'root'})
export class WorkspaceFacade {
  private readonly modelApi = inject(ModelApiService);
  private readonly migratorApi = inject(MigratorApiService);
  private readonly namespacesManager = inject(NamespacesManagerService);

  getStoragePath(): ReturnType<ModelApiService['getStoragePath']> {
    return this.modelApi.getStoragePath();
  }

  fetchAspectMetaModel(aspectModelUrn: string): Observable<{content: string; sourceLocation: string | null}> {
    return this.modelApi.fetchAspectMetaModel(aspectModelUrn);
  }

  deleteAspectModel(aspectModelUrn: string): Observable<string> {
    return this.modelApi.deleteAspectModel(aspectModelUrn);
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
