/*
 * Copyright (c) 2023 Robert Bosch Manufacturing Solutions GmbH
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

import {Injectable, inject} from '@angular/core';
import {Observable, Observer, of, Subject, throwError} from 'rxjs';
import {catchError, first, map, switchMap, tap} from 'rxjs/operators';
import {Aspect, BaseMetaModelElement, DefaultAbstractProperty, DefaultProperty, LoadedAspectModel} from '@ame/meta-model';
import {InstantiatorService} from '@ame/instantiator';
import {environment} from 'environments/environment';
import {CachedFile, NamespacesCacheService} from '@ame/cache';
import {ModelApiService} from '@ame/api';
import {RdfService} from './rdf.service';
import {APP_CONFIG, AppConfig, LogService, NotificationsService, SaveValidateErrorsCodes} from '@ame/shared';
import {RdfModel} from '../utils';
import {setUniqueElementName} from '@ame/utils';

@Injectable({
  providedIn: 'root',
})
export class ModelService {
  private rdfModel: RdfModel;
  private aspect: Aspect;
  private visitorAnnouncerSubject$ = new Subject<{observer: Observer<void>}>();

  get visitorAnnouncer$() {
    return this.visitorAnnouncerSubject$.asObservable();
  }

  get currentCachedFile(): CachedFile {
    return this.namespaceCacheService.currentCachedFile;
  }

  private config: AppConfig = inject(APP_CONFIG);
  constructor(
    private rdfService: RdfService,
    private namespaceCacheService: NamespacesCacheService,
    private modelApiService: ModelApiService,
    private notificationsService: NotificationsService,
    private instantiatorService: InstantiatorService,
    private logService: LogService
  ) {
    if (!environment.production) {
      window['angular.modelService'] = this;
    }
  }

  removeAspect() {
    this.aspect = null;
    this.rdfService.currentRdfModel.removeAspectFromStore();
  }

  addAspect(aspect: Aspect) {
    this.aspect = aspect;
  }

  getLoadedAspectModel(): LoadedAspectModel {
    return {
      rdfModel: this.rdfModel,
      aspect: this.aspect,
    };
  }

  loadRdfModel(loadedRdfModel: RdfModel, rdfAspectModel: string, namespaceFileName: string): Observable<Aspect> {
    if (this.currentCachedFile) {
      this.currentCachedFile.reset();
    }

    const sammVersion: string = loadedRdfModel.samm.version;

    try {
      if (sammVersion > this.config.currentSammVersion) {
        return throwError(
          () => `The provided Aspect Model is using SAMM version ${sammVersion} which is too high.
            The Aspect Model Editor is currently based on SAMM ${this.config.currentSammVersion}.`
        );
      }

      const rdfModel$ =
        sammVersion < this.config.currentSammVersion ? this.migrateAspectModel(sammVersion, rdfAspectModel) : of(loadedRdfModel);

      return rdfModel$.pipe(
        tap(rdfModel => (this.rdfModel = rdfModel)),
        tap(() => this.setCurrentCacheFile(namespaceFileName)),
        map(() => this.instantiateFile(namespaceFileName)),
        tap(() => this.processAnonymousElements()),
        map(aspect => (this.aspect = aspect)),
        catchError(error =>
          throwError(() => {
            // TODO add the real problem maybe ...
            console.groupCollapsed('model.service -> loadRDFmodel', error);
            console.groupEnd();
            this.logService.logError(`Error while loading the model. ${JSON.stringify(error.message)}.`);
            return error.message;
          })
        )
      );
    } catch (error: any) {
      console.groupCollapsed('model.service -> loadRDFmodel', error);
      console.groupEnd();

      return throwError(() => error.message);
    }
  }

  private migrateAspectModel(sammVersion: string, rdfAspectModel: string): Observable<RdfModel> {
    this.notificationsService.info({
      title: `Migrating from SAMM version ${sammVersion} to SAMM version ${this.config.currentSammVersion}`,
      timeout: 5000,
    });

    return this.modelApiService.migrateAspectModel(rdfAspectModel).pipe(
      first(),
      tap(() =>
        this.notificationsService.info({
          title: `Successfully migrated from SAMM Version ${sammVersion} to SAMM version ${this.config.currentSammVersion} SAMM version`,
          timeout: 5000,
        })
      ),
      switchMap(migratedAspectModel => this.rdfService.loadModel(migratedAspectModel).pipe(first()))
    );
  }

  private setCurrentCacheFile(namespaceFileName: string) {
    this.namespaceCacheService.removeAll();

    let fileName: string;
    if (namespaceFileName) {
      [, , fileName] = namespaceFileName.split(':');
    }

    const currentCachedFile = this.namespaceCacheService.addFile(this.rdfModel.getAspectModelUrn(), fileName);
    this.namespaceCacheService.setCurrentCachedFile(currentCachedFile);
  }

  private instantiateFile(namespaceFileName: string) {
    const [, , fileName] = namespaceFileName.split(':');
    try {
      return this.instantiatorService.instantiateFile(this.rdfModel, this.currentCachedFile, fileName).aspect;
    } catch (error) {
      console.groupCollapsed('model.service -> loadRDFmodel', error);
      console.groupEnd();
      throw new Error('Instantiator cannot load model!');
    }
  }

  saveLatestModel() {
    const synchronizedModel = this.synchronizeModelToRdf();
    return (synchronizedModel || throwError(() => ({type: SaveValidateErrorsCodes.desynchronized}))).pipe(
      switchMap(() => this.rdfService.saveLatestModel(this.rdfModel))
    );
  }

  saveModel() {
    const synchronizedModel = this.synchronizeModelToRdf();
    return (synchronizedModel || throwError(() => ({type: SaveValidateErrorsCodes.desynchronized}))).pipe(
      switchMap(() => this.rdfService.saveModel(this.rdfModel))
    );
  }

  finishStoreUpdate(observer: Observer<void>) {
    observer.next();
    observer.complete();
  }

  synchronizeModelToRdf() {
    if (!this.rdfModel) {
      return throwError(() => ({type: SaveValidateErrorsCodes.emptyModel}));
    }

    return new Observable((observer: Observer<void>) => {
      this.visitorAnnouncerSubject$.next({observer});
    });
  }

  private processAnonymousElements() {
    this.currentCachedFile.getAnonymousElements().forEach((modelElementNamePair: {element: BaseMetaModelElement; name: string}) => {
      this.currentCachedFile.removeElement(modelElementNamePair.element.aspectModelUrn);
      if (modelElementNamePair.name) {
        modelElementNamePair.element.name = modelElementNamePair.name; // assign initial name
        if (this.isElementNameUnique(modelElementNamePair.element)) {
          // if unique, resolve the instance
          this.currentCachedFile.resolveElement(modelElementNamePair.element);
        } else {
          // else resolve the naming
          setUniqueElementName(modelElementNamePair.element, this.rdfModel, this.namespaceCacheService, modelElementNamePair.name);
          this.currentCachedFile.resolveElement(modelElementNamePair.element);
          this.notificationsService.info({
            title: 'Renamed anonymous element',
            message: `The anonymous element ${modelElementNamePair.name} was renamed to ${modelElementNamePair.element.name}`,
            link: `editor/select/${modelElementNamePair.element.aspectModelUrn}`,
            timeout: 2000,
          });
        }
      } else {
        setUniqueElementName(modelElementNamePair.element, this.rdfModel, this.namespaceCacheService);
        this.currentCachedFile.resolveElement(modelElementNamePair.element);
        this.notificationsService.info({
          title: 'Renamed anonymous element',
          message: `The anonymous element was named to ${modelElementNamePair.element.name}`,
          link: `editor/select/${modelElementNamePair.element.aspectModelUrn}`,
          timeout: 2000,
        });
      }
    });
    this.currentCachedFile.clearAnonymousElements();
  }

  private isElementNameUnique(modelElement: BaseMetaModelElement): boolean {
    modelElement.metaModelVersion = this.rdfModel.SAMM().version;
    return !this.currentCachedFile.getElement<BaseMetaModelElement>(`${this.rdfModel.getAspectModelUrn()}${modelElement.name}`);
  }
}
