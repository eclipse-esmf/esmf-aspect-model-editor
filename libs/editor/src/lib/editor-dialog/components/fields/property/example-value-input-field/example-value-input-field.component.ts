import {Component, OnInit} from '@angular/core';
import {InputFieldComponent} from '../../input-field.component';
import {EditorModelService} from '../../../../editor-model.service';
import {DefaultProperty} from '@bame/meta-model';
import {FormControl} from '@angular/forms';

@Component({
  selector: 'bci-example-value-input-field',
  templateUrl: './example-value-input-field.component.html',
})
export class ExampleValueInputFieldComponent extends InputFieldComponent<DefaultProperty> implements OnInit {
  constructor(public metaModelDialogService: EditorModelService) {
    super(metaModelDialogService);
  }

  ngOnInit() {
    this.subscription = this.getMetaModelData().subscribe(() => this.initForm());
  }

  initForm() {
    this.parentForm.setControl(
      'exampleValue',
      new FormControl({value: this.metaModelElement?.exampleValue || '', disabled: this.metaModelElement.isExternalReference()})
    );
  }
}
