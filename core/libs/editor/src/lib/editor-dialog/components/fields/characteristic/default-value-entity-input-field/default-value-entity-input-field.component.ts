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

import {Component, OnDestroy, OnInit} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {FormControl, ReactiveFormsModule} from '@angular/forms';
import {MatAutocomplete, MatAutocompleteTrigger, MatOption} from '@angular/material/autocomplete';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInput, MatLabel} from '@angular/material/input';
import {DefaultEntityInstance, DefaultState, EntityInstance} from '@esmf/aspect-model-loader';
import {InputFieldComponent} from '../../input-field.component';

@Component({
  selector: 'ame-default-value-entity-input-field',
  templateUrl: './default-value-entity-input-field.component.html',
  imports: [MatFormFieldModule, MatLabel, ReactiveFormsModule, MatAutocomplete, MatOption, MatAutocompleteTrigger, MatInput],
})
export class DefaultValueEntityInputFieldComponent extends InputFieldComponent<DefaultState> implements OnInit, OnDestroy {
  entityValues: EntityInstance[];

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
    super.ngOnDestroy();
    this.parentForm.removeControl(this.fieldName);
  }

  initForm() {
    const defaultValue = this.getCurrentValue(this.fieldName);
    const defaultValueString = typeof defaultValue === 'string' ? defaultValue : defaultValue?.name;

    this.parentForm.setControl(
      this.fieldName,
      new FormControl({
        value: defaultValueString || this.metaModelElement?.defaultValue?.['name'] || '',
        disabled: this.loadedFiles.isElementExtern(this.metaModelElement),
      }),
    );

    const defaultValueControl = this.parentForm.get(this.fieldName);
    this.formSubscription.add(
      defaultValueControl.valueChanges.subscribe(value => {
        const entityValues = this.parentForm?.get('chipList')?.value;
        this.entityValues = entityValues?.filter(({name}: DefaultEntityInstance) => name.includes(value));
      }),
    );
  }
}
