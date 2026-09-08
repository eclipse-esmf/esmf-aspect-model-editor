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
import {TestBed} from '@angular/core/testing';
import {RdfModel} from '@esmf/aspect-model-loader';
import {Store} from 'n3';
import {Observer} from 'rxjs';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {ModelService} from './model.service';

describe('ModelService', () => {
  let service: ModelService;
  let loadedFilesService: {
    currentLoadedFile: {
      aspect?: unknown;
      rdfModel?: RdfModel | null;
    } | null;
  };

  beforeEach(() => {
    loadedFilesService = {
      currentLoadedFile: {
        aspect: {name: 'TestAspect'},
        rdfModel: new RdfModel(new Store(), '2.2.0', null),
      },
    };

    TestBed.configureTestingModule({
      providers: [ModelService, {provide: LoadedFilesService, useValue: loadedFilesService}],
    });

    service = TestBed.inject(ModelService);
  });

  it('should be created and register on window in non-production mode', () => {
    expect(service).toBeTruthy();
    expect((window as unknown as Record<string, unknown>)['angular.modelService']).toBe(service);
  });

  describe('removeAspect', () => {
    it('should set currentLoadedFile.aspect to null when file exists', () => {
      expect(loadedFilesService.currentLoadedFile?.aspect).toEqual({name: 'TestAspect'});

      service.removeAspect();

      expect(loadedFilesService.currentLoadedFile?.aspect).toBeNull();
    });

    it('should handle currentLoadedFile being null or undefined gracefully', () => {
      loadedFilesService.currentLoadedFile = null;

      expect(() => service.removeAspect()).not.toThrow();
    });
  });

  describe('finishStoreUpdate', () => {
    it('should call next and complete on the observer', () => {
      const observer: Observer<void> = {
        next: vi.fn(),
        error: vi.fn(),
        complete: vi.fn(),
      };

      service.finishStoreUpdate(observer);

      expect(observer.next).toHaveBeenCalledWith();
      expect(observer.complete).toHaveBeenCalled();
    });

    it('should not throw if observer is undefined or null', () => {
      expect(() => service.finishStoreUpdate(undefined as unknown as Observer<void>)).not.toThrow();
    });
  });

  describe('synchronizeModelToRdf', () => {
    it('should throw emptyModel error when currentLoadedFile is null', async () => {
      loadedFilesService.currentLoadedFile = null;

      await expect(
        new Promise((_, reject) => {
          service.synchronizeModelToRdf().subscribe({
            error: reject,
          });
        }),
      ).rejects.toEqual({type: SaveValidateErrorsCodes.emptyModel});
    });

    it('should throw emptyModel error when currentLoadedFile has no rdfModel', async () => {
      loadedFilesService.currentLoadedFile = {aspect: null, rdfModel: null};

      await expect(
        new Promise((_, reject) => {
          service.synchronizeModelToRdf().subscribe({
            error: reject,
          });
        }),
      ).rejects.toEqual({type: SaveValidateErrorsCodes.emptyModel});
    });

    it('should emit visitorAnnouncerSubject$ when subscribed to synchronizeModelToRdf', async () => {
      let receivedObserver: Observer<void> | null = null;
      service.visitorAnnouncer$.subscribe(event => {
        receivedObserver = event.observer;
      });

      const syncObservable = service.synchronizeModelToRdf();
      const nextSpy = vi.fn();
      const completeSpy = vi.fn();

      syncObservable.subscribe({
        next: nextSpy,
        complete: completeSpy,
      });

      expect(receivedObserver).toBeDefined();
      expect(nextSpy).not.toHaveBeenCalled();

      if (receivedObserver) {
        service.finishStoreUpdate(receivedObserver);
      }

      expect(nextSpy).toHaveBeenCalled();
      expect(completeSpy).toHaveBeenCalled();
    });
  });
});
