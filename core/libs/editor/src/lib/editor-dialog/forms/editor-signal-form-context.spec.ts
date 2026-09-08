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

import {signal} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {form, required} from '@angular/forms/signals';
import {beforeEach, describe, expect, it} from 'vitest';
import {EditorSignalFormContext} from './editor-signal-form-context';

describe('EditorSignalFormContext', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  function createContext(initialValue: Record<string, unknown>) {
    return TestBed.runInInjectionContext(() => new EditorSignalFormContext(initialValue));
  }

  it('should store and retrieve dynamic fields and values', () => {
    const context = createContext({changedMetaModel: null});

    context.set('name', 'Aspect');

    expect(context.get('name')).toBe('Aspect');
    expect(context.value().name).toBe('Aspect');
  });

  it('should write registered FieldTree updates back to context value', () => {
    const context = createContext({});
    const nameModel = signal('Aspect');
    const nameField = TestBed.runInInjectionContext(() => form(nameModel));
    context.register('name', nameField);

    context.field<string>('name')().value.set('RenamedAspect');

    expect(context.value().name).toBe('RenamedAspect');
  });

  it('should patch and remove dynamic locale fields immutably', () => {
    const context = createContext({name: 'Aspect', descriptionEn: ''});
    const original = context.value();

    context.patch({descriptionEn: 'Description', preferredNameDe: 'Aspekt'});
    expect(context.value()).not.toBe(original);
    expect(context.value()).toMatchObject({descriptionEn: 'Description', preferredNameDe: 'Aspekt'});

    context.remove('descriptionEn');
    expect('descriptionEn' in context.value()).toBe(false);
  });

  it('should reset values plus dirty and touched state', () => {
    const context = createContext({});
    const nameModel = signal('Aspect');
    const nameField = TestBed.runInInjectionContext(() => form(nameModel));
    context.register('name', nameField);
    nameField().value.set('Changed');
    nameField().markAsDirty();
    nameField().markAsTouched();

    context.reset({name: 'Aspect'});

    expect(context.value()).toEqual({name: 'Aspect'});
    expect(nameField().dirty()).toBe(false);
    expect(nameField().touched()).toBe(false);
  });

  it('should aggregate registered native fields and remove them on cleanup', () => {
    const context = createContext({changedMetaModel: null});
    const integerModel = signal<number | null>(null);
    const integerField = TestBed.runInInjectionContext(() => form(integerModel, path => required(path)));
    const unregister = context.register('integer', integerField);

    expect(context.value().integer).toBeNull();
    expect(context.valid()).toBe(false);

    context.set('integer', 3);
    expect(integerModel()).toBe(3);
    expect(context.value().integer).toBe(3);
    expect(context.valid()).toBe(true);

    unregister();
    expect('integer' in context.value()).toBe(false);
    expect(context.valid()).toBe(true);
  });
});
