import {Component, OnInit} from '@angular/core';
import {FormControl} from '@angular/forms';
import {DefaultUnit} from '@bame/meta-model';
import {EditorModelService} from '../../../../editor-model.service';
import {InputFieldComponent} from '../../input-field.component';

@Component({
  selector: 'bci-symbol-input-field',
  templateUrl: './symbol-input-field.component.html',
})
export class SymbolInputFieldComponent extends InputFieldComponent<DefaultUnit> implements OnInit {
  constructor(public metaModelDialogService: EditorModelService) {
    super(metaModelDialogService);
  }

  ngOnInit(): void {
    this.subscription = this.getMetaModelData().subscribe(() => this.initSymbolControl());
  }

  initSymbolControl() {
    this.parentForm.setControl(
      'symbol',
      new FormControl({
        value: this.metaModelElement?.symbol,
        disabled: this.metaModelDialogService.isReadOnly() || this.metaModelElement?.isExternalReference(),
      })
    );
  }
}
