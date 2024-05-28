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
import {InputFieldComponent} from '../../input-field.component';
import {DefaultOperation, DefaultProperty, Property} from '@ame/meta-model';
import {FormControl} from '@angular/forms';
import {Observable} from 'rxjs';
import {EditorDialogValidators} from '../../../../validators';
import {RdfService} from '@ame/rdf/services';

@Component({
  selector: 'ame-output-input-field',
  templateUrl: './output-input-field.component.html',
  styleUrls: ['../../field.scss'],
})
export class OutputInputFieldComponent extends InputFieldComponent<DefaultOperation> implements OnInit, OnDestroy {
  filteredPropertyTypes$: Observable<any[]>;

  outputControl: FormControl;
  newPropertyControl: FormControl;

  constructor(
    public rdfService: RdfService,
    private validators: EditorDialogValidators,
  ) {
    super();
  }

  ngOnInit(): void {
    this.subscription = this.getMetaModelData().subscribe(() => this.setOutputControl());
  }

  ngOnDestroy() {
    super.ngOnDestroy();
    this.parentForm.removeControl('output');
  }

  setOutputControl() {
    const property = this.metaModelElement?.output?.property;
    const value = property?.name ? property?.name : '';

    this.parentForm.setControl(
      'output',
      new FormControl(
        {
          value,
          disabled: !!value || this.metaModelElement.isExternalReference(),
        },
        [this.validators.duplicateNameWithDifferentType(this.metaModelElement, DefaultProperty)],
      ),
    );
    this.getControl('output').markAsTouched();

    this.parentForm.setControl(
      'outputValue',
      new FormControl({
        value: property,
        disabled: this.metaModelElement?.isExternalReference(),
      }),
    );

    this.outputControl = this.parentForm.get('output') as FormControl;
    this.newPropertyControl = this.parentForm.get('outputValue') as FormControl;

    this.filteredPropertyTypes$ = this.initFilteredPropertyTypes(this.outputControl);
  }

  onSelectionChange(fieldPath: string, newValue: any) {
    if (fieldPath !== 'output') {
      return;
    }

    if (newValue === null) {
      return; // happens on reset form
    }

    let property = this.currentCachedFile.getCachedProperties().find(property => property.aspectModelUrn === newValue.urn);

    if (!property) {
      property = this.namespacesCacheService.findElementOnExtReference<Property>(newValue.urn);
    }

    this.parentForm.setControl('outputValue', new FormControl(property));

    this.outputControl.patchValue(newValue.name);
    this.newPropertyControl.setValue(property);
    this.outputControl.disable();
  }

  createNewProperty(propertyName: string) {
    if (!this.isLowerCase(propertyName)) {
      return;
    }

    const urn = `${this.metaModelElement.aspectModelUrn.split('#')?.[0]}#${propertyName}`;
    const newProperty = new DefaultProperty(this.metaModelElement.metaModelVersion, urn, propertyName, null);
    this.parentForm.setControl('outputValue', new FormControl(newProperty));

    this.outputControl.patchValue(propertyName);
    this.newPropertyControl.setValue(newProperty);
    this.outputControl.disable();
  }

  unlockOutput() {
    this.outputControl.enable();
    this.outputControl.patchValue('');
    this.newPropertyControl.patchValue('');
    this.parentForm.setControl('outputValue', new FormControl(null));
    this.newPropertyControl.markAllAsTouched();
  }
}
