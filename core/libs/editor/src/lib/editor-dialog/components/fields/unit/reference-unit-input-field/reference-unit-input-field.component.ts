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

import {unitSearchOption} from '@ame/shared';
import {Component, computed, OnDestroy, OnInit, signal} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {disabled, form, FormField} from '@angular/forms/signals';
import {MatAutocomplete, MatAutocompleteTrigger} from '@angular/material/autocomplete';
import {MatIconButton} from '@angular/material/button';
import {MatOptgroup, MatOption, MatOptionSelectionChange} from '@angular/material/core';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatInput, MatLabel} from '@angular/material/input';
import {DefaultDuration, DefaultUnit, Unit} from '@esmf/aspect-model-loader';
import {InputFieldComponent} from '../../input-field.component';

declare const sammUDefinition: any;

@Component({
  selector: 'ame-reference-unit-input-field',
  templateUrl: './reference-unit-input-field.component.html',
  imports: [
    MatFormFieldModule,
    MatLabel,
    MatAutocompleteTrigger,
    FormField,
    MatInput,
    MatIconButton,
    MatIconModule,
    MatAutocomplete,
    MatOptgroup,
    MatOption,
  ],
})
export class ReferenceUnitInputFieldComponent extends InputFieldComponent<DefaultUnit> implements OnInit, OnDestroy {
  private readonly displayModel = signal('');
  private readonly referenceUnitModel = signal<Unit | null>(null);
  private readonly locked = signal(false);
  private unregisterField = () => undefined;

  readonly displayField = form(this.displayModel, path =>
    disabled(path, {
      when: () => this.locked() || (!!this.metaModelElement && this.loadedFiles.isElementExtern(this.metaModelElement)),
    }),
  );
  readonly filteredPredefinedUnits = computed(() => {
    const value = this.displayModel();
    return value ? this.searchService.search<Unit>(value, this.units, unitSearchOption) : this.units;
  });
  public units: Array<Unit> = [];

  ngOnInit(): void {
    this.getMetaModelData()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(metaModelElement => {
        this.units = metaModelElement ? Object.keys(sammUDefinition.units).map(key => sammUDefinition.units[key]) : null;
        if (this.metaModelElement instanceof DefaultDuration) {
          this.units = this.units.filter(unit => unit.quantityKinds && unit.quantityKinds.includes('time'));
        }
        this.initReferenceUnitControl();
      });
  }

  ngOnDestroy() {
    this.unregisterField();
    this.signalForm().remove('referenceUnit');
    super.ngOnDestroy();
  }

  initReferenceUnitControl() {
    const referenceUnit = this.metaModelElement?.referenceUnit;

    this.displayModel.set(referenceUnit?.name || '');
    this.referenceUnitModel.set(referenceUnit || null);
    this.locked.set(!!referenceUnit);
    this.unregisterField = this.signalForm().register('referenceUnitDisplay', this.displayField);
    this.signalForm().set('referenceUnit', referenceUnit || null);
  }

  unlockUnit() {
    this.locked.set(false);
    this.displayModel.set('');
    this.referenceUnitModel.set(null);
    this.signalForm().set('referenceUnit', null);
    this.displayField().markAsTouched();
  }

  onPredefinedUnitChange(predefinedUnit: Unit, event: MatOptionSelectionChange) {
    if (predefinedUnit && event.isUserInput) {
      // TODO call a predefined unit function to create the unit
      // const newPredefinedUnit = this.unitInstantiator.getUnit(predefinedUnit?.name);
      // this.referenceUnitControl.setValue(newPredefinedUnit);
      // this.unitDisplayControl.patchValue(newPredefinedUnit.name);
      this.displayModel.set(predefinedUnit.name);
      this.locked.set(true);
    }
  }
}
