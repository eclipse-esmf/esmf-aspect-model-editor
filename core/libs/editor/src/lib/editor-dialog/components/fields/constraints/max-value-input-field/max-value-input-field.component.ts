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
import {MaxGraphHelper} from '@ame/max-graph';
import {RdfModelUtil} from '@ame/rdf/utils';
import {DataTypeService} from '@ame/shared';
import {Component, inject, OnDestroy, OnInit, signal} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {disabled, form, FormField} from '@angular/forms/signals';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInput, MatLabel} from '@angular/material/input';
import {DefaultRangeConstraint, DefaultTrait, NamedElement, Type} from '@esmf/aspect-model-loader';
import {InputFieldComponent} from '../../input-field.component';

@Component({
  selector: 'ame-max-value-input-field',
  templateUrl: './max-value-input-field.component.html',
  imports: [MatFormFieldModule, MatLabel, FormField, MatInput],
})
export class MaxValueInputFieldComponent extends InputFieldComponent<DefaultRangeConstraint> implements OnInit, OnDestroy {
  private dataTypeService = inject(DataTypeService);
  private readonly model = signal('');
  private unregisterField = () => undefined;

  readonly field = form(this.model, path =>
    disabled(path, {when: () => !!this.metaModelElement && this.loadedFiles.isElementExtern(this.metaModelElement)}),
  );

  public rangeConstraintDataType = signal<Type>(null);

  constructor() {
    super();
    this.resetFormOnDestroy = false;
    this.fieldName = 'maxValue';
  }

  getCurrentValue(key: string) {
    return this.previousData()[key]?.[this.metaModelElement.className] || this.metaModelElement?.[key] || '';
  }

  ngOnInit() {
    this.getMetaModelData()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((modelElement: NamedElement) => {
        if (modelElement instanceof DefaultRangeConstraint) {
          this.metaModelElement = modelElement;
        }
        this.rangeConstraintDataType.set(this.getCharacteristicTypeForConstraint(modelElement.name));
        this.initForm();
      });
  }

  ngOnDestroy() {
    this.unregisterField();
    super.ngOnDestroy();
  }

  getPlaceholder(rangeValueDataType: string): string {
    const dataType = this.dataTypeService.getDataType(rangeValueDataType);
    return dataType ? dataType.description : '';
  }

  initForm() {
    this.model.set(this.getCurrentValue(this.fieldName));
    this.unregisterField = this.signalForm().register(this.fieldName, this.field);
  }

  getValueWithoutUrnDefinition(value: string) {
    return RdfModelUtil.getValueWithoutUrnDefinition(value);
  }

  private getCharacteristicTypeForConstraint(id: string): Type {
    const edges = this.maxgraphService.getAllEdges(id);
    // constraint can only have trait as a source edge
    const types = edges?.map(edge => MaxGraphHelper.getModelElement<DefaultTrait>(edge.source)?.getBaseCharacteristic()?.dataType) || [];

    if (types.length > 0) {
      // return type only if we have one kind of a type in list.
      // in case of only one type, return it.
      return types.reduce((t1, t2) => (t1.getUrn() === t2?.getUrn() || t2 === undefined ? t1 : null));
    }

    return null;
  }
}
