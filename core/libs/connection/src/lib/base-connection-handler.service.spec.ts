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

import {beforeEach, describe, expect, it, vi} from 'vitest';

vi.mock('@ame/loader-filters', () => ({
  FiltersService: class {
    createNode(element: any, options: any) {
      return {element, options};
    }
  },
}));

import {FiltersService} from '@ame/loader-filters';
import {MaxGraphAttributeService, MaxGraphService, MaxGraphShapeOverlayService} from '@ame/max-graph';
import {SammLanguageSettingsService} from '@ame/settings-dialog';
import {ElementCreatorService} from '@ame/shared';
import {Injectable} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {DefaultProperty} from '@esmf/aspect-model-loader';
import {TranslocoTestingModule} from '@jsverse/transloco';
import {Cell} from '@maxgraph/core';
import {BaseConnectionHandler} from './base-connection-handler.service';

@Injectable()
class TestConnectionHandler extends BaseConnectionHandler {}

describe('BaseConnectionHandler', () => {
  let handler: TestConnectionHandler;

  const mockMaxGraphAttributeService = {
    graph: {
      labelChanged: vi.fn(),
    },
  };

  const mockMaxGraphService = {
    graph: {},
  };

  const mockMaxGraphShapeOverlayService = {};
  const mockSammLangService = {currentLanguage: 'en'};
  const mockElementCreator = {};

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TranslocoTestingModule.forRoot({langs: {en: {}}})],
      providers: [
        TestConnectionHandler,
        FiltersService,
        {provide: MaxGraphAttributeService, useValue: mockMaxGraphAttributeService},
        {provide: MaxGraphService, useValue: mockMaxGraphService},
        {provide: MaxGraphShapeOverlayService, useValue: mockMaxGraphShapeOverlayService},
        {provide: SammLanguageSettingsService, useValue: mockSammLangService},
        {provide: ElementCreatorService, useValue: mockElementCreator},
      ],
    });

    handler = TestBed.inject(TestConnectionHandler);
  });

  it('should refreshPropertiesLabel on a cell', () => {
    const cell = new Cell();
    (cell as any).configuration = {fields: []};
    const prop = new DefaultProperty({aspectModelUrn: 'urn:test#prop', name: 'prop', metaModelVersion: '2.0.0'});

    handler.refreshPropertiesLabel(cell, prop);

    expect(mockMaxGraphAttributeService.graph.labelChanged).toHaveBeenCalledWith(cell, null, null);
  });
});
