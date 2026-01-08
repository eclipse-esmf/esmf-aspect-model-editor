/*
 * Copyright (c) 2024 Robert Bosch Manufacturing Solutions GmbH
 *
 * See the AUTHORS file(s) distributed with this work for
 * additional information regarding authorship.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * SPDX-License-Identifier: MPL-2.0
 */

import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {FormControl, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatError, MatInput, MatLabel} from '@angular/material/input';
import {
  DefaultAspect,
  DefaultCharacteristic,
  DefaultConstraint,
  DefaultEntity,
  DefaultEntityInstance,
  DefaultProperty,
  DefaultUnit,
  DefaultValue,
  NamedElement,
} from '@esmf/aspect-model-loader';
import {TranslatePipe} from '@ngx-translate/core';
import {EditorDialogValidators} from '../../../../validators';
import {InputFieldComponent} from '../../input-field.component';

@Component({
  selector: 'ame-name-input-field',
  templateUrl: './name-input-field.component.html',
  styleUrls: ['../../field.scss'],
  imports: [MatFormFieldModule, MatLabel, ReactiveFormsModule, MatInput, MatError, TranslatePipe],
})
export class NameInputFieldComponent extends InputFieldComponent<NamedElement> implements OnInit, OnDestroy {
  private editorDialogValidators = inject(EditorDialogValidators);

  public fieldName = 'name';

  ngOnInit(): void {
    this.getMetaModelData()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.setNameControl());
  }

  ngOnDestroy() {
    super.ngOnDestroy();
  }

  private isDisabled() {
    return this.metaModelElement instanceof DefaultProperty && !!this.metaModelElement?.getExtends();
  }

  private setNameControl() {
    let nameControl = this.parentForm.get('name');
    if (nameControl?.value) {
      nameControl.updateValueAndValidity();
    }

    this.parentForm.setControl(
      'name',
      new FormControl(
        {
          value: this.getCurrentValue('name'),
          disabled:
            this.metaModelDialogService.isReadOnly() || this.loadedFiles.isElementExtern(this.metaModelElement) || this.isDisabled(),
        },
        {
          validators: this.getNameValidators(),
        },
      ),
    );
    nameControl = this.parentForm.get('name');

    nameControl.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      const validation = this.editorDialogValidators.duplicateName(this.metaModelElement)(nameControl);
      if (validation) {
        nameControl.setErrors({
          ...(nameControl.errors || {}),
          ...(validation || {}),
        });
      }
    });
    nameControl.markAsTouched();
  }

  private getNameValidators(): any[] {
    if (this.isDisabled()) {
      return [];
    }

    const nameValidators = [Validators.required];

    if (this.metaModelElement instanceof DefaultUnit) {
      return nameValidators;
    }

    if (![DefaultEntityInstance, DefaultValue].some(el => this.metaModelElement instanceof el)) {
      nameValidators.push(this.isUpperCaseName() ? EditorDialogValidators.namingUpperCase : EditorDialogValidators.namingLowerCase);
    } else {
      nameValidators.push(EditorDialogValidators.noWhiteSpace);
      EditorDialogValidators.duplicateNameString(this.currentCachedFile, this.metaModelElement.aspectModelUrn.split('#')[0]);
    }

    return nameValidators;
  }

  private isUpperCaseName(): boolean {
    return (
      this.metaModelElement instanceof DefaultAspect ||
      this.metaModelElement instanceof DefaultEntity ||
      (this.metaModelElement instanceof DefaultEntity && this.metaModelElement.isAbstractEntity()) ||
      this.metaModelElement instanceof DefaultConstraint ||
      this.metaModelElement instanceof DefaultCharacteristic ||
      this.metaModelElement instanceof DefaultValue
    );
  }
}
