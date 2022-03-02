import {Component, OnInit} from '@angular/core';
import {FormControl} from '@angular/forms';
import {BaseMetaModelElement, DefaultCharacteristic} from '@bame/meta-model';
import {EditorModelService} from '../../../../editor-model.service';
import {InputFieldComponent} from '../../input-field.component';

@Component({
  selector: 'bci-preferred-name-input-field',
  templateUrl: './preferred-name-input-field.component.html',
})
export class PreferredNameInputFieldComponent extends InputFieldComponent<BaseMetaModelElement> implements OnInit {
  constructor(public metaModelDialogService: EditorModelService) {
    super(metaModelDialogService);
    this.fieldName = 'preferredName';
  }

  ngOnInit(): void {
    this.subscription = this.getMetaModelData().subscribe(() => this.setPreferredNameNameControls());
  }

  getCurrentValue(key: string, locale: string) {
    if (this.metaModelElement instanceof DefaultCharacteristic && this.metaModelElement.isPredefined()) {
      return this.metaModelElement?.[key] || '';
    }
    return this.previousData?.[key] || this.metaModelElement?.getPreferredName(locale) || '';
  }

  private setPreferredNameNameControls() {
    const allLocalesPreferredNames = this.metaModelElement?.getAllLocalesPreferredNames();

    if (!allLocalesPreferredNames.length) {
      this.metaModelElement.addPreferredName('en', '');
    }

    this.metaModelElement?.getAllLocalesPreferredNames()?.forEach(locale => {
      const key = `preferredName${locale}`;
      const control = this.parentForm.get(key);
      const previousDisabled = control?.disabled;
      const isNowPredefined = (this.metaModelElement as DefaultCharacteristic)?.isPredefined?.();

      if (previousDisabled && !isNowPredefined) {
        control?.patchValue(this.getCurrentValue(key, locale));
      } else if (!previousDisabled && !isNowPredefined) {
        if (this.parentForm.get(key)?.value) {
          return;
        }
      }

      this.removePreferredNameControl(locale);

      this.parentForm.setControl(
        key,
        new FormControl({
          value: this.getCurrentValue(key, locale),
          disabled: this.metaModelDialogService.isReadOnly() || this.metaModelElement?.isExternalReference(),
        })
      );
    });
  }

  private removePreferredNameControl(locale: string): void {
    this.parentForm.removeControl(`preferredName${locale}`);
  }
}
