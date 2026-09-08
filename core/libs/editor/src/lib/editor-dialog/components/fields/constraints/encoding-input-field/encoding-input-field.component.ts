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
import {RdfModelUtil} from '@ame/rdf/utils';
import {Component, OnDestroy, OnInit, signal} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {disabled, form, FormField, required} from '@angular/forms/signals';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatLabel} from '@angular/material/input';
import {MatOption, MatSelect} from '@angular/material/select';
import {DefaultEncodingConstraint, NamedElement, Samm} from '@esmf/aspect-model-loader';
import {InputFieldComponent} from '../../input-field.component';

@Component({
  selector: 'ame-encoding-input-field',
  templateUrl: './encoding-input-field.component.html',
  imports: [MatFormFieldModule, MatLabel, MatSelect, MatOption, FormField],
})
export class EncodingInputFieldComponent extends InputFieldComponent<DefaultEncodingConstraint> implements OnInit, OnDestroy {
  private readonly model = signal('');
  private unregisterField = () => undefined;

  readonly field = form(this.model, path => {
    required(path);
    disabled(path, {when: () => !!this.metaModelElement && this.loadedFiles.isElementExtern(this.metaModelElement)});
  });
  public encodingList = signal<Array<{value: string}>>([]);

  constructor() {
    super();
    this.resetFormOnDestroy = false;
    this.fieldName = 'value';
  }

  getCurrentValue(key: string) {
    return this.previousData()[key]?.[this.metaModelElement.className] || this.metaModelElement?.[key] || '';
  }

  ngOnInit() {
    this.getMetaModelData()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((modelElement: NamedElement) => {
        this.encodingList.set(modelElement ? new Samm(modelElement.metaModelVersion).getEncodingList() : []);
        if (modelElement instanceof DefaultEncodingConstraint) {
          this.metaModelElement = modelElement;
        }
        if (!this.metaModelElement.value) {
          this.metaModelElement.value = this.encodingList()[0]?.value || '';
        }
        this.initForm();
      });
  }

  ngOnDestroy() {
    this.unregisterField();
    super.ngOnDestroy();
  }

  initForm() {
    this.model.set(RdfModelUtil.getValueWithoutUrnDefinition(this.getCurrentValue(this.fieldName)));
    this.unregisterField = this.signalForm().register(this.fieldName, this.field);
  }
}
