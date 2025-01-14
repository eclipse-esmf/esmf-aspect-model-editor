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

import {LoadedFilesService} from '@ame/cache';
import {SaveValidateErrorsCodes} from '@ame/shared';
import {Injectable} from '@angular/core';
import {Aspect, Samm} from '@esmf/aspect-model-loader';
import {environment} from 'environments/environment';
import {Observable, Observer, Subject, throwError} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ModelService {
  private visitorAnnouncerSubject$ = new Subject<{observer: Observer<void>}>();

  get visitorAnnouncer$() {
    return this.visitorAnnouncerSubject$.asObservable();
  }

  constructor(private loadedFilesService: LoadedFilesService) {
    if (!environment.production) {
      window['angular.modelService'] = this;
    }
  }

  removeAspect() {
    this.loadedFilesService.currentLoadedFile.aspect = null;
  }

  addAspect(aspect: Aspect) {
    this.loadedFilesService.currentLoadedFile.aspect = aspect;
  }

  getSammVersion(aspectModel: string) {
    const partialSammUri = `<${Samm.BASE_URI}meta-model:`;
    const startVersionIndex = aspectModel.indexOf(partialSammUri);
    const endVersionIndex = aspectModel.indexOf('#', startVersionIndex);
    return aspectModel.slice(startVersionIndex + partialSammUri.length, endVersionIndex);
  }

  finishStoreUpdate(observer: Observer<void>) {
    observer.next();
    observer.complete();
  }

  synchronizeModelToRdf() {
    if (!this.loadedFilesService?.currentLoadedFile?.rdfModel) {
      return throwError(() => ({type: SaveValidateErrorsCodes.emptyModel}));
    }

    return new Observable((observer: Observer<void>) => {
      this.visitorAnnouncerSubject$.next({observer});
    });
  }
}
