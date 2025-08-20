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
import {RdfModelUtil} from '@ame/rdf/utils';
import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormControl, Validators} from '@angular/forms';
import {DefaultEncodingConstraint, NamedElement, Samm} from '@esmf/aspect-model-loader';
import {InputFieldComponent} from '../../input-field.component';

@Component({
  selector: 'ame-encoding-input-field',
  templateUrl: './encoding-input-field.component.html',
})
export class EncodingInputFieldComponent extends InputFieldComponent<DefaultEncodingConstraint> implements OnInit, OnDestroy {
  public encodingList = [];

  constructor() {
    super();
    this.resetFormOnDestroy = false;
    this.fieldName = 'value';
  }

  getCurrentValue(key: string) {
    return this.previousData[key]?.[this.metaModelElement.className] || this.metaModelElement?.[key] || '';
  }

  ngOnInit() {
    this.subscription = this.getMetaModelData().subscribe((modelElement: NamedElement) => {
      this.encodingList = modelElement ? new Samm(modelElement.metaModelVersion).getEncodingList() : null;
      if (modelElement instanceof DefaultEncodingConstraint) {
        this.metaModelElement = modelElement;
      }
      if (!this.metaModelElement.value) {
        this.metaModelElement.value = this.encodingList[0].value;
      }
      this.initForm();
    });
  }

  ngOnDestroy() {
    super.ngOnDestroy();
    this.parentForm.removeControl(this.fieldName);
  }

  initForm() {
    this.parentForm.setControl(
      this.fieldName,
      new FormControl(
        {
          value: RdfModelUtil.getValueWithoutUrnDefinition(this.getCurrentValue(this.fieldName)),
          disabled: this.loadedFiles.isElementExtern(this.metaModelElement),
        },
        Validators.required,
      ),
    );
  }
}
