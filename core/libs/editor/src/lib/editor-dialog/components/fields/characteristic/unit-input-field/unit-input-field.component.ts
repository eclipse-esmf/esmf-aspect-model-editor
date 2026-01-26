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

import {AsyncPipe} from '@angular/common';
import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {FormControl, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatAutocomplete, MatAutocompleteTrigger} from '@angular/material/autocomplete';
import {MatIconButton} from '@angular/material/button';
import {MatOptgroup, MatOption, MatOptionSelectionChange} from '@angular/material/core';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatError, MatInput, MatLabel} from '@angular/material/input';
import {DefaultDuration, DefaultMeasurement, DefaultQuantifiable, DefaultUnit, Unit, useLoader} from '@esmf/aspect-model-loader';
import {TranslatePipe} from '@ngx-translate/core';
import {Observable} from 'rxjs';
import {EditorDialogValidators} from '../../../../validators';
import {InputFieldComponent} from '../../input-field.component';

declare const sammUDefinition: any;

@Component({
  selector: 'ame-unit-input-field',
  templateUrl: './unit-input-field.component.html',
  styleUrls: ['../../field.scss'],
  imports: [
    MatFormFieldModule,
    MatLabel,
    MatAutocompleteTrigger,
    ReactiveFormsModule,
    MatInput,
    MatIconModule,
    MatIconButton,
    MatError,
    MatAutocomplete,
    AsyncPipe,
    MatOptgroup,
    MatOption,
    TranslatePipe,
  ],
})
export class UnitInputFieldComponent
  extends InputFieldComponent<DefaultQuantifiable | DefaultDuration | DefaultMeasurement>
  implements OnInit, OnDestroy
{
  private editorDialogValidators = inject(EditorDialogValidators);

  unitRequired = false;

  filteredPredefinedUnits$: Observable<Array<any>>;
  filteredUnits$: Observable<Array<DefaultUnit>>;
  units: Array<Unit> = [];
  unitDisplayControl: FormControl;

  constructor() {
    super();
    this.fieldName = 'unit';
  }

  ngOnInit() {
    this.getMetaModelData()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(metaModelElement => {
        this.units = metaModelElement ? Object.keys(sammUDefinition.units).map(key => sammUDefinition.units[key]) : null;
        if (this.metaModelElement instanceof DefaultDuration) {
          this.units = this.units.filter(unit => unit.quantityKinds && unit.quantityKinds.includes('time'));
        }
        this.unitRequired = metaModelElement instanceof DefaultDuration || metaModelElement instanceof DefaultMeasurement;
        this.initUnitFormControl();
      });
  }

  ngOnDestroy() {
    super.ngOnDestroy();
    this.parentForm.removeControl(this.fieldName);
    this.parentForm.removeControl('changedUnit');
  }

  onPredefinedUnitChange(predefinedUnit: Unit, event: MatOptionSelectionChange) {
    if (predefinedUnit && event.isUserInput) {
      const {createUnit} = useLoader({
        rdfModel: this.loadedFiles.currentLoadedFile.rdfModel,
        cache: this.loadedFiles.currentLoadedFile.cachedFile,
      });

      const newPredefinedUnit = createUnit(predefinedUnit.name);
      this.parentForm.get('unit').setValue(newPredefinedUnit);
      this.unitDisplayControl.patchValue(newPredefinedUnit.name);
      this.unitDisplayControl.disable();
    }
  }

  onExistingUnitChange(existingUnit) {
    this.unitDisplayControl.patchValue(existingUnit.name);
    this.parentForm.get('unit').setValue(existingUnit);
    this.unitDisplayControl.disable();
  }

  initUnitFormControl() {
    const unit = this.getCurrentValue(this.fieldName);
    const unitName = unit instanceof DefaultUnit ? unit.name : unit;
    this.unitDisplayControl = new FormControl(
      {value: unitName, disabled: !!unit},
      {
        validators: [...(this.unitRequired ? [Validators.required] : [])],
        asyncValidators: [this.editorDialogValidators.duplicateNameWithDifferentType(this.metaModelElement, DefaultUnit)],
      },
    );

    this.parentForm.setControl(
      this.fieldName,
      new FormControl(
        {
          value: unit,
          disabled: this.loadedFiles.isElementExtern(this.metaModelElement),
        },
        this.unitRequired ? Validators.required : null,
      ),
    );

    this.parentForm.setControl('changedUnit', new FormControl(this.getPredefinedUnit(unitName) || unit));
    this.filteredUnits$ = this.initFilteredUnits(this.unitDisplayControl, this.searchService);
    this.filteredPredefinedUnits$ = this.initFilteredPredefinedUnits(this.unitDisplayControl, this.units, this.searchService);
  }

  createNewUnit(unitName: string) {
    const urn = `${this.metaModelElement.aspectModelUrn.split('#')?.[0]}#${unitName}`;
    const newUnit = new DefaultUnit({
      metaModelVersion: this.metaModelElement.metaModelVersion,
      aspectModelUrn: urn,
      name: unitName,
      quantityKinds: [],
    });

    // set the control of newDatatype
    this.unitDisplayControl.patchValue(unitName);
    this.parentForm.get('unit').setValue(newUnit);
    this.unitDisplayControl.disable();
  }

  unlockUnit() {
    this.unitDisplayControl.enable();
    this.unitDisplayControl.patchValue('');
    this.parentForm.get('unit').setValue(null);
    this.parentForm.get('unit').markAllAsTouched();
  }

  getPredefinedUnit(unitName: string) {
    const {createUnit} = useLoader({
      rdfModel: this.loadedFiles.currentLoadedFile.rdfModel,
      cache: this.loadedFiles.currentLoadedFile.cachedFile,
    });

    return createUnit(unitName);
  }
}
