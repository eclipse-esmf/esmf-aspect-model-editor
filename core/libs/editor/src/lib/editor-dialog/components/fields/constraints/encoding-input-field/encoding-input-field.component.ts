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
import {FormControl, Validators} from '@angular/forms';
import {BaseMetaModelElement, DefaultEncodingConstraint} from '@ame/meta-model';
import {InputFieldComponent} from '../../input-field.component';
import {EditorModelService} from '../../../../editor-model.service';
import {Samm} from '@ame/vocabulary';
import {RdfModelUtil} from '@ame/rdf/utils';

@Component({
  selector: 'ame-encoding-input-field',
  templateUrl: './encoding-input-field.component.html',
})
export class EncodingInputFieldComponent extends InputFieldComponent<DefaultEncodingConstraint> implements OnInit, OnDestroy {
  public encodingList = [];

  constructor(public metaModelDialogService: EditorModelService) {
    super(metaModelDialogService);
    this.resetFormOnDestroy = false;
    this.fieldName = 'value';
  }

  getCurrentValue(key: string) {
    return this.previousData[key]?.[this.metaModelElement.className] || this.metaModelElement?.[key] || '';
  }

  ngOnInit() {
    this.subscription = this.getMetaModelData().subscribe((modelElement: BaseMetaModelElement) => {
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
          disabled: this.metaModelElement.isExternalReference(),
        },
        Validators.required
      )
    );
  }
}
