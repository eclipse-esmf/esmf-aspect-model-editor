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
import {APP_CONFIG, AppConfig, BrowserService, FileContentModel, HttpHeaderBuilder} from '@ame/shared';
import {removeCommentsFromTTL} from '@ame/utils';
import {HttpClient, HttpErrorResponse, HttpHeaders} from '@angular/common/http';
import {Injectable, inject} from '@angular/core';
import {Observable, forkJoin, of, throwError} from 'rxjs';
import {catchError, map, mergeMap, retry, tap, timeout} from 'rxjs/operators';
import {ModelValidatorService} from './model-validator.service';
import {WorkspaceStructure} from './models';

export enum PREDEFINED_MODELS {
  SIMPLE_ASPECT = 'assets/aspect-models/org.eclipse.examples/1.0.0/SimpleAspect.ttl',
  MOVEMENT = 'assets/aspect-models/org.eclipse.examples/1.0.0/Movement.ttl',
}

@Injectable({
  providedIn: 'root',
})
export class ModelApiService {
  private config: AppConfig = inject(APP_CONFIG);
  private defaultPort = this.config.defaultPort;
  private readonly serviceUrl = this.config.serviceUrl;
  private api = this.config.api;
  private requestTimeout = 60000;
  private readonly LATEST_FILENAME = 'latest.ttl';

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

  getPredefinedModel(modelPath: PREDEFINED_MODELS): Observable<string> {
    return this.http.get(modelPath, {responseType: 'text'}).pipe(map((response: string) => removeCommentsFromTTL(response)));
  }

  loadLatest(): Observable<string> {
    return this.http
      .get<string>(`${this.serviceUrl}${this.api.models}`, {
        headers: new HttpHeaderBuilder().withContentTypeRdfTurtle().withFileName(this.LATEST_FILENAME).build(),
        responseType: 'text' as 'json',
      })
      .pipe(
        timeout(this.requestTimeout),
        catchError(res => throwError(() => res)),
      );
  }

