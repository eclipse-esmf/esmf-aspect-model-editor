import {Component, OnInit} from '@angular/core';
import {FormControl} from '@angular/forms';
import {DefaultUnit} from '@bame/meta-model';
import {EditorModelService} from '../../../../editor-model.service';
import {InputFieldComponent} from '../../input-field.component';

@Component({
  selector: 'bci-conversion-factor-input-field',
  templateUrl: './conversion-factor-input-field.component.html',
})
export class ConversionFactorInputFieldComponent extends InputFieldComponent<DefaultUnit> implements OnInit {
  constructor(public metaModelDialogService: EditorModelService) {
    super(metaModelDialogService);
  }

  ngOnInit(): void {
    this.subscription = this.getMetaModelData().subscribe(() => this.initConversionFactorForm());
  }

  initConversionFactorForm() {
    this.parentForm.setControl(
      'conversionFactor',
      new FormControl({
        value: this.metaModelElement?.conversionFactor,
        disabled: this.metaModelDialogService.isReadOnly() || this.metaModelElement?.isExternalReference(),
      })
    );
  }
}
