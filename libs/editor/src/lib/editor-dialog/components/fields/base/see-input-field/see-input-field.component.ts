import {Component, OnInit} from '@angular/core';
import {FormControl} from '@angular/forms';
import {BaseMetaModelElement} from '@bame/meta-model';
import {EditorModelService} from '../../../../editor-model.service';
import {EditorDialogValidators} from '../../../../validators';
import {InputFieldComponent} from '../../input-field.component';

@Component({
  selector: 'bci-see-input-field',
  templateUrl: './see-input-field.component.html',
})
export class SeeInputFieldComponent extends InputFieldComponent<BaseMetaModelElement> implements OnInit {
  constructor(public metaModelDialogService: EditorModelService) {
    super(metaModelDialogService);
    this.fieldName = 'see';
  }

  ngOnInit(): void {
    this.subscription = this.getMetaModelData().subscribe(() => this.setSeeControl());
  }

  getCurrentValue() {
    return this.previousData?.[this.fieldName] || this.metaModelElement?.getSeeReferences()?.join(',') || '';
  }

  private setSeeControl() {
    if (this.parentForm.get(this.fieldName)?.value) {
      return;
    }
    this.parentForm.setControl(
      this.fieldName,
      new FormControl(
        {
          value: this.decodeUriComponent(this.getCurrentValue()),
          disabled: this.metaModelDialogService.isReadOnly() || this.metaModelElement?.isExternalReference(),
        },
        {
          validators: [EditorDialogValidators.seeURI],
        }
      )
    );
  }

  private decodeUriComponent(seeReference: string): string {
    return seeReference ? decodeURIComponent(seeReference) : null;
  }
}
