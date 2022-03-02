import {Component, OnInit} from '@angular/core';
import {FormControl} from '@angular/forms';
import {BaseMetaModelElement, DefaultCharacteristic} from '@bame/meta-model';
import {EditorModelService} from '../../../../editor-model.service';
import {InputFieldComponent} from '../../input-field.component';

@Component({
  selector: 'bci-description-input-field',
  templateUrl: './description-input-field.component.html',
})
export class DescriptionInputFieldComponent extends InputFieldComponent<BaseMetaModelElement> implements OnInit {
  constructor(public metaModelDialogService: EditorModelService) {
    super(metaModelDialogService);
    this.fieldName = 'description';
  }

  ngOnInit(): void {
    this.subscription = this.getMetaModelData().subscribe(() => this.setDescriptionControls());
  }

  getCurrentValue(key: string, locale: string) {
    if (this.metaModelElement instanceof DefaultCharacteristic && this.metaModelElement.isPredefined()) {
      return this.metaModelElement?.[key] || '';
    }
    return this.previousData?.[key] || this.metaModelElement?.getDescription(locale) || '';
  }

  private setDescriptionControls() {
    const allLocalesDescriptions = this.metaModelElement?.getAllLocalesDescriptions();

    if (!allLocalesDescriptions.length) {
      this.metaModelElement.addDescription('en', '');
    }

    this.metaModelElement?.getAllLocalesDescriptions().forEach(locale => {
      const key = `description${locale}`;

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

      this.removeDescriptionControl(locale);
      this.parentForm.setControl(
        key,
        new FormControl({
          value: this.getCurrentValue(key, locale) || this.metaModelElement?.getDescription(locale),
          disabled: this.metaModelDialogService.isReadOnly() || this.metaModelElement?.isExternalReference(),
        })
      );
    });
  }

  private removeDescriptionControl(locale: string): void {
    this.parentForm.removeControl(`description${locale}`);
  }
}