  saveModel(rdfContent: string, aspectModelUrn: string, absoluteModelName?: string): Observable<string> {
    let headers: HttpHeaders;
    if (absoluteModelName) {
      const [namespace, version, file] = absoluteModelName.split(':');
      headers = new HttpHeaderBuilder()
        .withAspectModelUrn(aspectModelUrn)
        .withNamespace(`${namespace}:${version}`)
        .withFileName(file)
        .build();
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

  formatModel(rdfContent: string): Observable<string> {
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

  validateImportPackage(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('zipFile', file);

    return this.http.post(`${this.serviceUrl}${this.api.package}/validate-package`, formData);
  }

  importPackage(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('zipFile', file);

    return this.http.post(`${this.serviceUrl}${this.api.package}/import`, formData);
  }

  saveLatest(rdfContent: string): Observable<string> {
    return this.http
      .post<string>(`${this.serviceUrl}${this.api.models}`, rdfContent, {
        headers: new HttpHeaderBuilder().withContentTypeRdfTurtle().withFileName(this.LATEST_FILENAME).build(),
      })
      .pipe(
        timeout(this.requestTimeout),
        catchError(res => throwError(() => res)),
      );
  }

  deleteFile(absoluteModelName: string, aspectModelUrn: string): Observable<string> {
    const [namespace, version, file] = absoluteModelName.split(':');
    return this.http
      .delete<string>(`${this.serviceUrl}${this.api.models}`, {
        headers: new HttpHeaderBuilder()
          // .withContentTypeRdfTurtle()
          .withAspectModelUrn(aspectModelUrn)
          .withNamespace(`${namespace}:${version}`)
          .withFileName(file)
          .build(),
      })
      .pipe(
        timeout(this.requestTimeout),
        catchError(res => throwError(() => res)),
        retry(3),
      );
  }

  getNamespacesStructure(): Observable<WorkspaceStructure> {
    return this.http.get<WorkspaceStructure>(`${this.serviceUrl}${this.api.models}/namespaces`, {
      params: {
        shouldRefresh: true,
      },
    });
  }

  // TODO In the backend a defined object should be returned
  /**
   * @deprecated this function will be removed in the next versions
   */
  getNamespacesAppendWithFiles(): Observable<string[]> {
    return this.getNamespacesStructure().pipe(
      timeout(this.requestTimeout),
      map(data => {
        return Object.keys(data).reduce<string[]>(
          (fileNames, namespace) => [
            ...fileNames,
            ...data[namespace].map(({version, models}) => models.map(model => `${namespace}:${version}:${model.model}`)).flat(),
          ],
          [],
        );
      }),
    );
  }

  getWorkspaceAspectModelUrns(): Observable<{aspectModelUrn: string; fileName: string; namespace: string}[]> {
    return this.getNamespacesStructure().pipe(
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

  getAllNamespacesFilesContent(): Observable<FileContentModel[]> {
    return this.getWorkspaceAspectModelUrns().pipe(
      map(aspectModelUrns =>
        aspectModelUrns.reduce<any[]>(
          (files, file) => [
            ...files,
            this.getAspectMetaModel(file.aspectModelUrn).pipe(map(aspectMetaModel => new FileContentModel(file.fileName, aspectMetaModel))),
          ],
          [],
        ),
      ),
      mergeMap((files$: Observable<string>[]) => (files$.length ? forkJoin(files$) : of([]))),
      catchError(() => of([])),
    );
  }

  getAspectMetaModel(aspectModelUrn: string): Observable<string> {
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

  validateFilesForExport(files: {namespace: string; files: string[]}[]): Observable<any> {
    return this.http.post(`${this.serviceUrl}${this.api.package}/validate-models-for-export`, files);
  }

  getExportZipFile(aspectModelUrn: string): Observable<any> {
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

  /*
   *This method will get all the errors and notify the user for those which are correctable.
   */
  validate(rdfContent: string, showNotifications = true): Observable<Array<ViolationError>> {
    return this.getViolationError(rdfContent).pipe(
      tap(errors => showNotifications && this.modelValidatorService.notifyCorrectableErrors(errors)),
    );
  }

  getViolationError(rdfContent: string): Observable<Array<ViolationError>> {
    return this.http
      .post<Array<ViolationError>>(`${this.serviceUrl}${this.api.models}/validate`, rdfContent, {
        headers: new HttpHeaderBuilder().withContentTypeRdfTurtle().build(),
      })
      .pipe(
        timeout(this.requestTimeout),
        map((data: any) => data.violationErrors),
        catchError(res => throwError(() => res)),
      );
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

  downloadDocumentation(rdfContent: string, language: string): Observable<string> {
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

  getAASX(rdfContent: string): Observable<string> {
    return this.http.post(`${this.serviceUrl}${this.api.generate}/aasx`, rdfContent, {
      headers: new HttpHeaderBuilder().withContentTypeRdfTurtle().build(),
      responseType: 'text',
    });
  }

  getAASasXML(rdfContent: string): Observable<string> {
    return this.http.post(`${this.serviceUrl}${this.api.generate}/aas-xml`, rdfContent, {
      headers: new HttpHeaderBuilder().withContentTypeRdfTurtle().build(),
      responseType: 'text',
    });
  }

  openDocumentation(rdfContent: string, language: string): Observable<void> {
    return this.downloadDocumentation(rdfContent, language).pipe(
      map((documentation: string) => {
        if (!this.browserService.isStartedAsElectronApp()) {
          const tabRef = window.open('about:blank', '_blank');
          tabRef.document.write(documentation);
          tabRef.focus();
          tabRef.document.close();
          return;
        }

        const fs = window.require('fs');
        const os = window.require('os');
        const path = window.require('path');
        const ameTmpDir = path.join(os.homedir(), '.ametmp');
        const printFilePath = path.normalize(path.join(ameTmpDir, 'print.html'));
        const BrowserWindow = window.require('@electron/remote').BrowserWindow;
        const electronBrowserWindow = new BrowserWindow({
          width: 1920,
          height: 1080,
        });

        if (!fs.existsSync(ameTmpDir)) {
          fs.mkdirSync(ameTmpDir);
        }

        fs.writeFile(printFilePath, documentation, err => {
          if (err) {
            console.error('Write error:  ' + err.message);
          } else {
            electronBrowserWindow.loadFile(printFilePath);
            electronBrowserWindow.reload();
            electronBrowserWindow.focus();
          }
        });
      }),
      catchError(response => {
        if (response instanceof HttpErrorResponse) {
          if (response.status === 422) {
            return throwError(() => JSON.parse(response.error).error.message.split(': ')[1]);
          } else if (response.status === 400) {
            // TODO This should be removed as soon as the SDK has fixed the graphviz error.
            return throwError(() => JSON.parse(response.error).error.message);
          }
        }
        return throwError(() => 'Server error');
      }),
    );
  }
}
