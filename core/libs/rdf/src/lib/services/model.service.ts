/*
 * Copyright (c) 2026 Robert Bosch Manufacturing Solutions GmbH
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
  private readonly loadedFilesService = inject(LoadedFilesService);
  private readonly visitorAnnouncerSubject$ = new Subject<{observer: Observer<void>}>();

  get visitorAnnouncer$(): Observable<{observer: Observer<void>}> {
    return this.visitorAnnouncerSubject$.asObservable();
  }

  constructor() {
    if (!environment.production && typeof window !== 'undefined') {
      window['angular.modelService'] = this;
    }
  }

  removeAspect(): void {
    if (this.loadedFilesService.currentLoadedFile) {
      this.loadedFilesService.currentLoadedFile.aspect = null;
    }
  }

  finishStoreUpdate(observer: Observer<void>): void {
    observer?.next();
    observer?.complete();
  }

  synchronizeModelToRdf(): Observable<void> {
    if (!this.loadedFilesService?.currentLoadedFile?.rdfModel) {
      return throwError(() => ({type: SaveValidateErrorsCodes.emptyModel}));
    }

    return new Observable((observer: Observer<void>) => {
      this.visitorAnnouncerSubject$.next({observer});
    });
  }
}
