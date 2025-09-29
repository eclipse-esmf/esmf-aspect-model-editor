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
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {FormControl, ReactiveFormsModule} from '@angular/forms';
import {MatFormField, MatLabel} from '@angular/material/input';
import {MatOption, MatSelect} from '@angular/material/select';
import {DefaultConstraint, NamedElement, Samm, SammC} from '@esmf/aspect-model-loader';
import {InputFieldComponent} from '../../input-field.component';

@Component({
  selector: 'ame-lower-bound-input-field',
  templateUrl: './lower-bound-input-field.component.html',
  imports: [MatFormField, MatLabel, MatSelect, ReactiveFormsModule, MatOption],
})
export class LowerBoundInputFieldComponent extends InputFieldComponent<DefaultConstraint> implements OnInit, OnDestroy {
  public lowerBoundDefinitionList = [];

  constructor() {
    super();
    this.resetFormOnDestroy = false;
    this.fieldName = 'lowerBoundDefinition';
  }

  ngOnInit() {
    this.getMetaModelData()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((modelElement: NamedElement) => {
        this.lowerBoundDefinitionList = modelElement
          ? new SammC(new Samm(modelElement.metaModelVersion)).getLowerBoundDefinitionList()
          : null;
        if (modelElement instanceof DefaultConstraint) {
          this.metaModelElement = modelElement;
        }
        this.initForm();
      });
  }

  ngOnDestroy() {
    super.ngOnDestroy();
    this.parentForm.removeControl(this.fieldName);
  }

  initForm() {
    this.parentForm.setControl(
      this.fieldName,
      new FormControl({
        value: this.getCurrentValue(this.fieldName),
        disabled: this.loadedFiles.isElementExtern(this.metaModelElement),
      }),
    );
  }
}
