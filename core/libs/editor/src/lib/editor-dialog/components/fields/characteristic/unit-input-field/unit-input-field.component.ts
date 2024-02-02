/*
 * Copyright (c) 2024 Robert Bosch Manufacturing Solutions GmbH
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
import {MetaModelElementInstantiator, UnitInstantiator} from '@ame/instantiator';
import {MatOptionSelectionChange} from '@angular/material/core';
import {FormControl, Validators} from '@angular/forms';
import {DefaultDuration, DefaultMeasurement, DefaultQuantifiable, DefaultUnit, Unit} from '@ame/meta-model';
import {ModelService, RdfService} from '@ame/rdf/services';
import {Observable} from 'rxjs';
import {InputFieldComponent} from '../../input-field.component';
import {EditorDialogValidators} from '../../../../validators';

declare const sammUDefinition: any;

@Component({
  selector: 'ame-unit-input-field',
  templateUrl: './unit-input-field.component.html',
  styleUrls: ['../../field.scss'],
})
export class UnitInputFieldComponent
  extends InputFieldComponent<DefaultQuantifiable | DefaultDuration | DefaultMeasurement>
  implements OnInit, OnDestroy
{
  unitRequired = false;

  filteredPredefinedUnits$: Observable<Array<any>>;
  filteredUnits$: Observable<Array<DefaultUnit>>;
  units: Array<Unit> = [];
  unitDisplayControl: FormControl;
  private unitInstantiator: UnitInstantiator;

  constructor(private modelService: ModelService, private rdfService: RdfService) {
    super();
    this.unitInstantiator = new UnitInstantiator(
      new MetaModelElementInstantiator(this.modelService.getLoadedAspectModel().rdfModel, this.currentCachedFile)
    );
    this.fieldName = 'unit';
  }

  ngOnInit() {
    this.subscription = this.getMetaModelData().subscribe(metaModelElement => {
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
      const newPredefinedUnit = this.unitInstantiator.getUnit(predefinedUnit?.name);
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
    this.unitDisplayControl = new FormControl({value: unitName, disabled: !!unit}, [
      EditorDialogValidators.duplicateNameWithDifferentType(
        this.namespacesCacheService,
        this.metaModelElement,
        this.rdfService,
        DefaultUnit
      ),
      ...(this.unitRequired ? [Validators.required] : []),
    ]);

    this.parentForm.setControl(
      this.fieldName,
      new FormControl(
        {
          value: unit,
          disabled: this.metaModelElement?.isExternalReference(),
        },
        this.unitRequired ? Validators.required : null
      )
    );

    this.parentForm.setControl('changedUnit', new FormControl(this.getPredefinedUnit(unitName) || unit));
    this.filteredUnits$ = this.initFilteredUnits(this.unitDisplayControl, this.searchService);
    this.filteredPredefinedUnits$ = this.initFilteredPredefinedUnits(this.unitDisplayControl, this.units, this.searchService);
  }

  createNewUnit(unitName: string) {
    const urn = `${this.metaModelElement.aspectModelUrn.split('#')?.[0]}#${unitName}`;
    const newUnit = new DefaultUnit(this.metaModelElement.metaModelVersion, urn, unitName);

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
    return this.unitInstantiator.createPredefinedUnit(unitName);
  }
}
