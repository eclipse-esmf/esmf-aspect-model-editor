/*
 * Copyright (c) 2022 Robert Bosch Manufacturing Solutions GmbH
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

import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {InputFieldComponent} from '../../input-field.component';
import {EditorModelService} from '../../../../editor-model.service';
import {DefaultOperation, DefaultProperty, Property} from '@ame/meta-model';
import {FormControl} from '@angular/forms';
import {Observable} from 'rxjs';
import {NamespacesCacheService} from '@ame/cache';
import {MatChipList} from '@angular/material/chips';
import {ENTER} from '@angular/cdk/keycodes';
import {EditorDialogValidators} from '../../../../validators';
import {RdfService} from '@ame/rdf/services';
import {ErrorStateMatcher} from '@angular/material/core';

@Component({
  selector: 'ame-input-chiplist-field',
  templateUrl: './input-chiplist-field.component.html',
})
export class InputChiplistFieldComponent extends InputFieldComponent<DefaultOperation> implements OnInit, OnDestroy {
  @ViewChild('chipList') inputChipList: MatChipList;
  @ViewChild('input') inputValue;

  public filteredPropertyTypes$: Observable<any[]>;
  public inputControl: FormControl;

  readonly separatorKeysCodes: number[] = [ENTER];

  public selectable = true;
  public removable = true;
  public inputValues: Array<Property>;

  constructor(
    public metaModelDialogService: EditorModelService,
    public namespacesCacheService: NamespacesCacheService,
    private rdfService: RdfService
  ) {
    super(metaModelDialogService, namespacesCacheService);
  }

  ngOnInit(): void {
    this.subscription = this.getMetaModelData().subscribe(() => {
      this.inputValues = [];
      this.setInputControl();
    });
  }

  hasErrors(): ErrorStateMatcher {
    return {
      isErrorState: () => !!this.getControl('inputValues')?.errors,
    };
  }

  ngOnDestroy() {
    super.ngOnDestroy();
    this.parentForm.removeControl('inputValues');
  }

  setInputControl() {
    const inputValueList = this.metaModelElement?.input.map(value => value.property);

    if (inputValueList) {
      this.inputValues.push(...inputValueList);
    }

    this.parentForm.setControl(
      'inputValues',
      new FormControl(
        {
          value: '',
          disabled: this.metaModelElement.isExternalReference(),
        },
        [
          EditorDialogValidators.duplicateNameWithDifferentType(
            this.namespacesCacheService,
            this.metaModelElement,
            this.rdfService.externalRdfModels,
            DefaultProperty
          ),
        ]
      )
    );

    this.parentForm.setControl(
      'inputChipList',
      new FormControl({
        value: this.inputValues,
        disabled: this.metaModelElement?.isExternalReference(),
      })
    );

    this.inputControl = this.parentForm.get('inputValues') as FormControl;
    this.filteredPropertyTypes$ = this.initFilteredPropertyTypes(this.inputControl);
  }

  onSelectionChange(fieldPath: string, newValue: any) {
    if (fieldPath !== 'input') {
      return;
    }

    if (newValue === null) {
      return; // happens on reset form
    }

    const property = this.currentCachedFile.getCachedProperties().find(p => p.aspectModelUrn === newValue.urn);
    this.parentForm.setControl('input', new FormControl(property));

    this.inputValue.nativeElement.value = '';

    this.inputValues.push(property);
    this.parentForm.get('inputChipList').setValue(this.inputValues);
  }

  createNewProperty(propertyName: string) {
    if (!this.isLowerCase(propertyName)) {
      return null;
    }

    const urn = `${this.metaModelElement.aspectModelUrn.split('#')?.[0]}#${propertyName}`;
    const newProperty = new DefaultProperty(this.metaModelElement.metaModelVersion, urn, propertyName, null);

    this.parentForm.setControl('input', new FormControl(newProperty));
    this.inputValue.nativeElement.value = '';

    this.inputValues.push(newProperty);
    this.parentForm.get('inputChipList').setValue(this.inputValues);
  }

  remove(value: Property) {
    const index = this.inputValues.indexOf(value);

    if (index >= 0) {
      this.inputValues.splice(index, 1);
    }
  }
}
