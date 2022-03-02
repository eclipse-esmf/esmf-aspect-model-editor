/*
 * Copyright (c) 2020 Bosch Software Innovations GmbH. All rights reserved.
 */
import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormControl} from '@angular/forms';
import {DefaultRangeConstraint, BaseMetaModelElement, DefaultTrait, Type} from '@bame/meta-model';
import {MxGraphHelper, MxGraphService} from '@bame/mx-graph';
import {RdfModelUtil} from '@bame/rdf/utils';
import {DataTypeService} from '@bame/shared';
import {EditorModelService} from '../../../../editor-model.service';
import {InputFieldComponent} from '../../input-field.component';

@Component({
  selector: 'bci-min-value-input-field',
  templateUrl: './min-value-input-field.component.html',
})
export class MinValueInputFieldComponent extends InputFieldComponent<DefaultRangeConstraint> implements OnInit, OnDestroy {
  public rangeConstraintDataType: Type;

  constructor(
    public metaModelDialogService: EditorModelService,
    public dataTypeService: DataTypeService,
    public mxGraphService: MxGraphService
  ) {
    super(metaModelDialogService);
    this.resetFormOnDestroy = false;
    this.fieldName = 'minValue';
  }

  getCurrentValue(key: string) {
    return this.previousData[key]?.[this.metaModelElement.className] || this.metaModelElement?.[key] || '';
  }

  ngOnInit() {
    this.subscription = this.getMetaModelData().subscribe((modelElement: BaseMetaModelElement) => {
      if (modelElement instanceof DefaultRangeConstraint) {
        this.metaModelElement = modelElement;
      }
      this.rangeConstraintDataType = this.getCharacteristicTypeForConstraint(modelElement.name);
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

  getValueWithoutUrnDefinition(value: any) {
    return RdfModelUtil.getValueWithoutUrnDefinition(value);
  }

  private getCharacteristicTypeForConstraint(id: string): Type {
    const edges = this.mxGraphService.getAllEdges(id);

    // constraint can only have trait as a source edge
    const types = edges?.map(edge => MxGraphHelper.getModelElement<DefaultTrait>(edge.source)?.getBaseCharacteristic()?.dataType) || [];

    if (types.length > 0) {
      // return type only if we have one kind of a type in list.
      // in case of only one type, return it.
      return types.reduce((t1, t2) => (t1.getUrn() === t2?.getUrn() || t2 === undefined ? t1 : null));
    }

    return null;
  }
}
