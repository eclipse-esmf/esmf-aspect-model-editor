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

/** A workspace file that uses elements of a namespace or file that is about to be deleted. */
export interface ModelReference {
  namespace: string;
  version: string;
  fileName: string;
  referencedElements: string[];
}

/** A workspace file that could not be read while checking references; it blocks deleting. */
export interface UnreadableModelFile {
  namespace: string;
  version: string;
  fileName: string;
  message: string;
}

/**
 * Whether a namespace or file can be deleted. Only incoming references count:
 * other files using its elements. What it uses itself does not matter.
 */
export interface ReferenceReport {
  deletable: boolean;
  references: ModelReference[];
  unreadableFiles: UnreadableModelFile[];
}

export interface ClearWorkspaceResult {
  deletedFiles: number;
  backupCreated: boolean;
}

/**
 * Feature-facing workspace operations (storage, model files, migration).
 * Implemented by the infrastructure layer (backend API) and bound in provideAmeInfrastructure().
 */
export abstract class WorkspaceFacade {
  abstract getStoragePath(): Observable<StoragePathResponse>;
  abstract fetchAspectMetaModel(aspectModelUrn: string): Observable<{content: string; sourceLocation: string | null}>;
  abstract deleteAspectModel(aspectModelUrn: string): Observable<string>;
  /** Checks a namespace version, or a single file of it if `fileName` is given. */
  abstract getReferences(namespace: string, version: string, fileName?: string): Observable<ReferenceReport>;
  /** Fails with HTTP 409 and the ReferenceReport as body if the namespace is still used. */
  abstract deleteNamespace(namespace: string, version: string): Observable<ReferenceReport>;
  abstract clearWorkspace(backup: boolean): Observable<ClearWorkspaceResult>;
  abstract hasFilesToMigrate(): Observable<boolean>;
  abstract createBackup(): Observable<string>;
  abstract migrateWorkspace(setNewVersion: boolean): Observable<MigrationStatus>;
  abstract importNamespaces(zip: File): Observable<unknown>;
}
