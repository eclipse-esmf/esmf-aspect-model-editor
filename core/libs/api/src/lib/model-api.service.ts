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

import {AsyncApi, OpenApi, ViolationError} from '@ame/editor';
import {RdfModelUtil} from '@ame/rdf/utils';
import {APP_CONFIG, AppConfig, BrowserService, FileContentModel, HttpHeaderBuilder} from '@ame/shared';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Injectable, inject} from '@angular/core';
import {Observable, forkJoin, of, throwError} from 'rxjs';
import {catchError, map, mergeMap, retry, tap, timeout} from 'rxjs/operators';
import {ModelValidatorService} from './model-validator.service';
import {WorkspaceStructure} from './models';

@Injectable({
  providedIn: 'root',
})
export class ModelApiService {
  private config: AppConfig = inject(APP_CONFIG);
  private defaultPort = this.config.defaultPort;
  private readonly serviceUrl = this.config.serviceUrl;
  private api = this.config.api;
  private requestTimeout = 60000;

  constructor(
    private http: HttpClient,
    private browserService: BrowserService,
    private modelValidatorService: ModelValidatorService,
  ) {
    if (this.browserService.isStartedAsElectronApp() && !window.location.search.includes('?e2e=true')) {
      const remote = window.require('@electron/remote');
      this.serviceUrl = this.serviceUrl.replace(this.defaultPort, remote.getGlobal('backendPort'));
    }
  }

  fetchAspectMetaModel(aspectModelUrn: string): Observable<string> {
    return this.http
      .get<string>(`${this.serviceUrl}${this.api.models}`, {
        headers: new HttpHeaderBuilder().withContentTypeRdfTurtle().withAspectModelUrn(aspectModelUrn).build(),
        responseType: 'text' as 'json',
      })
      .pipe(
        timeout(this.requestTimeout),
        catchError(res => throwError(() => res)),
      );
  }

  saveAspectModel(rdfContent: string, aspectModelUrn: string, absoluteModelName?: string): Observable<string> {
    let headers: HttpHeaders;
    if (absoluteModelName) {
      const file = RdfModelUtil.getFileNameFromRdf(absoluteModelName);
      headers = new HttpHeaderBuilder().withAspectModelUrn(aspectModelUrn).withFileName(file).build();
    }

    return this.http
      .post(`${this.serviceUrl}${this.api.models}`, rdfContent, {
        headers,
        responseType: 'text',
      })
      .pipe(
        timeout(this.requestTimeout),
        catchError(res => throwError(() => res)),
      );
  }

  validate(rdfContent: string, showNotifications = true): Observable<Array<ViolationError>> {
    return this.http
      .post<Array<ViolationError>>(`${this.serviceUrl}${this.api.models}/validate`, rdfContent, {
        headers: new HttpHeaderBuilder().withContentTypeRdfTurtle().build(),
      })
      .pipe(
        timeout(this.requestTimeout),
        map((data: any) => data.violationErrors),
        tap(errors => showNotifications && this.modelValidatorService.notifyCorrectableErrors(errors)),
        catchError(res => throwError(() => res)),
      );
  }

  fetchFormatedAspectModel(rdfContent: string): Observable<string> {
    const headers = new HttpHeaderBuilder().withContentTypeRdfTurtle().build();
    return this.http
      .post(`${this.serviceUrl}${this.api.models}/format`, rdfContent, {
        headers,
        responseType: 'text',
      })
      .pipe(
        timeout(this.requestTimeout),
        catchError(res => {
          res.error = JSON.parse(res.error)?.error;
          return throwError(() => res);
        }),
      );
  }

  importPackage(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('zipFile', file);

    return this.http.post(`${this.serviceUrl}${this.api.package}/import`, formData);
  }

  deleteAspectModel(aspectModelUrn: string): Observable<string> {
    return this.http
      .delete<string>(`${this.serviceUrl}${this.api.models}`, {
        headers: new HttpHeaderBuilder().withAspectModelUrn(aspectModelUrn).build(),
      })
      .pipe(
        timeout(this.requestTimeout),
        catchError(res => throwError(() => res)),
        retry(3),
      );
  }

  loadNamespacesStructure(onlyAspectModel?: boolean): Observable<WorkspaceStructure> {
    const params = onlyAspectModel ? {onlyAspectModels: 'true'} : {onlyAspectModels: 'false'};
    return this.http.get<WorkspaceStructure>(`${this.serviceUrl}${this.api.models}/namespaces`, {params});
  }

  fetchAspectModelUrnsGroupedByNamespac(): Observable<{aspectModelUrn: string; fileName: string; namespace: string}[]> {
    return this.loadNamespacesStructure().pipe(
      timeout(this.requestTimeout),
      map(data => {
        return Object.keys(data).reduce<{aspectModelUrn: string; fileName: string; namespace: string}[]>(
          (fileNames, namespace) => [
            ...fileNames,
            ...data[namespace]
              .map(({models}) => models.map(model => ({aspectModelUrn: model.aspectModelUrn, fileName: model.model, namespace})))
              .flat(),
          ],
          [],
        );
      }),
    );
  }

