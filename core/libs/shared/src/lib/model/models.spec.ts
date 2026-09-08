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

import {describe, expect, it} from 'vitest';
import {NotificationType} from '../enums';
import {
  FileContentModel,
  KnownVersion,
  NamespaceModel,
  NotificationModel,
  SammVersion,
  ToggleSettings,
  entityValueSearchOption,
  filesSearchOption,
  mxCellSearchOption,
  sammElements,
  unitSearchOption,
} from './index';

describe('Shared Models', () => {
  describe('FileContentModel', () => {
    it('should create an instance with provided values', () => {
      const model = new FileContentModel('ModelName', 'urn:samm:org.example:1.0.0#Model', '1.0.0', true, 'Aspect');
      expect(model.name).toBe('ModelName');
      expect(model.aspectModelUrn).toBe('urn:samm:org.example:1.0.0#Model');
      expect(model.version).toBe('1.0.0');
      expect(model.existing).toBe(true);
      expect(model.aspectMetaModel).toBe('Aspect');
    });
  });

  describe('KnownVersion', () => {
    it('should return SammVersion for valid version string', () => {
      expect(KnownVersion.fromVersionString('2.2.0')).toBe(SammVersion.SAMM_2_2_0);
    });

    it('should return null for unknown version string', () => {
      expect(KnownVersion.fromVersionString('99.9.9')).toBeNull();
    });
  });

  describe('NamespaceModel', () => {
    it('should track file status and determine outdated state', () => {
      const ns = new NamespaceModel('org.example', ['file1.ttl', 'file2.ttl']);
      expect(ns.name).toBe('org.example');
      expect(ns.files).toEqual(['file1.ttl', 'file2.ttl']);
      expect(ns.outdated).toBe(false);

      ns.setFileStatus('file1.ttl', '1.0.0', false);
      expect(ns.outdated).toBe(false);
      expect(ns.getFileStatus('file1.ttl')).toEqual({version: '1.0.0', outdated: false});

      ns.setFileStatus('file2.ttl', '1.0.0', true);
      expect(ns.outdated).toBe(true);

      ns.setFileError('file1.ttl', true);
      expect(ns.getFileStatus('file1.ttl')?.hasErrors).toBe(true);

      ns.setFileError('unknown.ttl', true);
      expect(ns.getFileStatus('unknown.ttl')).toEqual({version: null, outdated: false, hasErrors: true});
    });
  });

  describe('NotificationModel', () => {
    it('should initialize with formatted date and time', () => {
      const notification = new NotificationModel('Title', 'Description', 'http://link', NotificationType.Info);
      expect(notification.title).toBe('Title');
      expect(notification.description).toBe('Description');
      expect(notification.link).toBe('http://link');
      expect(notification.type).toBe(NotificationType.Info);
      expect(notification.expanded).toBe(false);
      expect(notification.formattedDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(notification.formattedTime).toBeTruthy();
    });
  });

  describe('ToggleSettings', () => {
    it('should have default false/0 values', () => {
      const settings = new ToggleSettings();
      expect(settings.autoValidation).toBe(false);
      expect(settings.validationTimer).toBe(0);
      expect(settings.map).toBe(false);
      expect(settings.nav).toBe(false);
      expect(settings.notification).toBe(false);
    });
  });

  describe('sammElements and search options', () => {
    it('should define element info for samm elements', () => {
      expect(sammElements.aspect.name).toBe('Aspect');
      expect(sammElements.aspect.symbol).toBe('A');
      expect(sammElements.property.name).toBe('Property');
      expect(sammElements.characteristic.name).toBe('Characteristic');
    });

    it('should define search options', () => {
      expect(unitSearchOption.useExtendedSearch).toBe(true);
      expect(mxCellSearchOption.keys).toContain('id');
      expect(filesSearchOption.keys).toContain('namespace');
      expect(entityValueSearchOption.threshold).toBe(0.0);
    });
  });
});
