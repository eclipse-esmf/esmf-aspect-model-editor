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

import {Component, inject, Injector, OnDestroy, OnInit, runInInjectionContext, signal} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {disabled, FieldTree, form, FormField} from '@angular/forms/signals';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInput, MatLabel} from '@angular/material/input';
import {MatTooltipModule} from '@angular/material/tooltip';
import {DefaultCharacteristic, DefaultProperty, HasExtends, NamedElement} from '@esmf/aspect-model-loader';
import {InputFieldComponent} from '../../input-field.component';

@Component({
  selector: 'ame-preferred-name-input-field',
  templateUrl: './preferred-name-input-field.component.html',
  imports: [MatFormFieldModule, MatTooltipModule, MatLabel, FormField, MatInput],
})
export class PreferredNameInputFieldComponent extends InputFieldComponent<NamedElement> implements OnInit, OnDestroy {
  private readonly injector = inject(Injector);
  private readonly unregisterFields: Array<() => void> = [];

  readonly fields = signal<Record<string, FieldTree<string>>>({});
  public fieldName = 'preferredName';

  ngOnInit(): void {
    this.getMetaModelData()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.setPreferredNameNameControls());
  }

  getCurrentValue(key: string, locale: string) {
    if (this.metaModelElement instanceof DefaultCharacteristic && this.metaModelElement.isPredefined) {
      return this.metaModelElement?.getPreferredName(locale) || '';
    }

    const extending = this.metaModelElement as HasExtends;

    if ((extending as HasExtends)?.extends_) {
      return this.previousData()?.[key] || extending?.getPreferredName(locale) || extending.extends_.preferredNames?.get(locale) || '';
    }

    return this.previousData()?.[key] || this.metaModelElement?.getPreferredName(locale) || '';
  }

  isInherited(locale: string): boolean {
    const extending = this.metaModelElement as HasExtends;
    return (
      extending.extends_ &&
      extending.extends_?.preferredNames?.get(locale) &&
      this.field(locale)?.().value() === extending.extends_?.preferredNames?.get(locale)
    );
  }

  field(locale: string): FieldTree<string> {
    return this.fields()[locale];
  }

  ngOnDestroy(): void {
    this.unregisterFields.forEach(unregister => unregister());
    super.ngOnDestroy();
  }

  getPreferredNamesLocales(): string[] {
    return Array.from(this.metaModelElement?.preferredNames?.keys() ?? []);
  }

  getDescriptionsLocales(): string[] {
    return Array.from(this.metaModelElement?.preferredNames?.keys() ?? []);
  }

  private isDisabled() {
    return this.metaModelElement instanceof DefaultProperty && !!this.metaModelElement?.extends_;
  }

  private setPreferredNameNameControls() {
    this.unregisterFields.forEach(unregister => unregister());
    this.unregisterFields.length = 0;

    if (!this.metaModelElement) {
      return;
    }

    const allLocalesPreferredNames = Array.from(this.metaModelElement?.preferredNames?.keys() ?? []);

    if (!allLocalesPreferredNames.length && this.metaModelElement?.preferredNames) {
      this.metaModelElement.preferredNames.set('en', '');
    }

    const fields: Record<string, FieldTree<string>> = {};
    Array.from(this.metaModelElement?.preferredNames?.keys() ?? []).forEach(locale => {
      const key = `preferredName${locale}`;
      const model = signal<string>(String(this.getCurrentValue(key, locale) ?? ''));
      const field = runInInjectionContext(this.injector, () =>
        form(model, path =>
          disabled(path, {
            when: () =>
              this.metaModelDialogService.isReadOnly() || this.loadedFiles.isElementExtern(this.metaModelElement) || this.isDisabled(),
          }),
        ),
      );
      fields[locale] = field;
      this.unregisterFields.push(this.signalForm().register(key, field));
    });
    this.fields.set(fields);
  }
}
