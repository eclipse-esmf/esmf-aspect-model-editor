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

import {computed, signal, WritableSignal} from '@angular/core';
import {FieldTree} from '@angular/forms/signals';

export type EditorFormModel = Record<string, unknown>;

/**
 * Shared native Signal Forms context for the polymorphic editor dialog.
 *
 * Editor fields are registered dynamically because the available fields depend on the
 * selected SAMM element type and configured languages.
 */
export class EditorSignalFormContext<TModel extends EditorFormModel = EditorFormModel> {
  static create(): EditorSignalFormContext {
    return new EditorSignalFormContext<EditorFormModel>({changedMetaModel: null});
  }

  private readonly registeredFields = signal(new Map<string, FieldTree<unknown>>());
  private readonly rawValues: WritableSignal<EditorFormModel>;

  readonly valid = computed(() => [...this.registeredFields().values()].every(field => field().valid()));

  constructor(initialValue: TModel) {
    this.rawValues = signal({...initialValue});
  }

  get<TValue = unknown>(key: string): TValue | undefined {
    const registeredField = this.registeredFields().get(key);
    if (registeredField) {
      return (registeredField as any)().value() as TValue;
    }
    return this.rawValues()[key] as TValue;
  }

  value(): TModel {
    const registeredValues = [...this.registeredFields()].reduce<EditorFormModel>((values, [key, field]) => {
      values[key] = field().value();
      return values;
    }, {});
    return {...this.rawValues(), ...registeredValues} as TModel;
  }

  field<TValue>(key: string): FieldTree<TValue> | undefined {
    return this.registeredFields().get(key) as unknown as FieldTree<TValue> | undefined;
  }

  register<TValue>(key: string, field: FieldTree<TValue>): () => void {
    this.registeredFields.update(fields => new Map(fields).set(key, field as FieldTree<unknown>));
    return () => this.remove(key);
  }

  set<TValue>(key: string, value: TValue): void {
    const field = this.registeredFields().get(key);
    if (field) {
      field().value.set(value);
      return;
    }
    this.rawValues.update(values => ({...values, [key]: value}));
  }

  patch(value: Partial<TModel>): void {
    for (const [key, val] of Object.entries(value)) {
      this.set(key, val);
    }
  }

  remove(key: string): void {
    this.registeredFields.update(fields => {
      const updatedFields = new Map(fields);
      updatedFields.delete(key);
      return updatedFields;
    });
    this.rawValues.update(values => {
      const updated = {...values};
      delete updated[key];
      return updated;
    });
  }

  reset(value: TModel): void {
    this.rawValues.set({...value});
    for (const [key, field] of this.registeredFields().entries()) {
      field().reset();
      if (key in value) {
        field().value.set((value as any)[key]);
      }
    }
  }
}
