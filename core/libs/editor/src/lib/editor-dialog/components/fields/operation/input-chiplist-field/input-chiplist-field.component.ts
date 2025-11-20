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

import {CacheUtils} from '@ame/cache';
import {ENTER} from '@angular/cdk/keycodes';
import {AsyncPipe} from '@angular/common';
import {Component, ElementRef, inject, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {FormControl, ReactiveFormsModule} from '@angular/forms';
import {MatAutocomplete, MatAutocompleteTrigger} from '@angular/material/autocomplete';
import {MatChipGrid, MatChipInput, MatChipRow, MatChipsModule} from '@angular/material/chips';
import {ErrorStateMatcher, MatOptgroup, MatOption} from '@angular/material/core';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatError, MatLabel} from '@angular/material/input';
import {DefaultOperation, DefaultProperty, Property, RdfModel} from '@esmf/aspect-model-loader';
import {Observable} from 'rxjs';
import {EditorDialogValidators} from '../../../../validators';
import {InputFieldComponent} from '../../input-field.component';

@Component({
  selector: 'ame-input-chiplist-field',
  templateUrl: './input-chiplist-field.component.html',
  styleUrls: ['../../field.scss'],
  imports: [
    MatFormFieldModule,
    MatLabel,
    MatChipGrid,
    MatChipRow,
    MatIconModule,
    ReactiveFormsModule,
    MatAutocompleteTrigger,
    MatChipInput,
    MatAutocomplete,
    AsyncPipe,
    MatOptgroup,
    MatOption,
    MatError,
    MatChipsModule,
    MatIconModule,
  ],
})
export class InputChiplistFieldComponent extends InputFieldComponent<DefaultOperation> implements OnInit, OnDestroy {
  @ViewChild('searchInput') searchInput: ElementRef<HTMLInputElement>;

  private editorDialogValidators = inject(EditorDialogValidators);

  readonly separatorKeysCodes: number[] = [ENTER];

  public filteredPropertyTypes$: Observable<any[]>;
  public removable = true;
  public inputValues: Array<Property>;
  public chipControl = new FormControl();
  public searchControl: FormControl<string>;

  get currentRdfModel(): RdfModel {
    return this.loadedFiles.currentLoadedFile.rdfModel;
  }

  ngOnInit(): void {
    this.getMetaModelData()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
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
    const inputValueList = this.metaModelElement?.input;

    if (inputValueList) {
      this.inputValues.push(...inputValueList);
    }

    this.searchControl = new FormControl(
      {
        value: '',
        disabled: this.loadedFiles.isElementExtern(this.metaModelElement),
      },
      [this.editorDialogValidators.duplicateNameWithDifferentType(this.metaModelElement, DefaultProperty)],
    );

    this.parentForm.setControl(
      'inputChipList',
      new FormControl({
        value: this.inputValues,
        disabled: this.loadedFiles.isElementExtern(this.metaModelElement),
      }),
    );

    if (this.loadedFiles.isElementExtern(this.metaModelElement)) this.chipControl.disable();

    this.filteredPropertyTypes$ = this.initFilteredPropertyTypes(this.searchControl);
  }

  onSelectionChange(fieldPath: string, newValue: any) {
    if (fieldPath !== 'input' || newValue === null) {
      return;
    }

    let property = CacheUtils.getCachedElements(this.currentCachedFile, DefaultProperty)
      .filter(p => !p.isAbstract)
      .find(p => p.aspectModelUrn === newValue.urn);
    if (!property) {
      property = this.loadedFiles.findElementOnExtReferences<Property>(newValue.urn);
    }

    this.addProperty(property);
  }

  createNewProperty(propertyName: string) {
    if (!this.isLowerCase(propertyName)) {
      return null;
    }

    const urn = `${this.metaModelElement.aspectModelUrn.split('#')?.[0]}#${propertyName}`;
    const newProperty = new DefaultProperty({
      metaModelVersion: this.metaModelElement.metaModelVersion,
      aspectModelUrn: urn,
      name: propertyName,
    });
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
