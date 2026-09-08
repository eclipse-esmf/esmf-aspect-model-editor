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

import {Component, computed, OnDestroy, OnInit, signal} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {disabled, form, FormField} from '@angular/forms/signals';
import {MatAutocomplete, MatAutocompleteTrigger, MatOption} from '@angular/material/autocomplete';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInput, MatLabel} from '@angular/material/input';
import {DefaultState, EntityInstance} from '@esmf/aspect-model-loader';
import {InputFieldComponent} from '../../input-field.component';

@Component({
  selector: 'ame-default-value-entity-input-field',
  templateUrl: './default-value-entity-input-field.component.html',
  imports: [MatFormFieldModule, MatLabel, FormField, MatAutocomplete, MatOption, MatAutocompleteTrigger, MatInput],
})
export class DefaultValueEntityInputFieldComponent extends InputFieldComponent<DefaultState> implements OnInit, OnDestroy {
  private readonly model = signal('');
  private readonly blocked = signal(false);
  private unregisterField = () => undefined;

  readonly field = form(this.model, path => disabled(path, {when: this.blocked}));
  readonly entityValues = computed<EntityInstance[]>(() => {
    const value = this.model();
    const entityValues = (this.signalForm()?.value().chipList as EntityInstance[]) || [];
    return entityValues.filter(({name}) => !!name?.includes(value));
  });

  constructor() {
    super();
    this.fieldName = 'defaultValue';
  }

  ngOnInit() {
    this.getMetaModelData()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.initForm());
  }

  ngOnDestroy() {
    this.unregisterField();
    super.ngOnDestroy();
  }

  initForm() {
    const defaultValue = this.getCurrentValue(this.fieldName);
    const defaultValueString = typeof defaultValue === 'string' ? defaultValue : defaultValue?.name;

    this.blocked.set(this.loadedFiles.isElementExtern(this.metaModelElement));
    this.model.set(defaultValueString || this.metaModelElement?.defaultValue?.['name'] || '');
    this.unregisterField = this.signalForm().register(this.fieldName, this.field);
  }
}
