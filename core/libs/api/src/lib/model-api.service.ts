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

import {inject, Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse, HttpHeaders} from '@angular/common/http';
import {catchError, map, mergeMap, tap, timeout, retry} from 'rxjs/operators';
import {forkJoin, Observable, of, throwError} from 'rxjs';
import {APP_CONFIG, AppConfig, BrowserService, FileContentModel, HttpHeaderBuilder, LogService} from '@ame/shared';
import {ModelValidatorService} from './model-validator.service';
import {OpenApi, ViolationError} from '@ame/editor';
import {removeCommentsFromTTL} from '@ame/utils';

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
    private loggerService: LogService,
    private browserService: BrowserService,
    private modelValidatorService: ModelValidatorService,
  ) {
    if (this.browserService.isStartedAsElectronApp() && !window.location.search.includes('e2e=true')) {
      const remote = window.require('@electron/remote');
      this.serviceUrl = this.serviceUrl.replace(this.defaultPort, remote.getGlobal('backendPort'));
    }
  }

  getPredefinedModel(modelPath: PREDEFINED_MODELS): Observable<string> {
    return this.http.get(modelPath, {responseType: 'text'}).pipe(map((response: string) => removeCommentsFromTTL(response)));
  }

  lockFile(namespace: string, file: string): Observable<string> {
    return this.http
      .get<string>(`${this.serviceUrl}${this.api.fileHandling}/lock`, {
        headers: new HttpHeaderBuilder().withTextContentType().withFileName(file).withNamespace(namespace).build(),
        responseType: 'text' as 'json',
      })
      .pipe(
        timeout(this.requestTimeout),
        catchError(res => throwError(() => res)),
      );
  }

  unlockFile(namespace: string, file: string): Observable<string> {
    return this.http
      .get<string>(`${this.serviceUrl}${this.api.fileHandling}/unlock`, {
        headers: new HttpHeaderBuilder().withTextContentType().withFileName(file).withNamespace(namespace).build(),
        responseType: 'text' as 'json',
      })
      .pipe(
        timeout(this.requestTimeout),
        catchError(res => throwError(() => res)),
      );
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

  saveModel(rdfContent: string, absoluteModelName?: string): Observable<string> {
    let headers: HttpHeaders;
    if (absoluteModelName) {
      const [namespace, version, file] = absoluteModelName.split(':');
      headers = new HttpHeaderBuilder().withNamespace(`${namespace}:${version}`).withFileName(file).build();
    }
    return this.http.post<string>(`${this.serviceUrl}${this.api.models}`, rdfContent, {headers}).pipe(
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

  uploadZip(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('zipFile', file);

    return this.http.post(`${this.serviceUrl}${this.api.package}/validate-import-zip`, formData);
  }

  replaceFiles(files: {namespace: string; files: string[]}[]): Observable<any> {
    return this.http.post(`${this.serviceUrl}${this.api.package}/import`, files);
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

  deleteFile(absoluteModelName: string): Observable<string> {
    const [namespace, version, file] = absoluteModelName.split(':');
    return this.http
      .delete<string>(`${this.serviceUrl}${this.api.models}`, {
        headers: new HttpHeaderBuilder().withContentTypeRdfTurtle().withNamespace(`${namespace}:${version}`).withFileName(file).build(),
      })
      .pipe(
        timeout(this.requestTimeout),
        catchError(res => throwError(() => res)),
        retry(3),
      );
  }

  getNamespacesStructure(): Observable<any> {
    return this.http.get<Map<string, Array<string>>>(`${this.serviceUrl}${this.api.models}/namespaces`, {
      params: {
        shouldRefresh: true,
      },
    });
  }

  // TODO In the backend a defined object should be returned
  getNamespacesAppendWithFiles(): Observable<string[]> {
    return this.getNamespacesStructure().pipe(
      timeout(this.requestTimeout),
      map(data => {
        return Object.keys(data).reduce<string[]>(
          (fileNames, namespace) => [...fileNames, ...data[namespace].map((fileName: string) => `${namespace}:${fileName}`)],
          [],
        );
      }),
    );
  }

  getAllNamespacesFilesContent(): Observable<FileContentModel[]> {
    return this.getNamespacesAppendWithFiles().pipe(
      map(aspectModelFileNames =>
        aspectModelFileNames.reduce<any[]>(
          (files, absoluteFileName) => [
            ...files,
            this.getAspectMetaModel(absoluteFileName).pipe(map(aspectMetaModel => new FileContentModel(absoluteFileName, aspectMetaModel))),
          ],
          [],
        ),
      ),
      mergeMap((files$: Observable<string>[]) => (files$.length ? forkJoin(files$) : of([]))),
      catchError(() => of([])),
    );
  }

  validateFilesForExport(files: {namespace: string; files: string[]}[]): Observable<any> {
    return this.http.post(`${this.serviceUrl}${this.api.package}/validate-models-for-export`, files);
  }

  getExportZipFile(): Observable<any> {
    return this.http.get(`${this.serviceUrl}${this.api.package}/export-zip`, {
      responseType: 'blob' as 'json',
    });
  }

  getAspectMetaModel(absoluteModelName: string): Observable<string> {
    const [namespace, version, file] = absoluteModelName.split(':');
    return this.http
      .get<string>(`${this.serviceUrl}${this.api.models}`, {
        headers: new HttpHeaderBuilder().withContentTypeRdfTurtle().withNamespace(`${namespace}:${version}`).withFileName(file).build(),
        responseType: 'text' as 'json',
      })
      .pipe(
        timeout(this.requestTimeout),
        catchError(res => throwError(() => res)),
      );
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
          pagingOption: openApi.paging,
        },
        responseType: openApi.output === 'yaml' ? ('text' as 'json') : 'json',
      })
      .pipe(
        timeout(this.requestTimeout),
        catchError(res => throwError(() => res)),
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
            this.loggerService.logError('Write error:  ' + err.message);
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
