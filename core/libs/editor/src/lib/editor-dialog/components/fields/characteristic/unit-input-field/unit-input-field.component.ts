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

import {Component, computed, inject, OnDestroy, OnInit, signal, Signal} from '@angular/core';
import {rxResource, takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {disabled, form, FormField, required, validateAsync} from '@angular/forms/signals';
import {MatAutocomplete, MatAutocompleteTrigger} from '@angular/material/autocomplete';
import {MatIconButton} from '@angular/material/button';
import {MatOptgroup, MatOption, MatOptionSelectionChange} from '@angular/material/core';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatError, MatInput, MatLabel} from '@angular/material/input';
import {DefaultDuration, DefaultMeasurement, DefaultQuantifiable, DefaultUnit, Unit, useLoader} from '@esmf/aspect-model-loader';
import {TranslocoDirective} from '@jsverse/transloco';
import {of} from 'rxjs';
import {EditorDialogValidators} from '../../../../validators';
import {InputFieldComponent} from '../../input-field.component';

declare const sammUDefinition: {units: Record<string, Unit>};

@Component({
  selector: 'ame-unit-input-field',
  templateUrl: './unit-input-field.component.html',
  styleUrls: ['../../field.scss'],
  imports: [
    MatFormFieldModule,
    MatLabel,
    MatAutocompleteTrigger,
    FormField,
    MatInput,
    MatIconModule,
    MatIconButton,
    MatError,
    MatAutocomplete,
    MatOptgroup,
    MatOption,
    TranslocoDirective,
  ],
})
export class UnitInputFieldComponent
  extends InputFieldComponent<DefaultQuantifiable | DefaultDuration | DefaultMeasurement>
  implements OnInit, OnDestroy
{
  private editorDialogValidators = inject(EditorDialogValidators);

  unitRequired = signal(false);
  units: Array<Unit> = [];
  private readonly displayModel = signal('');
  private readonly unitModel = signal<Unit | null>(null);
  private readonly changedUnitModel = signal<Unit | null>(null);
  private readonly locked = signal(false);
  private readonly blocked = signal(false);
  private unregisterDisplay = () => undefined;

  private readonly createDuplicateNameResource = (name: Signal<string>) =>
    rxResource({
      params: () => name(),
      stream: ({params}) =>
        this.metaModelElement
          ? this.editorDialogValidators.duplicateNameWithDifferentTypeValue(params, this.metaModelElement, DefaultUnit)
          : of(null),
    });

  readonly displayField = form(this.displayModel, path => {
    required(path, {when: () => this.unitRequired()});
    validateAsync(path, {
      params: ({value}) => value(),
      factory: this.createDuplicateNameResource,
      onSuccess: result => {
        const kind = result?.['checkShapeNameExtRef'] ? 'checkShapeNameExtRef' : result?.['checkShapeName'] ? 'checkShapeName' : undefined;
        return kind ? {kind, message: 'Unit name is already used by another type'} : null;
      },
      onError: () => ({kind: 'duplicateNameValidation', message: 'Unit name could not be validated'}),
    });
    disabled(path, {when: () => this.locked() || this.blocked()});
  });
  readonly displayValue = this.displayModel.asReadonly();
  readonly filteredUnits = computed(() => {
    const value = this.displayModel();
    const units = this.currentCachedFile.filter<DefaultUnit>(element => element instanceof DefaultUnit);
    return units.filter(unit => this.inSearchList(unit, value));
  });
  readonly filteredPredefinedUnits = computed(() => {
    const value = this.displayModel();
    return (this.units || []).filter(unit => this.inSearchList(unit, value));
  });

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
        this.unitRequired.set(metaModelElement instanceof DefaultDuration || metaModelElement instanceof DefaultMeasurement);
        this.initUnitFormControl();
      });
  }

  ngOnDestroy() {
    this.unregisterDisplay();
    this.signalForm().remove('unit');
    this.signalForm().remove('changedUnit');
    super.ngOnDestroy();
  }

  onPredefinedUnitChange(predefinedUnit: Unit, event: MatOptionSelectionChange) {
    if (predefinedUnit && event.isUserInput) {
      const {createUnit} = useLoader({
        rdfModel: this.loadedFiles.currentLoadedFile.rdfModel,
        cache: this.loadedFiles.currentLoadedFile.cachedFile,
      });

      const newPredefinedUnit = createUnit(predefinedUnit.name);
      this.selectUnit(newPredefinedUnit);
    }
  }

  onExistingUnitChange(existingUnit: Unit) {
    this.selectUnit(existingUnit);
  }

  initUnitFormControl() {
    const unit = this.getCurrentValue(this.fieldName);
    const unitName = unit instanceof DefaultUnit ? unit.name : unit;
    this.blocked.set(this.loadedFiles.isElementExtern(this.metaModelElement));
    this.locked.set(!!unit);
    this.displayModel.set(unitName || '');
    this.unitModel.set(unit || null);
    const changedUnit = (unitName && this.getPredefinedUnit(unitName)) || unit || null;
    this.changedUnitModel.set(changedUnit);
    this.unregisterDisplay = this.signalForm().register('unitDisplay', this.displayField);
    this.signalForm().set(this.fieldName, unit || null);
    this.signalForm().set('changedUnit', changedUnit);
  }

  createNewUnit(unitName: string) {
    const urn = `${this.metaModelElement.aspectModelUrn.split('#')?.[0]}#${unitName}`;
    const newUnit = new DefaultUnit({
      metaModelVersion: this.metaModelElement.metaModelVersion,
      aspectModelUrn: urn,
      name: unitName,
      quantityKinds: [],
    });

    this.selectUnit(newUnit);
  }

  unlockUnit() {
    this.locked.set(false);
    this.displayModel.set('');
    this.unitModel.set(null);
    this.changedUnitModel.set(null);
    this.signalForm().set('unit', null);
    this.signalForm().set('changedUnit', null);
    this.displayField().markAsTouched();
  }

  getPredefinedUnit(unitName: string) {
    const {createUnit} = useLoader({
      rdfModel: this.loadedFiles.currentLoadedFile.rdfModel,
      cache: this.loadedFiles.currentLoadedFile.cachedFile,
    });

    return createUnit(unitName);
  }

  hasError(kind: string): boolean {
    return this.displayField()
      .errors()
      .some(error => error.kind === kind);
  }

  private selectUnit(unit: Unit): void {
    this.displayModel.set(unit.name);
    this.unitModel.set(unit);
    this.changedUnitModel.set(unit);
    this.signalForm().set('unit', unit);
    this.signalForm().set('changedUnit', unit);
    this.locked.set(true);
  }
}
