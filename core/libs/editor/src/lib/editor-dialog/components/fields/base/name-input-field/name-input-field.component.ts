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

import {Component, OnDestroy, OnInit, inject} from '@angular/core';
import {FormControl, Validators} from '@angular/forms';
import {
  BaseMetaModelElement,
  DefaultAbstractEntity,
  DefaultAspect,
  DefaultCharacteristic,
  DefaultConstraint,
  DefaultEntity,
  DefaultEntityValue,
  DefaultProperty,
  DefaultUnit,
} from '@ame/meta-model';
import {EditorDialogValidators} from '../../../../validators';
import {InputFieldComponent} from '../../input-field.component';
import {RdfService} from '@ame/rdf/services';
import {Subscription} from 'rxjs';

@Component({
  selector: 'ame-name-input-field',
  templateUrl: './name-input-field.component.html',
  styleUrls: ['../../field.scss'],
})
export class NameInputFieldComponent extends InputFieldComponent<BaseMetaModelElement> implements OnInit, OnDestroy {
  public fieldName = 'name';
  private rdfService = inject(RdfService);
  private nameSubscription = new Subscription();

  ngOnInit(): void {
    this.subscription = this.getMetaModelData().subscribe(() => this.setNameControl());
  }

  ngOnDestroy() {
    super.ngOnDestroy();
    this.nameSubscription.unsubscribe();
  }

  private isDisabled() {
    return this.metaModelElement instanceof DefaultProperty && !!this.metaModelElement?.extendedElement;
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
          disabled: this.metaModelDialogService.isReadOnly() || this.metaModelElement?.isExternalReference() || this.isDisabled(),
        },
        {
          validators: this.getNameValidators(),
        }
      )
    );
    nameControl = this.parentForm.get('name');

    this.nameSubscription.add(
      nameControl.valueChanges.subscribe(() => {
        const validation = EditorDialogValidators.duplicateName(
          this.namespacesCacheService,
          this.metaModelElement,
          this.rdfService
        )(nameControl);
        if (validation) {
          nameControl.setErrors({
            ...(nameControl.errors || {}),
            ...(validation || {}),
          });
        }
      })
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
      this.metaModelElement instanceof DefaultAbstractEntity ||
      this.metaModelElement instanceof DefaultConstraint ||
      this.metaModelElement instanceof DefaultCharacteristic
    );
  }
}
