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

import {ModelService} from '@ame/rdf/services';
import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormControl} from '@angular/forms';
import {MatOptionSelectionChange} from '@angular/material/core';
import {DefaultDuration, DefaultUnit, Unit} from '@esmf/aspect-model-loader';
import {Observable} from 'rxjs';
import {InputFieldComponent} from '../../input-field.component';

declare const sammUDefinition: any;

@Component({
  selector: 'ame-reference-unit-input-field',
  templateUrl: './reference-unit-input-field.component.html',
})
export class ReferenceUnitInputFieldComponent extends InputFieldComponent<DefaultUnit> implements OnInit, OnDestroy {
  public filteredPredefinedUnits$: Observable<Array<any>>;
  public filteredUnits$: Observable<Array<DefaultUnit>>;
  public units: Array<Unit> = [];
  public unitDisplayControl: FormControl;
  public referenceUnitControl: FormControl;

  constructor(private modelService: ModelService) {
    super();
    // this.unitInstantiator = new UnitInstantiator(
    //   new MetaModelElementInstantiator(this.modelService.currentRdfModel, this.currentCachedFile),
    // );
  }

  ngOnInit(): void {
    this.subscription = this.getMetaModelData().subscribe(metaModelElement => {
      this.units = metaModelElement ? Object.keys(sammUDefinition.units).map(key => sammUDefinition.units[key]) : null;
      if (this.metaModelElement instanceof DefaultDuration) {
        this.units = this.units.filter(unit => unit.quantityKinds && unit.quantityKinds.includes('time'));
      }
      this.initReferenceUnitControl();
    });
  }

  ngOnDestroy() {
    super.ngOnDestroy();
    this.parentForm.removeControl('referenceUnit');
  }

  initReferenceUnitControl() {
    const referenceUnit = this.metaModelElement?.referenceUnit;

    this.unitDisplayControl = new FormControl({
      value: referenceUnit?.name,
      disabled: !!referenceUnit || this.loadedFiles.isElementExtern(this.metaModelElement),
    });

    this.parentForm.setControl(
      'referenceUnit',
      new FormControl({
        value: this.metaModelElement?.referenceUnit,
        disabled: this.metaModelDialogService.isReadOnly() || this.loadedFiles.isElementExtern(this.metaModelElement),
      }),
    );

    this.referenceUnitControl = this.parentForm.get('referenceUnit') as FormControl;

    this.filteredUnits$ = this.initFilteredUnits(this.unitDisplayControl, this.searchService);
    this.filteredPredefinedUnits$ = this.initFilteredPredefinedUnits(this.unitDisplayControl, this.units, this.searchService);
  }

  unlockUnit() {
    this.unitDisplayControl.enable();
    this.unitDisplayControl.patchValue('');
    this.parentForm.setControl('referenceUnit', new FormControl(null));
    this.referenceUnitControl.markAllAsTouched();
  }

  onPredefinedUnitChange(predefinedUnit: Unit, event: MatOptionSelectionChange) {
    if (predefinedUnit && event.isUserInput) {
      // TODO call a predefined unit function to create the unit
      // const newPredefinedUnit = this.unitInstantiator.getUnit(predefinedUnit?.name);
      // this.referenceUnitControl.setValue(newPredefinedUnit);
      // this.unitDisplayControl.patchValue(newPredefinedUnit.name);
      this.unitDisplayControl.disable();
    }
  }
}
