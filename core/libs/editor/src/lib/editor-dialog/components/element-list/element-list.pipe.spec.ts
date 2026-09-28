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

import {DefaultAspect, DefaultEntity, DefaultProperty} from '@esmf/aspect-model-loader';
import {beforeEach, describe, expect, it} from 'vitest';
import {ModelElementParserPipe} from './element-list.pipe';

describe('ModelElementParserPipe', () => {
  let pipe: ModelElementParserPipe;

  beforeEach(() => {
    pipe = new ModelElementParserPipe();
  });

  it('should return null when element is null or undefined', () => {
    expect(pipe.transform(null)).toBeNull();
    expect(pipe.transform(undefined)).toBeNull();
  });

  it('should parse DefaultAspect element correctly', () => {
    const aspect = new DefaultAspect({
      aspectModelUrn: 'urn:test#AspectTest',
      name: 'AspectTest',
      metaModelVersion: '2.0.0',
    });

    const result = pipe.transform(aspect);
    expect(result).toBeDefined();
    expect(result.element).toBe(aspect);
    expect(result.className).toBe('Aspect');
    expect(result.type).toBe('aspect');
  });

  it('should parse regular DefaultProperty correctly', () => {
    const prop = new DefaultProperty({
      aspectModelUrn: 'urn:test#PropTest',
      name: 'PropTest',
      metaModelVersion: '2.0.0',
    });

    const result = pipe.transform(prop);
    expect(result).toBeDefined();
    expect(result.type).toBe('property');
  });

  it('should parse abstract DefaultProperty correctly', () => {
    const prop = new DefaultProperty({
      aspectModelUrn: 'urn:test#PropAbstract',
      name: 'PropAbstract',
      isAbstract: true,
      metaModelVersion: '2.0.0',
    });

    const result = pipe.transform(prop);
    expect(result).toBeDefined();
    expect(result.type).toBe('abstract-property');
  });

  it('should parse abstract DefaultEntity correctly', () => {
    const entity = new DefaultEntity({
      aspectModelUrn: 'urn:test#EntityAbstract',
      name: 'EntityAbstract',
      isAbstract: true,
      metaModelVersion: '2.0.0',
    });

    const result = pipe.transform(entity);
    expect(result).toBeDefined();
    expect(result.type).toBe('abstract-entity');
  });
});
