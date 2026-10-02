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

import {Observable} from 'rxjs';

export interface MigrationStatus {
  success: string;
  errors: string[];
}

export interface StoragePathResponse {
  path: string;
  storagePath: string;
}

/**
 * Feature-facing workspace operations (storage, model files, migration).
 * Implemented by the infrastructure layer (backend API) and bound in provideAmeInfrastructure().
 */
export abstract class WorkspaceFacade {
  abstract getStoragePath(): Observable<StoragePathResponse>;
  abstract fetchAspectMetaModel(aspectModelUrn: string): Observable<{content: string; sourceLocation: string | null}>;
  abstract deleteAspectModel(aspectModelUrn: string): Observable<string>;
  abstract hasFilesToMigrate(): Observable<boolean>;
  abstract createBackup(): Observable<string>;
  abstract migrateWorkspace(setNewVersion: boolean): Observable<MigrationStatus>;
  abstract importNamespaces(zip: File): Observable<unknown>;
}
