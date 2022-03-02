/*
 * Copyright (c) 2020 Bosch Software Innovations GmbH. All rights reserved.
 */
import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormControl} from '@angular/forms';
import {DefaultConstraint, BaseMetaModelElement} from '@bame/meta-model';
import {MxGraphService} from '@bame/mx-graph';
import {InputFieldComponent} from '../../input-field.component';
import {EditorModelService} from '../../../../editor-model.service';
import {DataTypeService} from '@bame/shared';
import {Bammc, Bamm} from '@bame/vocabulary';

@Component({
  selector: 'bci-upper-bound-input-field',
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
