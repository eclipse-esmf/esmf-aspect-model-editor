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
import {inject, Injectable} from '@angular/core';
import {environment} from 'environments/environment';
import {Observable, Observer, Subject, throwError} from 'rxjs';

@Injectable({providedIn: 'root'})
export class ModelService {
  private loadedFilesService = inject(LoadedFilesService);
  private visitorAnnouncerSubject$ = new Subject<{observer: Observer<void>}>();

  get visitorAnnouncer$() {
    return this.visitorAnnouncerSubject$.asObservable();
  }

  constructor() {
    if (!environment.production) {
      window['angular.modelService'] = this;
    }
  }

  removeAspect() {
    this.loadedFilesService.currentLoadedFile.aspect = null;
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
