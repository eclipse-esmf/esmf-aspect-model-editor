/*
 * Copyright (c) 2023 Robert Bosch Manufacturing Solutions GmbH
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
import {FormControl} from '@angular/forms';
import {DefaultDuration, DefaultUnit, Unit} from '@ame/meta-model';
import {EditorModelService} from '../../../../editor-model.service';
import {InputFieldComponent} from '../../input-field.component';
import {Observable} from 'rxjs';
import {MetaModelElementInstantiator, UnitInstantiator} from '@ame/instantiator';
import {NamespacesCacheService} from '@ame/cache';
import {ModelService} from '@ame/rdf/services';
import {SearchService} from '@ame/shared';
import {MatOptionSelectionChange} from '@angular/material/core';

declare const sammUDefinition: any;

@Component({
  selector: 'ame-reference-unit-input-field',
  templateUrl: './reference-unit-input-field.component.html',
})
export class ReferenceUnitInputFieldComponent extends InputFieldComponent<DefaultUnit> implements OnInit, OnDestroy {
  private unitInstantiator: UnitInstantiator;

  public filteredPredefinedUnits$: Observable<Array<any>>;
  public filteredUnits$: Observable<Array<DefaultUnit>>;
  public units: Array<Unit> = [];
  public unitDisplayControl: FormControl;
  public referenceUnitControl: FormControl;

  constructor(
    public metaModelDialogService: EditorModelService,
    public namespacesCacheService: NamespacesCacheService,
    public searchService: SearchService,
    private modelService: ModelService
  ) {
    super(metaModelDialogService, namespacesCacheService, searchService);
    this.unitInstantiator = new UnitInstantiator(
      new MetaModelElementInstantiator(this.modelService.getLoadedAspectModel().rdfModel, this.currentCachedFile)
    );
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
      disabled: !!referenceUnit || this.metaModelElement.isExternalReference(),
    });

    this.parentForm.setControl(
      'referenceUnit',
      new FormControl({
        value: this.metaModelElement?.referenceUnit,
        disabled: this.metaModelDialogService.isReadOnly() || this.metaModelElement?.isExternalReference(),
      })
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
      const newPredefinedUnit = this.unitInstantiator.getUnit(predefinedUnit?.name);
      this.referenceUnitControl.setValue(newPredefinedUnit);
      this.unitDisplayControl.patchValue(newPredefinedUnit.name);
      this.unitDisplayControl.disable();
    }
  }
}
