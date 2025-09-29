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
import {MxGraphHelper} from '@ame/mx-graph';
import {RdfModelUtil} from '@ame/rdf/utils';
import {DataTypeService} from '@ame/shared';
import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {FormControl, ReactiveFormsModule} from '@angular/forms';
import {MatFormField, MatInput, MatLabel} from '@angular/material/input';
import {DefaultRangeConstraint, DefaultTrait, NamedElement, Type} from '@esmf/aspect-model-loader';
import {InputFieldComponent} from '../../input-field.component';

@Component({
  selector: 'ame-max-value-input-field',
  templateUrl: './max-value-input-field.component.html',
  imports: [MatFormField, MatLabel, ReactiveFormsModule, MatInput],
})
export class MaxValueInputFieldComponent extends InputFieldComponent<DefaultRangeConstraint> implements OnInit, OnDestroy {
  private dataTypeService = inject(DataTypeService);

  public rangeConstraintDataType: Type;

  constructor() {
    super();
    this.resetFormOnDestroy = false;
    this.fieldName = 'maxValue';
  }

  getCurrentValue(key: string) {
    return this.previousData[key]?.[this.metaModelElement.className] || this.metaModelElement?.[key] || '';
  }

  ngOnInit() {
    this.getMetaModelData()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((modelElement: NamedElement) => {
        if (modelElement instanceof DefaultRangeConstraint) {
          this.metaModelElement = modelElement;
        }
        this.rangeConstraintDataType = this.getCharacteristicTypeForConstraint(modelElement.name);
        this.initForm();
      });
  }

  ngOnDestroy() {
    super.ngOnDestroy();

    this.parentForm.removeControl(this.fieldName);
  }

  getPlaceholder(rangeValueDataType: string): string {
    const dataType = this.dataTypeService.getDataType(rangeValueDataType);
    return dataType ? dataType.description : '';
  }

  initForm() {
    this.parentForm.setControl(
      this.fieldName,
      new FormControl({
        value: this.getCurrentValue(this.fieldName),
        disabled: this.loadedFiles.isElementExtern(this.metaModelElement),
      }),
    );
  }

  getValueWithoutUrnDefinition(value: any) {
    return RdfModelUtil.getValueWithoutUrnDefinition(value);
  }

  private getCharacteristicTypeForConstraint(id: string): Type {
    const edges = this.mxGraphService.getAllEdges(id);
    // constraint can only have trait as a source edge
    const types = edges?.map(edge => MxGraphHelper.getModelElement<DefaultTrait>(edge.source)?.getBaseCharacteristic()?.dataType) || [];

    if (types.length > 0) {
      // return type only if we have one kind of a type in list.
      // in case of only one type, return it.
      return types.reduce((t1, t2) => (t1.getUrn() === t2?.getUrn() || t2 === undefined ? t1 : null));
    }

    return null;
  }
}
