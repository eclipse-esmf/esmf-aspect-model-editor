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
import {ModelData, WorkspaceStructure} from './models';

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
    const {formData, uri} = this.createAspectModelFormData(rdfContent);
    return this.http
      .post<Array<ViolationError>>(`${this.serviceUrl}${this.api.models}/validate`, formData, {
        headers: new HttpHeaderBuilder().withFileUri(uri.toString()).build(),
      })
      .pipe(
        timeout(this.requestTimeout),
        map((data: any) => data.violationErrors),
        tap(errors => showNotifications && this.modelValidatorService.notifyCorrectableErrors(errors)),
        catchError(res => throwError(() => res)),
      );
  }

  fetchFormatedAspectModel(rdfContent: string): Observable<string> {
    const {formData, uri} = this.createAspectModelFormData(rdfContent);
    return this.http
      .post(`${this.serviceUrl}${this.api.models}/format`, formData, {
        headers: new HttpHeaderBuilder().withFileUri(uri.toString()).build(),
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
    return this.http.get<WorkspaceStructure>(`${this.serviceUrl}${this.api.models}/namespaces`, {params}).pipe(
      timeout(this.requestTimeout),
      catchError(res => throwError(() => res)),
    );
  }

  fetchAllNamespaceFilesContent(): Observable<FileContentModel[]> {
    return this.loadNamespacesStructure().pipe(
      map((workspace: WorkspaceStructure): ModelData[] => {
        return Object.values(workspace).flatMap(entries => entries.flatMap(entry => entry.models));
      }),
      map((modelDataList: ModelData[]) => {
        return modelDataList.map(modelData =>
          this.fetchAspectMetaModel(modelData.aspectModelUrn).pipe(
            map(
              aspectMetaModel =>
                new FileContentModel(modelData.model, modelData.aspectModelUrn, modelData.version, modelData.existing, aspectMetaModel),
            ),
          ),
        );
      }),
      mergeMap((files$: Observable<FileContentModel>[]) => (files$.length ? forkJoin(files$) : of([]))),
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
    const {formData, uri} = this.createAspectModelFormData(rdfContent);
    return this.http
      .post<string>(`${this.serviceUrl}${this.api.generate}/json-sample`, formData, {
        headers: new HttpHeaderBuilder().withFileUri(uri).build(),
      })
      .pipe(
        timeout(this.requestTimeout),
        catchError(res => throwError(() => res)),
      );
  }

  generateJsonSchema(rdfContent: string, language: string): Observable<string> {
    const {formData, uri} = this.createAspectModelFormData(rdfContent);
    return this.http
      .post<string>(`${this.serviceUrl}${this.api.generate}/json-schema`, formData, {
        headers: new HttpHeaderBuilder().withFileUri(uri).build(),
        params: {language},
      })
      .pipe(
        timeout(this.requestTimeout),
        catchError(res => throwError(() => res)),
      );
  }

  migrateAspectModel(rdfContent: string): Observable<string> {
    const {formData, uri} = this.createAspectModelFormData(rdfContent);
    return this.http
      .post(`${this.serviceUrl}${this.api.models}/migrate`, formData, {
        headers: new HttpHeaderBuilder().withFileUri(uri).build(),
        responseType: 'text',
      })
      .pipe(timeout(this.requestTimeout));
  }

  generateOpenApiSpec(rdfContent: string, openApi: OpenApi): Observable<string> {
    const {formData, uri} = this.createAspectModelFormData(rdfContent);
    return this.http
      .post<string>(`${this.serviceUrl}${this.api.generate}/open-api-spec`, formData, {
        headers: new HttpHeaderBuilder().withFileUri(uri).build(),
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
    const {formData, uri} = this.createAspectModelFormData(rdfContent);
    return this.http
      .post<string>(`${this.serviceUrl}${this.api.generate}/async-api-spec`, formData, {
        headers: new HttpHeaderBuilder().withFileUri(uri).build(),
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
    const {formData, uri} = this.createAspectModelFormData(rdfContent);
    return this.http
      .post(`${this.serviceUrl}${this.api.generate}/documentation`, formData, {
        headers: new HttpHeaderBuilder().withFileUri(uri).build(),
        params: {
          language: language,
        },
        responseType: 'text',
      })
      .pipe(timeout(this.requestTimeout));
  }

  generateAASX(rdfContent: string): Observable<string> {
    const {formData, uri} = this.createAspectModelFormData(rdfContent);
    return this.http.post(`${this.serviceUrl}${this.api.generate}/aasx`, formData, {
      headers: new HttpHeaderBuilder().withFileUri(uri).build(),
      responseType: 'text',
    });
  }

  generatetAASasXML(rdfContent: string): Observable<string> {
    const {formData, uri} = this.createAspectModelFormData(rdfContent);
    return this.http.post(`${this.serviceUrl}${this.api.generate}/aas-xml`, formData, {
      headers: new HttpHeaderBuilder().withFileUri(uri).build(),
      responseType: 'text',
    });
  }

  private createAspectModelFormData(rdfContent: string): {formData: FormData; uri: string} {
    const aspectModel = new File([new Blob([rdfContent], {type: 'text/turtle'})], '', {type: 'text/turtle'});
    const uri = URL.createObjectURL(aspectModel);
    const formData = new FormData();
    formData.append('aspectModel', aspectModel);
    return {formData, uri};
  }
}
