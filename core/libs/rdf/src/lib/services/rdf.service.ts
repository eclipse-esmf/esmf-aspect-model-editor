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

import {ModelApiService} from '@ame/api';
import {NamespaceFile} from '@ame/cache';
import {APP_CONFIG, AppConfig, BrowserService} from '@ame/shared';
import {LanguageTranslationService} from '@ame/translation';
import {Inject, Injectable} from '@angular/core';
import {RdfModel} from '@esmf/aspect-model-loader';
import {environment} from 'environments/environment';
import {Observable, map, of} from 'rxjs';
import {RdfSerializerService} from './rdf-serializer.service';

@Injectable({
  providedIn: 'root',
})
export class RdfService {
  private _rdfSerializer: RdfSerializerService;

  public externalRdfModels: Array<RdfModel> = [];

  constructor(
    private modelApiService: ModelApiService,
    private translation: LanguageTranslationService,
    private browserService: BrowserService,
    @Inject(APP_CONFIG) public config: AppConfig,
  ) {
    if (!environment.production) {
      window['angular.rdfService'] = this;
    }

    this._rdfSerializer = new RdfSerializerService(this.translation);
  }

  serializeModel(rdfModel: RdfModel): string {
    return this._rdfSerializer.serializeModel(rdfModel);
  }

  parseFileName(fileName: string, urn: string): string {
    if (this.browserService.isStartedAsElectronApp() && window.require) {
      const path = window.require('path');
      fileName = fileName.includes(path.sep) ? `${urn.replace('#', ':')}${path.basename(fileName)}` : fileName;
    }

    return fileName.charAt(0) === '/' ? fileName.substring(1) : fileName;
  }

  isSameModelContent(absoluteFileName: string, fileContent: string, fileToCompare: NamespaceFile): Observable<boolean> {
    if (fileToCompare.absoluteName !== absoluteFileName) return of(false);

    const serializedModel: string = this.serializeModel(fileToCompare.rdfModel);
    return this.modelApiService.formatModel(serializedModel).pipe(map(formattedModel => formattedModel === fileContent));
  }
}
