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

import {vi} from 'vitest';

vi.mock('@ame/editor', () => ({
  ModelElementEditorComponent: class {},
}));

import {LoadedFilesService} from '@ame/cache';
import {createTestAspect, createTestCharacteristic, createTestProperty, createTestScalar, createTestTrait} from '@ame/test-helpers';
import {RdfModel} from '@esmf/aspect-model-loader';
import {lastValueFrom} from 'rxjs';
import {describe, expect, it} from 'vitest';
import {
  createFile,
  decodeText,
  extractNamespace,
  getDeepLookupDataType,
  getDescriptionsLocales,
  getPreferredNamesLocales,
  readFile,
  setUniqueElementName,
} from './utils';

describe('utils', () => {
  describe('readFile', () => {
    it('should return parsed file content', async () => {
      const fileContent = 'foo';
      const file = new File([fileContent], 'test.txt');
      const result = await lastValueFrom(readFile(file));
      expect(result).toEqual(fileContent);
    });

    it('should complete the stream after first emit', () => {
      const fileContent = 'foo';
      const file = new File([fileContent], 'test.txt');
      const nextMock = vi.fn();
      const errorMock = vi.fn();

      return new Promise<void>(resolve => {
        readFile(file).subscribe({
          next: nextMock,
          error: errorMock,
          complete: () => {
            expect(nextMock).toHaveBeenCalledTimes(1);
            expect(nextMock).toHaveBeenCalledWith(fileContent);
            expect(errorMock).not.toHaveBeenCalled();
            resolve();
          },
        });
      });
    });

    it('should emit error', () => {
      const invalidFile = null;
      const nextMock = vi.fn();
      const completeMock = vi.fn();

      return new Promise<void>(resolve => {
        readFile(invalidFile).subscribe({
          next: nextMock,
          error: err => {
            expect(nextMock).not.toHaveBeenCalled();
            expect(completeMock).not.toHaveBeenCalled();
            expect(err).toBeInstanceOf(Error);
            expect(err.message).toBeTruthy();
            resolve();
          },
          complete: () => completeMock,
        });
      });
    });
  });

  describe('createFile', () => {
    it('should create a File instance with given content and defaults', () => {
      const file = createFile('hello world', 'test.txt');
      expect(file).toBeInstanceOf(File);
      expect(file.name).toBe('test.txt');
      expect(file.type).toBe('text/plain');
    });

    it('should create a File instance with custom mime type', () => {
      const file = createFile('{"a":1}', 'test.json', 'application/json');
      expect(file.name).toBe('test.json');
      expect(file.type).toBe('application/json');
    });
  });

  describe('decodeText', () => {
    it('should decode buffer source to string', () => {
      const text = 'Hello world';
      const encoder = new TextEncoder();
      const encoded = encoder.encode(text);
      expect(decodeText(encoded)).toBe(text);
    });
  });

  describe('setUniqueElementName', () => {
    it('should set unique name for DefaultAspect with counter if collision occurs', () => {
      const aspect = createTestAspect('Aspect', 'urn:samm:org.eclipse.examples:1.0.0#Aspect');
      const rdfModel = {
        getAspectModelUrn: () => 'urn:samm:org.eclipse.examples:1.0.0#',
      } as RdfModel;

      const loadedFilesMock = {
        getElement: vi.fn((urn: string) => (urn === 'urn:samm:org.eclipse.examples:1.0.0#Aspect1' ? {} : null)),
      } as unknown as LoadedFilesService;

      setUniqueElementName(aspect, rdfModel, loadedFilesMock);

      expect(aspect.name).toBe('Aspect2');
      expect(aspect.aspectModelUrn).toBe('urn:samm:org.eclipse.examples:1.0.0#Aspect2');
    });

    it('should lowercase the first letter for DefaultProperty', () => {
      const prop = createTestProperty('prop', 'urn:samm:org.eclipse.examples:1.0.0#prop');
      const rdfModel = {
        getAspectModelUrn: () => 'urn:samm:org.eclipse.examples:1.0.0#',
      } as RdfModel;

      const loadedFilesMock = {
        getElement: vi.fn(() => null),
      } as unknown as LoadedFilesService;

      setUniqueElementName(prop, rdfModel, loadedFilesMock, 'MyProperty');

      expect(prop.name).toBe('myProperty1');
      expect(prop.aspectModelUrn).toBe('urn:samm:org.eclipse.examples:1.0.0#myProperty1');
    });
  });

  describe('extractNamespace', () => {
    it('should extract namespace part before #', () => {
      expect(extractNamespace('urn:samm:org.eclipse.examples:1.0.0#MyAspect')).toBe('urn:samm:org.eclipse.examples:1.0.0');
    });

    it('should return entire URN if no # is present', () => {
      expect(extractNamespace('urn:samm:org.eclipse.examples:1.0.0')).toBe('urn:samm:org.eclipse.examples:1.0.0');
    });
  });

  describe('getPreferredNamesLocales & getDescriptionsLocales', () => {
    it('should return locales from preferredNames and descriptions', () => {
      const aspect = createTestAspect('Aspect', 'urn:samm:org.eclipse.examples:1.0.0#Aspect');
      aspect.preferredNames.set('en', 'Name EN');
      aspect.preferredNames.set('de', 'Name DE');
      aspect.descriptions.set('en', 'Desc EN');

      expect(getPreferredNamesLocales(aspect)).toEqual(['en', 'de']);
      expect(getDescriptionsLocales(aspect)).toEqual(['en']);
    });
  });

  describe('getDeepLookupDataType', () => {
    it('should return null for null characteristic', () => {
      expect(getDeepLookupDataType(null)).toBeNull();
    });

    it('should return dataType of DefaultCharacteristic', () => {
      const char = createTestCharacteristic('Char', 'urn:char');
      const scalar = createTestScalar();
      char.dataType = scalar;
      expect(getDeepLookupDataType(char)).toBe(scalar);
    });

    it('should return baseCharacteristic dataType for DefaultTrait', () => {
      const trait = createTestTrait('Trait', 'urn:trait');
      const char = createTestCharacteristic('Char', 'urn:char');
      const scalar = createTestScalar();
      char.dataType = scalar;
      trait.baseCharacteristic = char;

      expect(getDeepLookupDataType(trait)).toBe(scalar);
    });
  });
});
