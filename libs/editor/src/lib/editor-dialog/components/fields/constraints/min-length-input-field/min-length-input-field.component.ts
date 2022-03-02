/*
 * Copyright (c) 2020 Bosch Software Innovations GmbH. All rights reserved.
 */
import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormControl} from '@angular/forms';
import {DefaultLengthConstraint} from '@bame/meta-model';
import {EditorModelService} from '../../../../editor-model.service';
import {InputFieldComponent} from '../../input-field.component';

@Component({
  selector: 'bci-min-length-input-field',
  templateUrl: './min-length-input-field.component.html',
})
export class MinLengthInputFieldComponent extends InputFieldComponent<DefaultLengthConstraint> implements OnInit, OnDestroy {
  constructor(public metaModelDialogService: EditorModelService) {
    super(metaModelDialogService);
    this.resetFormOnDestroy = false;
    this.fieldName = 'minValue';
  }

  getCurrentValue(key: string) {
    return this.previousData[key]?.[this.metaModelElement.className] || this.metaModelElement?.[key] || '';
  }

  ngOnInit() {
    this.subscription = this.getMetaModelData().subscribe(() => {
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
