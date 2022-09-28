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

import {Inject, Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {catchError, map, mergeMap, tap, timeout} from 'rxjs/operators';
import {forkJoin, Observable, of, throwError} from 'rxjs';
import {
  APP_CONFIG,
  AppConfig,
  BrowserService,
  FileContentModel,
  HttpHeaderBuilder,
  LogService,
  ProcessingError,
  SemanticError,
  SyntacticError,
} from '@ame/shared';
import {ModelValidatorService} from './model-validator.service';
import {RdfModel} from '@ame/rdf/utils';

type ValidationError = SemanticError | SyntacticError | ProcessingError;

@Injectable({
  providedIn: 'root',
})
export class ModelApiService {
  private defaultPort = this.config.defaultPort;
  private readonly serviceUrl = this.config.serviceUrl;
  private api = this.config.api;
  private requestTimeout = 60000;

  constructor(
    private http: HttpClient,
    private loggerService: LogService,
    private browserService: BrowserService,
    private modelValidatorService: ModelValidatorService,
    @Inject(APP_CONFIG) private config: AppConfig
  ) {
    if (this.browserService.isStartedAsElectronApp() && !window.location.search.includes('e2e=true')) {
      const remote = window.require('@electron/remote');
      this.serviceUrl = this.serviceUrl.replace(this.defaultPort, remote.getGlobal('backendPort'));
    }
  }

  private readonly LATEST_FILENAME = ':latest.ttl';

  getDefaultAspectModel(): Observable<string> {
    return this.http.get('assets/aspect-models/io.openmanufacturing.examples.movement/1.0.0/Default.ttl', {responseType: 'text'});
  }

  getMovementAspectModel(): Observable<string> {
    return this.http.get('assets/aspect-models/io.openmanufacturing.examples.movement/1.0.0/Movement.ttl', {responseType: 'text'});
  }

  loadAspectModelByUrn(urn: string): Observable<string> {
    return this.http
      .get<string>(`${this.serviceUrl}${this.api.models}`, {
        headers: new HttpHeaderBuilder().withContentTypeRdfTurtle().withUrn(urn).build(),
        responseType: 'text' as 'json',
      })
      .pipe(
        timeout(this.requestTimeout),
        catchError(res => throwError(() => res))
      );
  }

  loadLatest(): Observable<string> {
    return this.loadAspectModelByUrn(this.LATEST_FILENAME);
  }

  saveModel(rdfContent: string, aspectUrn?: string): Observable<string> {
    return this.http
      .post<string>(`${this.serviceUrl}${this.api.models}`, rdfContent, {headers: new HttpHeaderBuilder().withUrn(aspectUrn).build()})
      .pipe(
        timeout(this.requestTimeout),
        catchError(res => throwError(() => res))
      );
  }

  uploadZip(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('zipFile', file);

    return this.http.post(`${this.serviceUrl}${this.api.package}/validate-import-zip`, formData);
  }

  replaceFiles(files: string[]): Observable<any> {
    return this.http.post(`${this.serviceUrl}${this.api.package}/import`, files);
  }

  saveLatest(rdfContent: string): Observable<string> {
    return this.http
      .post<string>(`${this.serviceUrl}${this.api.models}`, rdfContent, {
        headers: new HttpHeaderBuilder().withContentTypeRdfTurtle().withUrn(':latest.ttl').build(),
      })
      .pipe(
        timeout(this.requestTimeout),
        catchError(res => throwError(() => res))
      );
  }

  deleteNamespace(namespace: string): Observable<string> {
    return this.http
      .delete<string>(`${this.serviceUrl}${this.api.models}`, {
        headers: new HttpHeaderBuilder().withContentTypeRdfTurtle().withUrn(namespace).build(),
      })
      .pipe(
        timeout(this.requestTimeout),
        catchError(res => throwError(() => res))
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
  getNamespacesAppendWithFiles(): Observable<any> {
    return this.getNamespacesStructure().pipe(
      timeout(this.requestTimeout),
      catchError(res => throwError(() => res)),
      map(data =>
        Object.keys(data).reduce(
          (fileNames, namespace) => [...fileNames, ...data[namespace].map((fileName: string) => `${namespace}:${fileName}`)],
          []
        )
      )
    );
  }

  getAllNamespacesFilesContent(rdfModel?: RdfModel): Observable<FileContentModel[]> {
    return this.getNamespacesAppendWithFiles().pipe(
      map(aspectModelFileNames =>
        aspectModelFileNames.reduce(
          (files, fileName) =>
            fileName !== rdfModel?.getAbsoluteAspectModelFileName()
              ? [...files, this.getAspectMetaModel(fileName).pipe(map(aspectMetaModel => new FileContentModel(fileName, aspectMetaModel)))]
              : files,
          []
        )
      ),
      mergeMap((files$: Observable<string>[]) => {
        if (files$.length) {
          return forkJoin(files$);
        }
        return of([]);
      }),
      catchError(() => of([]))
    );
  }

  validateFilesForExport(files: string[]): Observable<any> {
    return this.http.post(`${this.serviceUrl}${this.api.package}/validate-models`, files);
  }

  getExportZipFile(): Observable<any> {
    return this.http.get(`${this.serviceUrl}${this.api.package}/export-zip`, {
      responseType: 'blob' as 'json',
    });
  }

  getAspectMetaModel(aspectModelFileName: string): Observable<string> {
    return this.http
      .get<string>(`${this.serviceUrl}${this.api.models}`, {
        headers: new HttpHeaderBuilder().withContentTypeRdfTurtle().withUrn(aspectModelFileName).build(),
        responseType: 'text' as 'json',
      })
      .pipe(
        timeout(this.requestTimeout),
        catchError(res => throwError(() => res))
      );
  }

  getJsonSample(rdfContent: string): Observable<string> {
    return this.http
      .post<string>(`${this.serviceUrl}${this.api.generate}/json-sample`, rdfContent, {
        headers: new HttpHeaderBuilder().withContentTypeRdfTurtle().build(),
      })
      .pipe(
        timeout(this.requestTimeout),
        catchError(res => throwError(() => res))
      );
  }

  getJsonSchema(rdfContent: string): Observable<string> {
    return this.http
      .post<string>(`${this.serviceUrl}${this.api.generate}/json-schema`, rdfContent, {
        headers: new HttpHeaderBuilder().withContentTypeRdfTurtle().build(),
      })
      .pipe(
        timeout(this.requestTimeout),
        catchError(res => throwError(() => res))
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
  validate(rdfContent: string): Observable<Array<ValidationError>> {
    return this.getValidationErrors(rdfContent).pipe(tap(errors => this.modelValidatorService.notifyCorrectableErrors(errors)));
  }

  getValidationErrors(rdfContent: string): Observable<Array<ValidationError>> {
    return this.http
      .post<Array<ValidationError>>(`${this.serviceUrl}${this.api.models}/validate`, rdfContent, {
        headers: new HttpHeaderBuilder().withContentTypeRdfTurtle().build(),
      })
      .pipe(
        timeout(this.requestTimeout),
        map((data: any) => data.validationErrors),
        catchError(res => throwError(() => res))
      );
  }

  openDocumentation(rdfModel: RdfModel, rdfContent: string): Observable<void> {
    return this.http
      .post(`${this.serviceUrl}${this.api.generate}/documentation`, rdfContent, {
        headers: new HttpHeaderBuilder().withContentTypeRdfTurtle().build(),
        responseType: 'text',
      })
      .pipe(
        timeout(this.requestTimeout),
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
        })
      );
  }
}
