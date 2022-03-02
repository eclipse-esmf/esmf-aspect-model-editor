/*
 * Copyright (c) 2020 Robert Bosch Manufacturing Solutions GmbH, Germany. All rights reserved.
 */
import {Inject, Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {catchError, map, mergeMap, tap, timeout} from 'rxjs/operators';
import {forkJoin, Observable, of, throwError} from 'rxjs';
import {CORE_CONFIG} from '@bci-web-core/core';
import {ElectronService} from 'ngx-electron';
import {
  LogService,
  BrowserService,
  AppConfig,
  HttpHeaderBuilder,
  FileContentModel,
  SemanticError,
  SyntacticError,
  ProcessingError,
} from '@bame/shared';
import {ModelValidatorService} from './model-validator.service';
import {RdfModel} from '@bame/rdf/utils';

@Injectable({
  providedIn: 'root',
})
export class ModelApiService {
  private baseUrl = `${this.config.bameService}/bame/api/models`;
  private requestTimeout = 60000;

  constructor(
    private http: HttpClient,
    private electronService: ElectronService,
    private loggerService: LogService,
    private browserService: BrowserService,
    private modelValidatorService: ModelValidatorService,
    @Inject(CORE_CONFIG) private config: AppConfig
  ) {}

  private readonly LATEST_FILENAME = ':latest.ttl';

  getDefaultAspectModel(): Observable<string> {
    return this.http.get('assets/aspect-models/default.ttl', {responseType: 'text'});
  }

  getMovementAspectModel(): Observable<string> {
    return this.http.get('assets/aspect-models/movement.ttl', {responseType: 'text'});
  }

  loadAspectModelByUrn(urn: string): Observable<string> {
    return this.http
      .get<string>(`${this.baseUrl}`, {
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

  saveModel(rdfContent: string): Observable<string> {
    return this.http.post<string>(`${this.baseUrl}`, rdfContent).pipe(
      timeout(this.requestTimeout),
      catchError(res => throwError(() => res))
    );
  }

  uploadZip(zipPath: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/validate-import-zip?zipFilePath=${encodeURIComponent(zipPath)}`, null);
  }

  replaceFiles(files: string[]): Observable<any> {
    return this.http.post(`${this.baseUrl}/import`, files);
  }

  saveLatest(rdfContent: string): Observable<string> {
    return this.http
      .post<string>(`${this.baseUrl}`, rdfContent, {
        headers: new HttpHeaderBuilder().withContentTypeRdfTurtle().withUrn(':latest.ttl').build(),
      })
      .pipe(
        timeout(this.requestTimeout),
        catchError(res => throwError(() => res))
      );
  }

  deleteNamespace(namespace: string): Observable<string> {
    return this.http
      .delete<string>(`${this.baseUrl}`, {
        headers: new HttpHeaderBuilder().withContentTypeRdfTurtle().withUrn(namespace).build(),
      })
      .pipe(
        timeout(this.requestTimeout),
        catchError(res => throwError(() => res))
      );
  }

  // TODO In the backend a defined object should be returned
  getAllNamespaces(): Observable<any> {
    return this.http
      .get<Map<string, Array<string>>>(`${this.baseUrl}/namespaces`, {
        params: {
          shouldRefresh: true,
        },
      })
      .pipe(
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

  getAllNamespacesFilesContent(rdfModel: RdfModel): Observable<FileContentModel[]> {
    return this.getAllNamespaces().pipe(
      map(aspectModelFileNames =>
        aspectModelFileNames.reduce(
          (files, fileName) =>
            fileName !== rdfModel.getAbsoluteAspectModelFileName()
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
    return this.http.post(`${this.baseUrl}/validate-models`, files);
  }

  getExportZipFile(): Observable<any> {
    return this.http.get(`${this.baseUrl}/export-zip/AME.zip`, {
      responseType: 'blob' as 'json',
    });
  }

  getAspectMetaModel(aspectModelFileName: string): Observable<string> {
    return this.http
      .get<string>(`${this.baseUrl}`, {
        headers: new HttpHeaderBuilder().withContentTypeRdfTurtle().withUrn(aspectModelFileName).build(),
        responseType: 'text' as 'json',
      })
      .pipe(
        timeout(this.requestTimeout),
        catchError(res => throwError(() => res))
      );
  }

  migrateAspectModel(rdfContent: string, errors: Array<SemanticError | SyntacticError | ProcessingError>): Observable<string> {
    this.modelValidatorService.notifyCorrectableErrors(errors);
    return this.http
      .post(`${this.baseUrl}/migrate`, rdfContent, {
        headers: new HttpHeaderBuilder().withContentTypeRdfTurtle().build(),
        responseType: 'text',
      })
      .pipe(timeout(this.requestTimeout));
  }

  /*
   *This method will get all the errors and notify the user for those which are correctable.
   */
  validate(rdfContent: string): Observable<Array<SemanticError | SyntacticError | ProcessingError>> {
    return this.getValidationErrors(rdfContent).pipe(tap(errors => this.modelValidatorService.notifyCorrectableErrors(errors)));
  }

  getValidationErrors(rdfContent: string): Observable<Array<SemanticError | SyntacticError | ProcessingError>> {
    return this.http
      .post<Array<SemanticError | SyntacticError | ProcessingError>>(`${this.baseUrl}/validate`, rdfContent, {
        headers: new HttpHeaderBuilder().withContentTypeRdfTurtle().build(),
      })
      .pipe(
        timeout(this.requestTimeout),
        map((data: any) => data.validationErrors),
        catchError(res => throwError(() => res))
      );
  }

  // TODO should be removed in version 2.7.0 or higher, as migration then hopefully completed.
  getOldValidationErrors(rdfContent: string): Observable<Array<SemanticError | SyntacticError | ProcessingError>> {
    return this.http
      .post<Array<SemanticError | SyntacticError | ProcessingError>>(`${this.baseUrl}/validateOldModel`, rdfContent, {
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
      .post(`${this.baseUrl}/docu`, rdfContent, {headers: new HttpHeaderBuilder().withContentTypeRdfTurtle().build(), responseType: 'text'})
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

          const fs = this.electronService.remote.require('fs');
          const os = this.electronService.remote.require('os');
          const path = this.electronService.remote.require('path');
          const bameTmpDir = path.join(os.homedir(), '.bametmp');
          const printFilePath = path.normalize(path.join(bameTmpDir, 'print.html'));
          const BrowserWindow = this.electronService.remote.BrowserWindow;
          const electronBrowserWindow = new BrowserWindow({
            width: 1920,
            height: 1080,
          });

          if (!fs.existsSync(bameTmpDir)) {
            fs.mkdirSync(bameTmpDir);
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
