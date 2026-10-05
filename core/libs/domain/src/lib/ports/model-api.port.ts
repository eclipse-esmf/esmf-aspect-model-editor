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

import {FileContentModel} from '@ame/shared';
import {Observable} from 'rxjs';
import {AsyncApi, FileEntry, FileInformation, OpenApi, ViolationError, WorkspaceStructure} from '../model-api';

/** Backend aspect model API (persistence, validation, generators). Implemented by infrastructure. */
export abstract class ModelApiPort {
  abstract checkElementExists(aspectModelUrn: string, fileName: string): Observable<boolean>;
  abstract fetchAspectMetaModel(aspectModelUrn: string): Observable<{content: string; sourceLocation: string | null}>;
  /**
   * Loads the files defining the requested elements. Elements that no workspace file defines are left out, and files
   * whose own references cannot be resolved are returned as they are, so that one broken file does not fail the request.
   */
  abstract fetchAllAspectMetaModel(fileEntries: Array<FileEntry>): Observable<Array<FileInformation>>;
  abstract fetchFormatedAspectModel(rdfContent: string, sourceLocation?: string): Observable<string>;
  abstract saveAspectModel(rdfContent: string, aspectModelUrn: string, absoluteModelName?: string): Observable<string>;
  abstract deleteAspectModel(aspectModelUrn: string): Observable<string>;
  abstract importPackage(file: File): Observable<any>;
  abstract loadNamespacesStructure(onlyAspectModel?: boolean): Observable<WorkspaceStructure>;
  abstract validate(rdfContent: string, sourceLocation?: string, validInfo?: boolean): Observable<Array<ViolationError>>;
  abstract migrateAspectModel(rdfContent: string, sourceLocation?: string): Observable<string>;
  abstract fetchAllNamespaceFilesContent(): Observable<FileContentModel[]>;
  abstract generateDocumentation(rdfContent: string, language: string, sourceLocation?: string): Observable<string>;
  abstract generateJsonSample(rdfContent: string, sourceLocation?: string): Observable<string>;
  abstract generateJsonSchema(rdfContent: string, language: string, sourceLocation?: string): Observable<string>;
  abstract generateOpenApiSpec(rdfContent: string, openApi: OpenApi, sourceLocation?: string): Observable<string>;
  abstract generateAsyncApiSpec(rdfContent: string, asyncApi: AsyncApi, sourceLocation?: string): Observable<any>;
  abstract generateAASX(rdfContent: string, sourceLocation?: string): Observable<string>;
  abstract generatetAASasXML(rdfContent: string, sourceLocation?: string): Observable<string>;
}
