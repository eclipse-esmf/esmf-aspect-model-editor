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

import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormControl, Validators} from '@angular/forms';
import {
  DefaultAspect,
  DefaultCharacteristic,
  DefaultConstraint,
  DefaultEntity,
  DefaultEntityInstance,
  DefaultProperty,
  DefaultUnit,
  NamedElement,
} from '@esmf/aspect-model-loader';
import {Subscription} from 'rxjs';
import {EditorDialogValidators} from '../../../../validators';
import {InputFieldComponent} from '../../input-field.component';

@Component({
  selector: 'ame-name-input-field',
  templateUrl: './name-input-field.component.html',
  styleUrls: ['../../field.scss'],
})
export class NameInputFieldComponent extends InputFieldComponent<NamedElement> implements OnInit, OnDestroy {
  public fieldName = 'name';
  private nameSubscription = new Subscription();

  constructor(private validators: EditorDialogValidators) {
    super();
  }

  ngOnInit(): void {
    this.subscription = this.getMetaModelData().subscribe(() => this.setNameControl());
  }

  ngOnDestroy() {
    super.ngOnDestroy();
    this.nameSubscription.unsubscribe();
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

    this.nameSubscription.add(
      nameControl.valueChanges.subscribe(() => {
        const validation = this.validators.duplicateName(this.metaModelElement)(nameControl);
        if (validation) {
          nameControl.setErrors({
            ...(nameControl.errors || {}),
            ...(validation || {}),
          });
        }
      }),
    );
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

    if (!(this.metaModelElement instanceof DefaultEntityInstance)) {
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
      this.metaModelElement instanceof DefaultCharacteristic
    );
  }
}
