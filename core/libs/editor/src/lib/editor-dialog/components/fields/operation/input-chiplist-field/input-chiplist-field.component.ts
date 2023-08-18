/*
 * Copyright (c) 2023 Robert Bosch Manufacturing Solutions GmbH
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

import {Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {InputFieldComponent} from '../../input-field.component';
import {DefaultOperation, DefaultProperty, Property} from '@ame/meta-model';
import {FormControl} from '@angular/forms';
import {Observable} from 'rxjs';
import {ENTER} from '@angular/cdk/keycodes';
import {EditorDialogValidators} from '../../../../validators';
import {RdfService} from '@ame/rdf/services';
import {ErrorStateMatcher} from '@angular/material/core';

@Component({
  selector: 'ame-input-chiplist-field',
  templateUrl: './input-chiplist-field.component.html',
})
export class InputChiplistFieldComponent extends InputFieldComponent<DefaultOperation> implements OnInit, OnDestroy {
  @ViewChild('searchInput') searchInput: ElementRef<HTMLInputElement>;

  readonly separatorKeysCodes: number[] = [ENTER];

  public filteredPropertyTypes$: Observable<any[]>;
  public removable = true;
  public inputValues: Array<Property>;
  public chipControl = new FormControl();
  public searchControl: FormControl<string>;

  constructor(public rdfService: RdfService) {
    super();
  }

  ngOnInit(): void {
    this.subscription = this.getMetaModelData().subscribe(() => {
      this.inputValues = [];
      this.setInputControl();
    });
  }

  hasErrors(): ErrorStateMatcher {
    return {
      isErrorState: () => !!this.searchControl?.errors,
    };
  }

  ngOnDestroy() {
    super.ngOnDestroy();
  }

  setInputControl() {
    const inputValueList = this.metaModelElement?.input.map(value => value.property);

    if (inputValueList) {
      this.inputValues.push(...inputValueList);
    }

    this.searchControl = new FormControl(
      {
        value: '',
        disabled: this.metaModelElement.isExternalReference(),
      },
      [
        EditorDialogValidators.duplicateNameWithDifferentType(
          this.namespacesCacheService,
          this.metaModelElement,
          this.rdfService,
          DefaultProperty
        ),
      ]
    );

    this.parentForm.setControl(
      'inputChipList',
      new FormControl({
        value: this.inputValues,
        disabled: this.metaModelElement?.isExternalReference(),
      })
    );

    if (this.metaModelElement?.isExternalReference()) this.chipControl.disable();

    this.filteredPropertyTypes$ = this.initFilteredPropertyTypes(this.searchControl);
  }

  onSelectionChange(fieldPath: string, newValue: any) {
    if (fieldPath !== 'input' || newValue === null) {
      return;
    }

    let property = this.currentCachedFile.getCachedProperties().find(p => p.aspectModelUrn === newValue.urn);
    if (!property) {
      property = this.namespacesCacheService.findElementOnExtReference<Property>(newValue.urn);
    }

    this.addProperty(property);
  }

  createNewProperty(propertyName: string) {
    if (!this.isLowerCase(propertyName)) {
      return null;
    }

    const urn = `${this.metaModelElement.aspectModelUrn.split('#')?.[0]}#${propertyName}`;
    const newProperty = new DefaultProperty(this.metaModelElement.metaModelVersion, urn, propertyName, null);
    this.addProperty(newProperty);
  }

  remove(value: Property) {
    const index = this.inputValues.indexOf(value);

    if (index >= 0) {
      this.inputValues.splice(index, 1);
      this.parentForm.get('inputChipList').setValue([...this.inputValues]);
    }
  }

  private addProperty(property: DefaultProperty | Property) {
    this.inputValues.push(property);
    this.parentForm.get('inputChipList').setValue([...this.inputValues]);
    this.searchInput.nativeElement.value = '';
    this.searchControl.setValue(null);
  }
}
