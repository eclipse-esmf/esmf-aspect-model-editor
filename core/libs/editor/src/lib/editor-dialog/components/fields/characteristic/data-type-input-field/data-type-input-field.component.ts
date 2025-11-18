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

import {MxGraphHelper, MxGraphService} from '@ame/mx-graph';
import {RdfService} from '@ame/rdf/services';
import {RdfModelUtil} from '@ame/rdf/utils';
import {config, DataTypeService} from '@ame/shared';
import {AsyncPipe} from '@angular/common';
import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {FormControl, ReactiveFormsModule} from '@angular/forms';
import {MatAutocomplete, MatAutocompleteTrigger} from '@angular/material/autocomplete';
import {MatIconButton} from '@angular/material/button';
import {MatOptgroup, MatOption, MatOptionSelectionChange} from '@angular/material/core';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatError, MatInputModule, MatLabel} from '@angular/material/input';
import {
  DefaultCharacteristic,
  DefaultEither,
  DefaultEntity,
  DefaultScalar,
  DefaultStructuredValue,
  Entity,
  Type,
} from '@esmf/aspect-model-loader';
import {Observable} from 'rxjs';
import {map, startWith} from 'rxjs/operators';
import {EditorDialogValidators} from '../../../../validators';
import {InputFieldComponent} from '../../input-field.component';

@Component({
  selector: 'ame-data-type-input-field',
  templateUrl: './data-type-input-field.component.html',
  styleUrls: ['./data-type-input-field.component.scss', '../../field.scss'],
  imports: [
    MatFormFieldModule,
    MatLabel,
    MatAutocompleteTrigger,
    ReactiveFormsModule,
    MatInputModule,
    MatIconButton,
    MatIconModule,
    MatError,
    MatAutocomplete,
    AsyncPipe,
    MatOptgroup,
    MatOption,
  ],
})
export class DataTypeInputFieldComponent extends InputFieldComponent<DefaultCharacteristic> implements OnInit, OnDestroy {
  private editorDialogValidators = inject(EditorDialogValidators);

  public dataTypeService = inject(DataTypeService);
  public mxGraphService = inject(MxGraphService);
  public rdfService = inject(RdfService);

  public filteredDataTypes$: Observable<any[]>;
  public filteredEntityTypes$: Observable<any[]>;

  public dataTypeControl: FormControl;
  public dataTypeEntityControl: FormControl;
  public elementCharacteristicControl: FormControl;
  public elementCharacteristicDisplayControl: FormControl;

  public entitiesDisabled = false;

  public isDisabled = false;

  constructor() {
    super();
    this.fieldName = 'dataTypeEntity';
  }

  ngOnInit(): void {
    this.getMetaModelData()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.setDataTypeControl();
        this.entitiesDisabled = this.metaModelElement instanceof DefaultStructuredValue || this.hasStructuredValueAsGrandParent();
      });

    this.enableWhenEmpty(() => this.dataTypeControl, 'elementCharacteristic');
  }

  ngOnDestroy() {
    super.ngOnDestroy();
    this.parentForm.removeControl('dataType');
  }

  getCurrentValue() {
    return !this.metaModelElement.isPredefined
      ? (this.previousData?.['dataType'] ??
          this.previousData?.['newDataType'] ??
          this.previousData?.[this.fieldName] ??
          this.metaModelElement?.dataType)
      : this.metaModelElement?.dataType;
  }

  setDataTypeControl() {
    if (this.metaModelElement instanceof DefaultEither) {
      return;
    }

    const dataType = this.getCurrentValue();
    const value = dataType ? RdfModelUtil.getValueWithoutUrnDefinition(dataType?.getUrn()) : null;

    this.parentForm.setControl(
      'dataType',
      new FormControl(
        {
          value,
          disabled: !!value || this.loadedFiles.isElementExtern(this.metaModelElement) || this.isDisabled,
        },
        [this.editorDialogValidators.duplicateNameWithDifferentType(this.metaModelElement, DefaultEntity)],
      ),
    );
    this.getControl('dataType').markAsTouched();
    this.parentForm.setControl(
      'dataTypeEntity',
      new FormControl({
        value: dataType,
        disabled: this.loadedFiles.isElementExtern(this.metaModelElement),
      }),
    );
    this.dataTypeControl = this.parentForm.get('dataType') as FormControl;
    this.dataTypeEntityControl = this.parentForm.get('dataTypeEntity') as FormControl;

    this.initFilteredDataTypes();
    this.filteredEntityTypes$ = this.initFilteredEntities(this.dataTypeControl, this.entitiesDisabled);
  }

  onSelectionChange(fieldPath: string, newValue: Type, event: MatOptionSelectionChange) {
    if (fieldPath !== 'dataType' || !event.isUserInput) {
      return;
    }

    if (newValue === null) {
      return; // happens on reset form
    }

    if (newValue.isComplexType()) {
      let entity = this.currentCachedFile.get(newValue.urn);

      if (!entity) {
        entity = this.loadedFiles.findElementOnExtReferences<Entity>(newValue.urn);
      }
    }

    this.parentForm.get('dataTypeEntity').setValue(newValue);
    this.dataTypeControl.patchValue(newValue.name);
    this.dataTypeControl.disable();
  }

  createNewEntity(entityName: string) {
    if (!this.isUpperCase(entityName)) {
      return;
    }

    const urn = `${this.metaModelElement.aspectModelUrn.split('#')?.[0]}#${entityName}`;
    const newEntity = new DefaultEntity({metaModelVersion: this.metaModelElement.metaModelVersion, aspectModelUrn: urn, name: entityName});

    // set the control of newDatatype
    const newDataTypeControl = this.parentForm.get('newDataType');
    if (newDataTypeControl) {
      newDataTypeControl.setValue(newEntity);
    } else {
      this.parentForm.setControl('newDataType', new FormControl(newEntity));
    }

    this.dataTypeControl.patchValue(entityName);
    this.dataTypeEntityControl.setValue(newEntity);
    this.dataTypeControl.disable();
  }

  unlockDataType() {
    this.dataTypeControl.enable();
    this.dataTypeControl.patchValue('');
    this.parentForm.get(this.fieldName).patchValue('');
    this.parentForm.get('newDataType')?.setValue(null);
    this.dataTypeEntityControl.markAllAsTouched();
  }

  private initFilteredDataTypes() {
    const types = Object.keys(this.dataTypeService.getDataTypes()).map(key => {
      const type = this.dataTypeService.getDataType(key);
      return new DefaultScalar({
        urn: type.isDefinedBy,
        descriptions: new Map([['en', type.description || '']]),
        metaModelVersion: config.currentSammVersion,
      });
    });

    this.filteredDataTypes$ = this.dataTypeControl?.valueChanges.pipe(
      map((value: string) => (value ? types.filter(type => this.inSearchList(type, value)) : types)),
      startWith(types),
    );
  }

  private hasStructuredValueAsGrandParent() {
    const cell = this.mxGraphService.resolveCellByModelElement(this.metaModelElement);
    return this.mxGraphService.graph
      .getIncomingEdges(cell)
      .some(firstEdge =>
        this.mxGraphService.graph
          .getIncomingEdges(firstEdge.source)
          .some(secondEdge => MxGraphHelper.getModelElement(secondEdge.source) instanceof DefaultStructuredValue),
      );
  }
}
