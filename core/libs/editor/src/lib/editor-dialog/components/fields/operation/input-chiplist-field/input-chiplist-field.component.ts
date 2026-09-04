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

import {CacheUtils} from '@ame/cache';
import {ENTER} from '@angular/cdk/keycodes';
import {Component, computed, inject, OnDestroy, OnInit, signal, Signal} from '@angular/core';
import {rxResource, takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {disabled, form, FormField, validateAsync} from '@angular/forms/signals';
import {MatAutocomplete, MatAutocompleteTrigger} from '@angular/material/autocomplete';
import {MatChipGrid, MatChipInput, MatChipRow, MatChipsModule} from '@angular/material/chips';
import {MatOptgroup, MatOption} from '@angular/material/core';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatError, MatInput, MatLabel} from '@angular/material/input';
import {DefaultOperation, DefaultProperty, Property, RdfModel} from '@esmf/aspect-model-loader';
import {TranslocoDirective} from '@jsverse/transloco';
import {of} from 'rxjs';
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
    FormField,
    MatAutocompleteTrigger,
    MatChipInput,
    MatAutocomplete,
    MatOptgroup,
    MatOption,
    MatError,
    MatChipsModule,
    MatIconModule,
    MatInput,
    TranslocoDirective,
  ],
})
export class InputChiplistFieldComponent extends InputFieldComponent<DefaultOperation> implements OnInit, OnDestroy {
  private readonly editorDialogValidators = inject(EditorDialogValidators);
  private readonly searchModel = signal('');
  private readonly inputModel = signal<Property[]>([]);
  private readonly disabledState = signal(false);

  private readonly createDuplicateNameResource = (name: Signal<string>) =>
    rxResource({
      params: () => name(),
      stream: ({params}) =>
        this.metaModelElement
          ? this.editorDialogValidators.duplicateNameWithDifferentTypeValue(params, this.metaModelElement, DefaultProperty)
          : of(null),
    });

  readonly searchField = form(this.searchModel, path => {
    validateAsync(path, {
      params: ({value}) => value(),
      factory: this.createDuplicateNameResource,
      onSuccess: result => {
        const kind = result && Object.keys(result)[0];
        return kind ? {kind, message: 'Property name is already used by another type'} : null;
      },
      onError: () => ({kind: 'duplicateNameValidation', message: 'Property name could not be validated'}),
    });
    disabled(path, {when: this.disabledState});
  });
  readonly filteredPropertyTypes = computed(() => {
    const value = this.searchModel();
    const properties = CacheUtils.getCachedElements(this.currentCachedFile, DefaultProperty)
      .filter(property => !property.isAbstract)
      .map(property => ({
        name: property.name,
        description: property.getDescription('en') || '',
        urn: property.aspectModelUrn,
        namespace: undefined as string | undefined,
      }));
    return [...properties, ...this.searchExtProperty(value)].filter(type => this.inSearchList(type, value));
  });
  public inputValues = this.inputModel.asReadonly();
  readonly searchValue = this.searchModel.asReadonly();

  readonly separatorKeysCodes = signal([ENTER]);
  public removable = signal(true);

  get currentRdfModel(): RdfModel {
    return this.loadedFiles.currentLoadedFile.rdfModel;
  }

  ngOnInit(): void {
    this.getMetaModelData()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.setInputControl();
      });
  }

  hasError(kind: string): boolean {
    return this.searchField()
      .errors()
      .some(error => error.kind === kind);
  }

  ngOnDestroy() {
    this.signalForm().remove('inputChipList');
    super.ngOnDestroy();
  }

  setInputControl() {
    const inputValueList = this.metaModelElement?.input;

    this.disabledState.set(this.loadedFiles.isElementExtern(this.metaModelElement));
    this.removable.set(!this.disabledState());
    const list = inputValueList ? [...inputValueList] : [];
    this.inputModel.set(list);
    this.signalForm().set('inputChipList', list);
    this.searchModel.set('');
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
    const index = this.inputModel().indexOf(value);

    if (index >= 0) {
      this.inputModel.update(values => values.filter(input => input !== value));
      this.signalForm().set('inputChipList', this.inputModel());
    }
  }

  private addProperty(property: DefaultProperty | Property) {
    if (!property || this.inputModel().includes(property)) return;
    this.inputModel.update(values => [...values, property]);
    this.signalForm().set('inputChipList', this.inputModel());
    this.searchModel.set('');
  }
}
