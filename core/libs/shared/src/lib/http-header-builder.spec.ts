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
import {HttpHeaderBuilder} from './http-header-builder';

describe('HttpHeaderBuilder', () => {
  it('should build empty headers by default', () => {
    const builder = new HttpHeaderBuilder();
    const headers = builder.build();
    expect(headers.keys()).toHaveLength(0);
  });

  it('should set file uri', () => {
    const headers = new HttpHeaderBuilder().withFileUri('file:///path/to/file').build();
    expect(headers.get('uri')).toBe('file:///path/to/file');
  });

  it('should set content type text/turtle', () => {
    const headers = new HttpHeaderBuilder().withContentTypeRdfTurtle().build();
    expect(headers.get('Content-Type')).toBe('text/turtle');
  });

  it('should set content type text', () => {
    const headers = new HttpHeaderBuilder().withTextContentType().build();
    expect(headers.get('Content-Type')).toBe('text');
  });

  it('should set aspect model urn', () => {
    const headers = new HttpHeaderBuilder().withAspectModelUrn('urn:samm:org.example:1.0.0#Test').build();
    expect(headers.get('aspect-model-urn')).toBe('urn:samm:org.example:1.0.0#Test');
  });

  it('should append .ttl if fileName does not end with .ttl', () => {
    const headers = new HttpHeaderBuilder().withFileName('model').build();
    expect(headers.get('file-name')).toBe('model.ttl');
  });

  it('should not duplicate .ttl if fileName already ends with .ttl', () => {
    const headers = new HttpHeaderBuilder().withFileName('model.ttl').build();
    expect(headers.get('file-name')).toBe('model.ttl');
  });

  it('should not set file-name if fileName is empty or null', () => {
    const headers = new HttpHeaderBuilder().withFileName('').build();
    expect(headers.has('file-name')).toBe(false);
  });

  it('should chain multiple headers together', () => {
    const headers = new HttpHeaderBuilder()
      .withFileUri('file:///test')
      .withContentTypeRdfTurtle()
      .withAspectModelUrn('urn:test')
      .withFileName('test')
      .build();

    expect(headers.get('uri')).toBe('file:///test');
    expect(headers.get('Content-Type')).toBe('text/turtle');
    expect(headers.get('aspect-model-urn')).toBe('urn:test');
    expect(headers.get('file-name')).toBe('test.ttl');
  });
});
