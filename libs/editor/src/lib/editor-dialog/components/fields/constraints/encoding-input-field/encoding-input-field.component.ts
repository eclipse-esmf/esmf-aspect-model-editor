/*
 * Copyright (c) 2020 Bosch Software Innovations GmbH. All rights reserved.
 */
import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormControl, Validators} from '@angular/forms';
import {DefaultEncodingConstraint, BaseMetaModelElement} from '@bame/meta-model';
import {InputFieldComponent} from '../../input-field.component';
import {EditorModelService} from '../../../../editor-model.service';
import {Bamm} from '@bame/vocabulary';
import {RdfModelUtil} from '@bame/rdf/utils';

@Component({
  selector: 'bci-encoding-input-field',
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
      this.encodingList = modelElement ? new Bamm(modelElement.metaModelVersion).getEncodingList() : null;
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
