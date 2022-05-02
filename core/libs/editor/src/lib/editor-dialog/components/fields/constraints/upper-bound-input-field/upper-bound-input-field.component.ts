/*
 * Copyright (c) 2022 Robert Bosch Manufacturing Solutions GmbH
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
import {InputFieldComponent} from '../../input-field.component';
import {EditorModelService} from '../../../../editor-model.service';
import {DataTypeService} from '@ame/shared';
import {Bamm, Bammc} from '@ame/vocabulary';

@Component({
  selector: 'ame-upper-bound-input-field',
  templateUrl: './upper-bound-input-field.component.html',
})
export class UpperBoundInputFieldComponent extends InputFieldComponent<DefaultConstraint> implements OnInit, OnDestroy {
  public upperBoundDefinitionList = [];

  constructor(
    public metaModelDialogService: EditorModelService,
    public dataTypeService: DataTypeService,
    public mxGraphService: MxGraphService
  ) {
    super(metaModelDialogService);
    this.resetFormOnDestroy = false;
    this.fieldName = 'upperBoundDefinition';
  }

  ngOnInit() {
    this.subscription = this.getMetaModelData().subscribe((modelElement: BaseMetaModelElement) => {
      this.upperBoundDefinitionList = modelElement
        ? new Bammc(new Bamm(modelElement.metaModelVersion)).getUpperBoundDefinitionList()
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

  getPlaceholder(rangeValueDataType: string): string {
    const dataType = this.dataTypeService.getDataType(rangeValueDataType);
    return dataType ? dataType.description : '';
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
