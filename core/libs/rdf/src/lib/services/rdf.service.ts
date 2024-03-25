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

import {Parser, Store} from 'n3';
import {forkJoin, map, Observable, of, Subject, switchMap, throwError} from 'rxjs';
import {Inject, Injectable} from '@angular/core';
import {environment} from 'environments/environment';
import {ModelApiService} from '@ame/api';
import {APP_CONFIG, AppConfig, FileContentModel, LogService, SaveValidateErrorsCodes} from '@ame/shared';
import {Samm} from '@ame/vocabulary';
import {RdfModel, RdfModelUtil} from '../utils';
import {RdfSerializerService} from './rdf-serializer.service';
import {ConfigurationService, Settings} from '@ame/settings-dialog';
import {LanguageTranslationService} from '@ame/translation';

@Injectable({
  providedIn: 'root',
})
export class RdfService {
  private _rdfSerializer: RdfSerializerService;
  private _settings: Settings;
  private _currentModel: RdfModel;

  public externalRdfModels: Array<RdfModel> = [];

  get currentRdfModel(): RdfModel {
    return this._currentModel;
  }

  set currentRdfModel(value: RdfModel) {
    this._currentModel = value;
  }

  constructor(
    private logService: LogService,
    private modelApiService: ModelApiService,
    private configurationService: ConfigurationService,
    private translation: LanguageTranslationService,
    @Inject(APP_CONFIG) public config: AppConfig,
  ) {
    if (!environment.production) {
      window['angular.rdfService'] = this;
    }

    this._rdfSerializer = new RdfSerializerService(translation);
    this._settings = this.configurationService.getSettings();
  }

  serializeModel(rdfModel: RdfModel): string {
    return this._rdfSerializer.serializeModel(rdfModel);
  }

  saveModel(rdfModel: RdfModel): Observable<RdfModel> {
    const rdfContent = this.serializeModel(rdfModel);

    if (!rdfContent) {
      this.logService.logInfo('Model is empty. Skipping saving.');
      return this.handleError(SaveValidateErrorsCodes.emptyModel);
    }

    return this.modelApiService.formatModel(rdfContent).pipe(
      switchMap(content => {
        if (!content) {
          return this.handleError(SaveValidateErrorsCodes.emptyModel);
        }

        return this.modelApiService.saveModel(content, rdfModel.absoluteAspectModelFileName);
      }),
      switchMap(() => this.loadExternalReferenceModelIntoStore(new FileContentModel(rdfModel.absoluteAspectModelFileName, rdfContent))),
    );
  }

  private handleError(errorCode: SaveValidateErrorsCodes): Observable<never> {
    return throwError(() => ({type: errorCode}));
  }

  loadModel(rdf: string, namespaceFileName?: string): Observable<RdfModel> {
    const rdfModel = new RdfModel();
    const parser = new Parser();
    const store: Store = new Store();
    const subject = new Subject<RdfModel>();

    this._settings.copyrightHeader = RdfModelUtil.extractCommentsFromRdfContent(rdf);

    parser.parse(rdf, (error, quad, prefixes) => {
      if (quad) {
        store.addQuad(quad);
      } else if (prefixes) {
        if (this.haveIncorrectCorrectPrefixes(prefixes)) {
          const incorrectPrefixes = `Incorrect prefixes, please check SAMM specification: https://eclipse-esmf.github.io/samm-specification/${this.config.currentSammVersion}/namespaces.html`;
          this.logService.logInfo(incorrectPrefixes);
          subject.error(incorrectPrefixes);
          subject.complete();
        }
        this.currentRdfModel = rdfModel.initRdfModel(store, prefixes);

        this.currentRdfModel.absoluteAspectModelFileName =
          namespaceFileName ||
          this.currentRdfModel.absoluteAspectModelFileName ||
          `${this.currentRdfModel.getAspectModelUrn().replace('#', ':')}NewModel.ttl`;

        this.currentRdfModel.loadedFromWorkspace = !!namespaceFileName;

        subject.next(this.currentRdfModel);
        subject.complete();
      }

      if (error) {
        this.logService.logInfo(`Error when parsing RDF ${error}`);
        subject.error(error);
        subject.complete();
      }
    });

    return subject;
  }

  private haveIncorrectCorrectPrefixes(prefixes: any): boolean {
    return Object.keys(prefixes)
      .filter((prefix: any) => !['rdf', 'rdfs', 'samm', 'samm-u', 'samm-c', 'samm-e', 'unit', 'xsd'].includes(prefix))
      .some(key => !Samm.isSammPrefix(prefixes[key]));
  }

  loadExternalReferenceModelIntoStore(fileContent: FileContentModel): Observable<RdfModel> {
    const rdfModel = new RdfModel();
    const parser = new Parser();
    const store: Store = new Store();
    const subject = new Subject<RdfModel>();

    parser.parse(fileContent.aspectMetaModel, (error, quad, prefixes) => {
      if (quad) {
        store.addQuad(quad);
      } else if (prefixes) {
        const externalRdfModel = rdfModel.initRdfModel(store, prefixes);
        externalRdfModel.isExternalRef = true;
        externalRdfModel.absoluteAspectModelFileName = fileContent.fileName;
        this.externalRdfModels.push(externalRdfModel);
        subject.next(externalRdfModel);
        subject.complete();
      }

      if (error) {
        this.logService.logInfo(`Error when parsing RDF ${error}`);
        const externalRdfModel = rdfModel.initRdfModel(store, {});
        externalRdfModel.isExternalRef = true;
        externalRdfModel.absoluteAspectModelFileName = fileContent.fileName;
        externalRdfModel.hasErrors = true;
        this.externalRdfModels.push(externalRdfModel);
        subject.next(externalRdfModel);
        subject.complete();
      }
    });

    return subject;
  }

  parseModels(fileContentModels: FileContentModel[]): Observable<RdfModel[]> {
    return forkJoin(fileContentModels.map(fileContent => this.parseModel(fileContent)));
  }

  parseModel(fileContent: FileContentModel): Observable<RdfModel> {
    const rdfModel = new RdfModel();
    const parser = new Parser();
    const store: Store = new Store();
    const subject = new Subject<RdfModel>();

    parser.parse(fileContent.aspectMetaModel, (error, quad, prefixes) => {
      let parsedRdfModel: RdfModel;

      if (quad) {
        store.addQuad(quad);
      } else if (prefixes) {
        parsedRdfModel = rdfModel.initRdfModel(store, prefixes);
      }

      if (error) {
        parsedRdfModel = rdfModel.initRdfModel(store, {});
        parsedRdfModel.hasErrors = true;
        this.logService.logInfo(`Error when parsing RDF ${error}`);
      }

      if (prefixes || error) {
        parsedRdfModel.absoluteAspectModelFileName = fileContent.fileName;
        subject.next(parsedRdfModel);
        subject.complete();
      }
    });

    return subject.asObservable();
  }

  isSameModelContent(absoluteFileName: string, fileContent: string, modelToCompare: RdfModel): Observable<boolean> {
    if (modelToCompare.absoluteAspectModelFileName !== absoluteFileName) return of(false);

    const serializedModel: string = this.serializeModel(modelToCompare);
    return this.modelApiService.formatModel(serializedModel).pipe(map(formattedModel => formattedModel === fileContent));
  }

  removeExternalRdfModel(modelName: string): void {
    this.externalRdfModels = this.externalRdfModels.reduce<RdfModel[]>(
      (models, model) => (model.absoluteAspectModelFileName !== modelName ? [...models, model] : models),
      [],
    );
  }
}
