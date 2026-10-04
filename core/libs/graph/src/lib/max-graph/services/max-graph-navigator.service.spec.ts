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

import {provideZonelessChangeDetection, signal} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {DefaultAspect, DefaultProperty} from '@esmf/aspect-model-loader';
import {of} from 'rxjs';
import {beforeEach, describe, expect, it} from 'vitest';
import {MaxGraphNavigatorService, namedElementSearchFields} from './max-graph-navigator.service';
import {MaxGraphService} from './max-graph.service';

describe('MaxGraphNavigatorService search', () => {
  const urn = (name: string) => `urn:samm:org.eclipse.examples:1.0.0#${name}`;
  let service: MaxGraphNavigatorService;
  let aspect: DefaultAspect;
  let property: DefaultProperty;

  beforeEach(() => {
    aspect = new DefaultAspect({name: 'BatteryPass', aspectModelUrn: urn('BatteryPass'), metaModelVersion: '2.2.0'});
    aspect.preferredNames.set('en', 'Battery passport');
    property = new DefaultProperty({
      name: 'capacityThresholdExhaustion',
      aspectModelUrn: urn('capacityThresholdExhaustion'),
      metaModelVersion: '2.2.0',
    });
    property.descriptions.set('de', 'Schwellwert für die Erschöpfung der Kapazität');

    const cells = [aspect, property].map(element => ({getMetaModelElement: () => ({element})}));

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        {
          provide: MaxGraphService,
          useValue: {
            isModelEmpty: signal(false),
            graphVersion: signal(0),
            graphInitialized$: of(true),
            graph: {getChildVertices: () => cells, getDefaultParent: () => ({})},
          },
        },
      ],
    });
    service = TestBed.inject(MaxGraphNavigatorService);
  });

  it('should find words at any position of the element name', () => {
    expect(service.searchElements('exhaustion')).toEqual([property]);
    expect(service.searchElements('threshold')).toEqual([property]);
  });

  it('should search preferred names and descriptions in all languages', () => {
    expect(service.searchElements('passport')).toEqual([aspect]);
    expect(service.searchElements('erschöpfung kapazität')).toEqual([property]);
  });

  it('should return details about the matched fields', () => {
    const [result] = service.searchElementsWithDetails('schwellwert');
    expect(result.item).toBe(property);
    expect(result.matches[0]).toMatchObject({key: 'description', lang: 'de'});
  });

  it('should extract all searchable fields of an element', () => {
    expect(namedElementSearchFields(aspect)).toEqual([
      {key: 'name', value: 'BatteryPass'},
      {key: 'preferredName', value: 'Battery passport', lang: 'en'},
      {key: 'urn', value: urn('BatteryPass')},
    ]);
  });
});
