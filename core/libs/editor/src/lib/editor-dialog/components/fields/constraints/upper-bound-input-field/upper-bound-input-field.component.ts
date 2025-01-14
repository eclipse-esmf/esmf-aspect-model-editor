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
import {MxGraphService} from '@ame/mx-graph';
import {DataTypeService} from '@ame/shared';
import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormControl} from '@angular/forms';
import {DefaultConstraint, NamedElement, Samm, SammC} from '@esmf/aspect-model-loader';
import {InputFieldComponent} from '../../input-field.component';

@Component({
  selector: 'ame-upper-bound-input-field',
  templateUrl: './upper-bound-input-field.component.html',
})
export class UpperBoundInputFieldComponent extends InputFieldComponent<DefaultConstraint> implements OnInit, OnDestroy {
  public upperBoundDefinitionList = [];

  constructor(
    public dataTypeService: DataTypeService,
    public mxGraphService: MxGraphService,
  ) {
    super();
    this.resetFormOnDestroy = false;
    this.fieldName = 'upperBoundDefinition';
  }

  ngOnInit() {
    this.subscription = this.getMetaModelData().subscribe((modelElement: NamedElement) => {
      this.upperBoundDefinitionList = modelElement
        ? new SammC(new Samm(modelElement.metaModelVersion)).getUpperBoundDefinitionList()
        : null;
      if (modelElement instanceof DefaultConstraint) {
        this.metaModelElement = modelElement;
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
      new FormControl({
        value: this.getCurrentValue(this.fieldName),
        disabled: this.loadedFiles.isElementExtern(this.metaModelElement),
      }),
    );
  }
}
