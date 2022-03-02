import {Component, OnInit} from '@angular/core';
import {InputFieldComponent} from '../../input-field.component';
import {DefaultUnit} from '@bame/meta-model';
import {EditorModelService} from '../../../../editor-model.service';
import {FormControl} from '@angular/forms';

@Component({
  selector: 'bci-code-input-field',
  templateUrl: './code-input-field.component.html',
})
export class CodeInputFieldComponent extends InputFieldComponent<DefaultUnit> implements OnInit {
  constructor(public metaModelDialogService: EditorModelService) {
    super(metaModelDialogService);
  }

  ngOnInit(): void {
    this.subscription = this.getMetaModelData().subscribe(() => this.initCodeForm());
  }

  initCodeForm() {
    this.parentForm.setControl(
      'code',
      new FormControl({
        value: this.metaModelElement?.code,
        disabled: this.metaModelDialogService.isReadOnly() || this.metaModelElement?.isExternalReference(),
      })
    );
  }
}
