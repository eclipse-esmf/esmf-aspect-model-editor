import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormControl, Validators} from '@angular/forms';
import {DefaultEntity, DefaultState} from '@bame/meta-model';
import {EditorModelService} from '../../../../editor-model.service';
import {InputFieldComponent} from '../../input-field.component';

@Component({
  selector: 'bci-default-value-input-field',
  templateUrl: './default-value-input-field.component.html',
})
export class DefaultValueInputFieldComponent extends InputFieldComponent<DefaultState> implements OnInit, OnDestroy {
  constructor(public metaModelDialogService: EditorModelService) {
    super(metaModelDialogService);
    this.fieldName = 'defaultValue';
  }

  ngOnInit() {
    this.subscription = this.getMetaModelData().subscribe(() => this.initForm());
  }

  ngOnDestroy() {
    super.ngOnDestroy();
    this.parentForm.removeControl(this.fieldName);
  }

  initForm() {
    const defaultValue = this.getCurrentValue(this.fieldName);
    const defaultValueString = typeof defaultValue === 'string' ? defaultValue : defaultValue?.name;

    this.parentForm.setControl(
      this.fieldName,
      new FormControl(
        {value: defaultValueString || this.metaModelElement.defaultValue, disabled: this.metaModelElement?.isExternalReference()},
        Validators.required
      )
    );

    this.formSubscription.add(
      this.parentForm.get('dataTypeEntity').valueChanges.subscribe(dataType => {
        if (dataType instanceof DefaultEntity) {
          this.parentForm.get(this.fieldName).patchValue('');
        }
      })
    );
  }
}
