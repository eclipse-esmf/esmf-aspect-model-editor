import {Component, OnInit} from '@angular/core';
import {FormControl, Validators} from '@angular/forms';
import {NamespacesCacheService} from '@bame/cache';
import {
  BaseMetaModelElement,
  DefaultAspect,
  DefaultCharacteristic,
  DefaultConstraint,
  DefaultEntity,
  DefaultEntityValue,
  DefaultUnit,
} from '@bame/meta-model';
import {EditorModelService} from '../../../../editor-model.service';
import {EditorDialogValidators} from '../../../../validators';
import {InputFieldComponent} from '../../input-field.component';
import {RdfService} from '@bame/rdf/services';

@Component({
  selector: 'bci-name-input-field',
  templateUrl: './name-input-field.component.html',
})
export class NameInputFieldComponent extends InputFieldComponent<BaseMetaModelElement> implements OnInit {
  constructor(
    public metaModelDialogService: EditorModelService,
    public namespacesCacheService: NamespacesCacheService,
    private rdfService: RdfService
  ) {
    super(metaModelDialogService, namespacesCacheService);
    this.fieldName = 'name';
  }

  ngOnInit(): void {
    this.subscription = this.getMetaModelData().subscribe(() => this.setNameControl());
  }

  private setNameControl() {
    const nameControl = this.parentForm.get('name');
    if (nameControl?.value) {
      nameControl.updateValueAndValidity();
    }

    this.parentForm.setControl(
      'name',
      new FormControl(
        {
          value: this.getCurrentValue('name'),
          disabled: this.metaModelDialogService.isReadOnly() || this.metaModelElement?.isExternalReference(),
        },
        {
          validators: this.getNameValidators(),
        }
      )
    );
  }

  private getNameValidators(): any[] {
    const nameValidators = [
      Validators.required,
      EditorDialogValidators.duplicateName(this.namespacesCacheService, this.metaModelElement, this.rdfService.externalRdfModels),
    ];
    if (this.metaModelElement instanceof DefaultUnit) {
      return nameValidators;
    }
    if (!(this.metaModelElement instanceof DefaultEntityValue)) {
      nameValidators.push(this.isUpperCaseName() ? EditorDialogValidators.namingUpperCase : EditorDialogValidators.namingLowerCase);
    } else {
      nameValidators.push(EditorDialogValidators.noWhiteSpace);
    }

    return nameValidators;
  }

  private isUpperCaseName(): boolean {
    return (
      this.metaModelElement instanceof DefaultAspect ||
      this.metaModelElement instanceof DefaultEntity ||
      this.metaModelElement instanceof DefaultConstraint ||
      this.metaModelElement instanceof DefaultCharacteristic
    );
  }
}
