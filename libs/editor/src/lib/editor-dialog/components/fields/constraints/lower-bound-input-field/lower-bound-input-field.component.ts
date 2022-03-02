/*
 * Copyright (c) 2020 Bosch Software Innovations GmbH. All rights reserved.
 */
import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormControl} from '@angular/forms';
import {DefaultConstraint, BaseMetaModelElement} from '@bame/meta-model';
import {MxGraphService} from '@bame/mx-graph';
import {DataTypeService} from '@bame/shared';
import {Bammc, Bamm} from '@bame/vocabulary';
import {EditorModelService} from '../../../../editor-model.service';
import {InputFieldComponent} from '../../input-field.component';

@Component({
  selector: 'bci-lower-bound-input-field',
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
        ? new Bammc(new Bamm(modelElement.metaModelVersion)).getLowerBoundDefinitionList()
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
