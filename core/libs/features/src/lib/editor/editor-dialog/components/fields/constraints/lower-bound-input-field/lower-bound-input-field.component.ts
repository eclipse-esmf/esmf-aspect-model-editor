/*
 * Copyright (c) 2026 Robert Bosch Manufacturing Solutions GmbH
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
import {Component, OnDestroy, OnInit, signal} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {disabled, form, FormField} from '@angular/forms/signals';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatLabel} from '@angular/material/input';
import {MatOption, MatSelect} from '@angular/material/select';
import {DefaultConstraint, NamedElement, Samm, SammC} from '@esmf/aspect-model-loader';
import {InputFieldComponent} from '../../input-field.component';

@Component({
  selector: 'ame-lower-bound-input-field',
  templateUrl: './lower-bound-input-field.component.html',
  imports: [MatFormFieldModule, MatLabel, MatSelect, FormField, MatOption],
})
export class LowerBoundInputFieldComponent extends InputFieldComponent<DefaultConstraint> implements OnInit, OnDestroy {
  private readonly model = signal('');
  private unregisterField = () => undefined;

  readonly field = form(this.model, path =>
    disabled(path, {when: () => !!this.metaModelElement && this.loadedFiles.isElementExtern(this.metaModelElement)}),
  );
  public lowerBoundDefinitionList = signal([]);

  constructor() {
    super();
    this.resetFormOnDestroy = false;
    this.fieldName = 'lowerBoundDefinition';
  }

  ngOnInit() {
    this.getMetaModelData()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((modelElement: NamedElement) => {
        this.lowerBoundDefinitionList.set(
          modelElement ? new SammC(new Samm(modelElement.metaModelVersion)).getLowerBoundDefinitionList() : [],
        );
        if (modelElement instanceof DefaultConstraint) {
          this.metaModelElement = modelElement;
        }
        this.initForm();
      });
  }

  ngOnDestroy() {
    this.unregisterField();
    super.ngOnDestroy();
  }

  initForm() {
    this.model.set(this.getCurrentValue(this.fieldName));
    this.unregisterField = this.signalForm().register(this.fieldName, this.field);
  }
}
