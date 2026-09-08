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

import {Component, DestroyRef, inject, Injector, OnDestroy, OnInit, runInInjectionContext, signal} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {disabled, FieldTree, form, FormField} from '@angular/forms/signals';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInput, MatLabel} from '@angular/material/input';
import {MatTooltipModule} from '@angular/material/tooltip';
import {DefaultCharacteristic, DefaultProperty, HasExtends, NamedElement} from '@esmf/aspect-model-loader';
import {EditorModelService} from '../../../../editor-model.service';
import {InputFieldComponent} from '../../input-field.component';

@Component({
  selector: 'ame-description-input-field',
  templateUrl: './description-input-field.component.html',
  styles: [
    `
      textarea {
        line-height: 1.35;
      }
    `,
  ],
  imports: [MatFormFieldModule, MatTooltipModule, MatLabel, FormField, MatInput],
})
export class DescriptionInputFieldComponent extends InputFieldComponent<NamedElement> implements OnInit, OnDestroy {
  private readonly injector = inject(Injector);
  private readonly unregisterFields: Array<() => void> = [];

  readonly fields = signal<Record<string, FieldTree<string>>>({});
  public destroyRef = inject(DestroyRef);
  public metaModelDialogService = inject(EditorModelService);

  constructor() {
    super();
    this.fieldName = 'description';
  }

  ngOnInit(): void {
    this.getMetaModelData()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.setDescriptionControls();
      });
  }

  getCurrentValue(key: string, locale: string) {
    if (this.metaModelElement instanceof DefaultCharacteristic && this.metaModelElement.isPredefined) {
      return this.metaModelElement?.getDescription(locale) || '';
    }

    if (this.metaModelElement['extends_']) {
      return (
        this.previousData()?.[key] ||
        this.metaModelElement?.getDescription(locale) ||
        this.metaModelElement['extends_']?.getDescription(locale) ||
        ''
      );
    }

    return this.previousData()?.[key] || this.metaModelElement?.getDescription(locale) || '';
  }

  isInherited(locale: string): boolean {
    const extending = this.metaModelElement as HasExtends;
    return (
      extending.extends_ &&
      extending.getExtends()?.getDescription(locale) &&
      this.field(locale)?.().value() === extending.getExtends()?.getDescription(locale)
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
    return Array.from(this.metaModelElement?.descriptions?.keys() ?? []);
  }

  private isDisabled() {
    return this.metaModelElement instanceof DefaultProperty && !!this.metaModelElement?.extends_;
  }

  private setDescriptionControls() {
    this.unregisterFields.forEach(unregister => unregister());
    this.unregisterFields.length = 0;

    if (!this.metaModelElement) {
      return;
    }

    const allLocalesDescriptions = Array.from(this.metaModelElement?.descriptions?.keys() ?? []);

    if (!allLocalesDescriptions.length && this.metaModelElement?.descriptions) {
      this.metaModelElement.descriptions.set('en', '');
    }

    const fields: Record<string, FieldTree<string>> = {};
    Array.from(this.metaModelElement?.descriptions?.keys() ?? []).forEach(locale => {
      const key = `description${locale}`;
      const model = signal<string>(String(this.getCurrentValue(key, locale) || this.metaModelElement?.getDescription(locale) || ''));
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
