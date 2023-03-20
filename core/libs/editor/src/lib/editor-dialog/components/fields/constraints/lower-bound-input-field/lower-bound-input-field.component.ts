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
import {BaseMetaModelElement, DefaultConstraint} from '@ame/meta-model';
import {MxGraphService} from '@ame/mx-graph';
import {DataTypeService} from '@ame/shared';
import {Samm, SammC} from '@ame/vocabulary';
import {EditorModelService} from '../../../../editor-model.service';
import {InputFieldComponent} from '../../input-field.component';

@Component({
  selector: 'ame-lower-bound-input-field',
  templateUrl: './lower-bound-input-field.component.html',
})
export class LowerBoundInputFieldComponent extends InputFieldComponent<DefaultConstraint> implements OnInit, OnDestroy {
  public lowerBoundDefinitionList = [];

  constructor(
    public metaModelDialogService: EditorModelService,
    public dataTypeService: DataTypeService,
    public mxGraphService: MxGraphService
  ) {
    super(metaModelDialogService);
    this.resetFormOnDestroy = false;
    this.fieldName = 'lowerBoundDefinition';
  }

  ngOnInit() {
    this.subscription = this.getMetaModelData().subscribe((modelElement: BaseMetaModelElement) => {
      this.lowerBoundDefinitionList = modelElement
        ? new SammC(new Samm(modelElement.metaModelVersion)).getLowerBoundDefinitionList()
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
        disabled: this.metaModelElement.isExternalReference(),
      })
    );
  }
}