  fetchAllNamespaceFilesContent(): Observable<FileContentModel[]> {
    return this.fetchAspectModelUrnsGroupedByNamespac().pipe(
      map(aspectModelUrns =>
        aspectModelUrns.reduce<any[]>(
          (files, file) => [
            ...files,
            this.fetchAspectMetaModel(file.aspectModelUrn).pipe(
              map(aspectMetaModel => new FileContentModel(file.fileName, aspectMetaModel)),
            ),
          ],
          [],
        ),
      ),
      mergeMap((files$: Observable<string>[]) => (files$.length ? forkJoin(files$) : of([]))),
      catchError(() => of([])),
    );
  }

  fetchExportPackage(aspectModelUrn: string): Observable<any> {
    return this.http.get(`${this.serviceUrl}${this.api.package}/export`, {
      headers: new HttpHeaderBuilder().withAspectModelUrn(aspectModelUrn).build(),
      responseType: 'blob' as 'json',
    });
  }

  generateJsonSample(rdfContent: string): Observable<string> {
    return this.http
      .post<string>(`${this.serviceUrl}${this.api.generate}/json-sample`, rdfContent, {
        headers: new HttpHeaderBuilder().withContentTypeRdfTurtle().build(),
      })
      .pipe(
        timeout(this.requestTimeout),
        catchError(res => throwError(() => res)),
      );
  }

  generateJsonSchema(rdfContent: string, language: string): Observable<string> {
    return this.http
      .post<string>(`${this.serviceUrl}${this.api.generate}/json-schema`, rdfContent, {
        headers: new HttpHeaderBuilder().withContentTypeRdfTurtle().build(),
        params: {language},
      })
      .pipe(
        timeout(this.requestTimeout),
        catchError(res => throwError(() => res)),
      );
  }

  migrateAspectModel(rdfContent: string): Observable<string> {
    return this.http
      .post(`${this.serviceUrl}${this.api.models}/migrate`, rdfContent, {
        headers: new HttpHeaderBuilder().withContentTypeRdfTurtle().build(),
        responseType: 'text',
      })
      .pipe(timeout(this.requestTimeout));
  }

  generateOpenApiSpec(rdfContent: string, openApi: OpenApi): Observable<string> {
    return this.http
      .post<string>(`${this.serviceUrl}${this.api.generate}/open-api-spec`, rdfContent, {
        headers: new HttpHeaderBuilder().withContentTypeRdfTurtle().build(),
        params: {
          language: openApi.language,
          output: openApi.output,
          baseUrl: openApi.baseUrl,
          includeQueryApi: openApi.includeQueryApi,
          useSemanticVersion: openApi.useSemanticVersion,
          pagingOption: openApi.paging,
          includePost: openApi.includePost || false,
          includePut: openApi.includePut || false,
          includePatch: openApi.includePatch || false,
          resourcePath: openApi.resourcePath,
          ymlProperties: openApi.ymlProperties || '',
          jsonProperties: openApi.jsonProperties || '',
        },
        responseType: openApi.output === 'yaml' ? ('text' as 'json') : 'json',
      })
      .pipe(
        timeout(this.requestTimeout),
        catchError(res => {
          res.error = openApi.output === 'yaml' ? JSON.parse(res.error)?.error : res.error.error;
          return throwError(() => res);
        }),
      );
  }

  generateAsyncApiSpec(rdfContent: string, asyncApi: AsyncApi): Observable<any> {
    return this.http
      .post<string>(`${this.serviceUrl}${this.api.generate}/async-api-spec`, rdfContent, {
        headers: new HttpHeaderBuilder().withContentTypeRdfTurtle().build(),
        params: {
          language: asyncApi.language,
          output: asyncApi.output,
          applicationId: asyncApi.applicationId,
          channelAddress: asyncApi.channelAddress,
          useSemanticVersion: asyncApi.useSemanticVersion,
          writeSeparateFiles: asyncApi.writeSeparateFiles,
        },
        responseType: asyncApi.writeSeparateFiles ? ('blob' as 'json') : asyncApi.output === 'yaml' ? ('text' as 'json') : 'json',
      })
      .pipe(
        timeout(this.requestTimeout),
        catchError(res => {
          res.error = asyncApi.output === 'yaml' ? JSON.parse(res.error)?.error : res.error.error;
          return throwError(() => res);
        }),
      );
  }

  generateDocumentation(rdfContent: string, language: string): Observable<string> {
    return this.http
      .post(`${this.serviceUrl}${this.api.generate}/documentation`, rdfContent, {
        headers: new HttpHeaderBuilder().withContentTypeRdfTurtle().build(),
        params: {
          language: language,
        },
        responseType: 'text',
      })
      .pipe(timeout(this.requestTimeout));
  }

  generateAASX(rdfContent: string): Observable<string> {
    return this.http.post(`${this.serviceUrl}${this.api.generate}/aasx`, rdfContent, {
      headers: new HttpHeaderBuilder().withContentTypeRdfTurtle().build(),
      responseType: 'text',
    });
  }

  generatetAASasXML(rdfContent: string): Observable<string> {
    return this.http.post(`${this.serviceUrl}${this.api.generate}/aas-xml`, rdfContent, {
      headers: new HttpHeaderBuilder().withContentTypeRdfTurtle().build(),
      responseType: 'text',
    });
  }
}
