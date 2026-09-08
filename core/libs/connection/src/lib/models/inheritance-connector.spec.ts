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

import {MaxGraphAttributeService, MaxGraphService} from '@ame/max-graph';
import {SammLanguageSettingsService} from '@ame/settings-dialog';
import {ElementCreatorService, NotificationsService} from '@ame/shared';
import {LanguageTranslationService} from '@ame/translation';
import {TestBed} from '@angular/core/testing';
import {DefaultEntity, DefaultProperty} from '@esmf/aspect-model-loader';
import {Cell} from '@maxgraph/core';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {EntityInheritanceConnector} from './entity-inheritance-connector';
import {PropertyInheritanceConnector} from './property-inheritance-connector';

describe('Inheritance Connectors', () => {
  let propertyConnector: PropertyInheritanceConnector;
  let entityConnector: EntityInheritanceConnector;

  const mockMaxGraphService = {
    assignToParent: vi.fn(),
    resolveParents: vi.fn().mockReturnValue([]),
    removeCells: vi.fn(),
    formatCell: vi.fn(),
    formatShapes: vi.fn(),
    resolveCellByModelElement: vi.fn(),
  };

  const mockMaxGraphAttributeService = {
    graph: {
      labelChanged: vi.fn(),
      getOutgoingEdges: vi.fn().mockReturnValue([]),
    },
  };

  const mockSammLangService = {
    currentLanguage: 'en',
  };

  const mockNotificationsService = {
    warning: vi.fn(),
  };

  const mockTranslate = {
    language: {
      notificationService: {
        childForPredefinedElementError: 'Child cannot be added to predefined element',
      },
    },
  };

  const mockElementCreator = {
    createEmptyElement: vi.fn(),
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        PropertyInheritanceConnector,
        EntityInheritanceConnector,
        {provide: MaxGraphService, useValue: mockMaxGraphService},
        {provide: MaxGraphAttributeService, useValue: mockMaxGraphAttributeService},
        {provide: SammLanguageSettingsService, useValue: mockSammLangService},
        {provide: NotificationsService, useValue: mockNotificationsService},
        {provide: LanguageTranslationService, useValue: mockTranslate},
        {provide: ElementCreatorService, useValue: mockElementCreator},
      ],
    });

    propertyConnector = TestBed.inject(PropertyInheritanceConnector);
    entityConnector = TestBed.inject(EntityInheritanceConnector);
  });

  describe('PropertyInheritanceConnector', () => {
    it('should identify inherited property elements correctly', () => {
      const prop = new DefaultProperty({aspectModelUrn: 'urn:test#prop', name: 'prop', metaModelVersion: '2.0.0'});
      expect(propertyConnector.isInheritedElement(prop)).toBe(true);
    });

    it('should show warning notification if parent element is predefined', () => {
      const predefinedProp = new DefaultProperty({
        aspectModelUrn: 'urn:test#predefined',
        name: 'predefined',
        metaModelVersion: '2.0.0',
        isPredefined: true,
      });
      const childProp = new DefaultProperty({
        aspectModelUrn: 'urn:test#child',
        name: 'child',
        metaModelVersion: '2.0.0',
      });

      const parentCell = new Cell();
      const childCell = new Cell();

      propertyConnector.connect(predefinedProp, childProp, parentCell, childCell);

      expect(mockNotificationsService.warning).toHaveBeenCalled();
    });

    it('should update parent property name to [childName] on connect', () => {
      const parentProp = new DefaultProperty({
        aspectModelUrn: 'urn:test#parentProp',
        name: 'parentProp',
        metaModelVersion: '2.0.0',
      });
      const childProp = new DefaultProperty({
        aspectModelUrn: 'urn:test#childProp',
        name: 'childProp',
        metaModelVersion: '2.0.0',
        isAbstract: true,
      });

      const parentCell = new Cell();
      (parentCell as any).configuration = {};
      const childCell = new Cell();

      propertyConnector.connect(parentProp, childProp, parentCell, childCell);

      expect(parentProp.name).toBe('[childProp]');
      expect(parentProp.getExtends()).toBe(childProp);
      expect(mockMaxGraphService.assignToParent).toHaveBeenCalledWith(childCell, parentCell);
    });
  });

  describe('EntityInheritanceConnector', () => {
    it('should identify inherited entity elements correctly', () => {
      const entity = new DefaultEntity({
        aspectModelUrn: 'urn:test#Entity',
        name: 'Entity',
        metaModelVersion: '2.0.0',
      });
      expect(entityConnector.isInheritedElement(entity)).toBe(true);
    });
  });
});
