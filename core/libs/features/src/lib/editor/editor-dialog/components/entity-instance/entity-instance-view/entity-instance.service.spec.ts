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

import {LoadedFilesService, NamespaceFile} from '@ame/cache';
import {NotificationsService} from '@ame/shared';
import {TestBed} from '@angular/core/testing';
import {
  DefaultCharacteristic,
  DefaultEntity,
  DefaultEntityInstance,
  DefaultEnumeration,
  DefaultProperty,
  ModelElementCache,
  RdfModel,
} from '@esmf/aspect-model-loader';
import {Store} from 'n3';
import {MockProvider} from 'ng-mocks';
import {of} from 'rxjs';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {ConfirmDialogService} from '../../../../confirm-dialog/confirm-dialog.service';
import {ConfirmDialogEnum} from '../../../../models/confirm-dialog.enum';
import {EntityInstanceService} from './entity-instance.service';

describe('EntityInstanceService', () => {
  let service: EntityInstanceService;
  let confirmDialogService: ConfirmDialogService;
  let cache: ModelElementCache;

  beforeEach(() => {
    cache = new ModelElementCache();

    TestBed.configureTestingModule({
      providers: [
        EntityInstanceService,
        MockProvider(ConfirmDialogService, {
          open: vi.fn(() => of(ConfirmDialogEnum.ok)),
        }),
        MockProvider(NotificationsService, {
          warning: vi.fn(),
        }),
        MockProvider(LoadedFilesService, {
          currentLoadedFile: new NamespaceFile(new RdfModel(new Store(), '2.0.0', 'urn:test:1.0.0#'), cache, null),
          isElementExtern: vi.fn(() => false),
        }),
      ],
    });

    service = TestBed.inject(EntityInstanceService);
    confirmDialogService = TestBed.inject(ConfirmDialogService);
  });

  it('onPropertyRemove should call acceptCallback directly if no entity instances exist', () => {
    const prop = new DefaultProperty({aspectModelUrn: 'urn:test:1.0.0#prop', name: 'prop', metaModelVersion: '2.0.0'});
    const callback = vi.fn();

    service.onPropertyRemove(prop, callback);

    expect(callback).toHaveBeenCalled();
    expect(confirmDialogService.open).not.toHaveBeenCalled();
  });

  it('onEntityRemove should remove cached entity instances when confirmed', () => {
    const entity = new DefaultEntity({aspectModelUrn: 'urn:test:1.0.0#Vehicle', name: 'Vehicle', metaModelVersion: '2.0.0'});
    const instance = new DefaultEntityInstance({
      aspectModelUrn: 'urn:test:1.0.0#CarInstance',
      name: 'CarInstance',
      type: entity,
      metaModelVersion: '2.0.0',
    });
    cache.resolveInstance(instance);

    const callback = vi.fn();
    service.onEntityRemove(entity, callback);

    expect(confirmDialogService.open).toHaveBeenCalled();
    expect(cache.get('urn:test:1.0.0#CarInstance')).toBeUndefined();
    expect(callback).toHaveBeenCalled();
  });

  it('onNewProperty should add assertion to entity instances and notify', () => {
    const entity = new DefaultEntity({aspectModelUrn: 'urn:test:1.0.0#Vehicle', name: 'Vehicle', metaModelVersion: '2.0.0'});
    const instance = new DefaultEntityInstance({
      aspectModelUrn: 'urn:test:1.0.0#CarInstance',
      name: 'CarInstance',
      type: entity,
      metaModelVersion: '2.0.0',
      assertions: new Map(),
    });
    cache.resolveInstance(instance);

    const char = new DefaultCharacteristic({aspectModelUrn: 'urn:test:1.0.0#char', name: 'char', metaModelVersion: '2.0.0'});
    const prop = new DefaultProperty({
      aspectModelUrn: 'urn:test:1.0.0#color',
      name: 'color',
      characteristic: char,
      metaModelVersion: '2.0.0',
    });

    service.onNewProperty(prop, entity);

    expect(instance.getAssertion('urn:test:1.0.0#color')).toBeDefined();
  });

  it('onCharacteristicRemove should clean entity instances from enumeration values', () => {
    const entity = new DefaultEntity({aspectModelUrn: 'urn:test:1.0.0#Vehicle', name: 'Vehicle', metaModelVersion: '2.0.0'});
    const instance = new DefaultEntityInstance({
      aspectModelUrn: 'urn:test:1.0.0#CarInstance',
      name: 'CarInstance',
      type: entity,
      metaModelVersion: '2.0.0',
    });
    const enumeration = new DefaultEnumeration({
      aspectModelUrn: 'urn:test:1.0.0#Enum',
      name: 'Enum',
      values: [instance],
      metaModelVersion: '2.0.0',
    });
    instance.addParent(enumeration);
    cache.resolveInstance(instance);

    const callback = vi.fn();
    service.onCharacteristicRemove(enumeration, callback);

    expect(enumeration.values).toEqual([]);
    expect(cache.get('urn:test:1.0.0#CarInstance')).toBeUndefined();
    expect(callback).toHaveBeenCalled();
  });
});
