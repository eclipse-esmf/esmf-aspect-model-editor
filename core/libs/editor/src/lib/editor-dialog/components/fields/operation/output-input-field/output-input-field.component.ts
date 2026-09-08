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
import {Component, computed, inject, OnDestroy, OnInit, signal, Signal} from '@angular/core';
import {rxResource, takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {disabled, form, FormField, validateAsync} from '@angular/forms/signals';
import {MatError, MatInput, MatLabel} from '@angular/material/input';
import {DefaultOperation, DefaultProperty, Property} from '@esmf/aspect-model-loader';
import {of} from 'rxjs';
import {EditorDialogValidators} from '../../../../validators';
import {InputFieldComponent} from '../../input-field.component';

import {MatAutocomplete, MatAutocompleteTrigger, MatOptgroup, MatOption} from '@angular/material/autocomplete';
import {MatIconButton} from '@angular/material/button';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {TranslocoDirective} from '@jsverse/transloco';

@Component({
  selector: 'ame-output-input-field',
  templateUrl: './output-input-field.component.html',
  styleUrls: ['../../field.scss'],
  imports: [
    MatFormFieldModule,
    MatLabel,
    MatIconModule,
    MatAutocompleteTrigger,
    FormField,
    MatError,
    MatInput,
    MatIconButton,
    MatAutocomplete,
    MatOptgroup,
    MatOption,
    TranslocoDirective,
  ],
})
export class OutputInputFieldComponent extends InputFieldComponent<DefaultOperation> implements OnInit, OnDestroy {
  private readonly editorDialogValidators = inject(EditorDialogValidators);
  private readonly displayModel = signal('');
  private readonly outputModel = signal<Property | null>(null);
  private readonly locked = signal(false);
  private readonly external = signal(false);
  private unregisterDisplay = () => undefined;

  private readonly createDuplicateNameResource = (name: Signal<string>) =>
    rxResource({
      params: () => name(),
      stream: ({params}) =>
        this.metaModelElement
          ? this.editorDialogValidators.duplicateNameWithDifferentTypeValue(params, this.metaModelElement, DefaultProperty)
          : of(null),
    });

  readonly displayField = form(this.displayModel, path => {
    validateAsync(path, {
      params: ({value}) => value(),
      factory: this.createDuplicateNameResource,
      onSuccess: result => {
        const kind = result && Object.keys(result)[0];
        return kind ? {kind, message: 'Property name is already used by another type'} : null;
      },
      onError: () => ({kind: 'duplicateNameValidation', message: 'Property name could not be validated'}),
    });
    disabled(path, {when: () => this.locked() || this.external()});
  });
  readonly displayValue = this.displayModel.asReadonly();
  readonly filteredPropertyTypes = computed(() => {
    const value = this.displayModel();
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

  ngOnInit(): void {
    this.getMetaModelData()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.setOutputControl());
  }

  ngOnDestroy() {
    this.unregisterDisplay();
    this.signalForm().remove('outputValue');
    super.ngOnDestroy();
  }

  setOutputControl() {
    const property = this.metaModelElement?.output;
    const value = property?.name ? property?.name : '';

    this.external.set(this.loadedFiles.isElementExtern(this.metaModelElement));
    this.locked.set(!!value);
    this.displayModel.set(value);
    this.outputModel.set(property || null);
    this.unregisterDisplay = this.signalForm().register('output', this.displayField);
    this.signalForm().set('outputValue', property || null);
    this.displayField().markAsTouched();
  }

  onSelectionChange(fieldPath: string, newValue: any) {
    if (fieldPath !== 'output') {
      return;
    }

    if (newValue === null) {
      return; // happens on reset form
    }

    let property = CacheUtils.getCachedElements(this.currentCachedFile, DefaultProperty)
      .filter(p => !p.isAbstract)
      .find(property => property.aspectModelUrn === newValue.urn);

    if (!property) {
      property = this.loadedFiles.findElementOnExtReferences<Property>(newValue.urn);
    }

    this.displayModel.set(newValue.name);
    this.outputModel.set(property);
    this.signalForm().set('outputValue', property);
    this.locked.set(true);
  }

  createNewProperty(propertyName: string) {
    if (!this.isLowerCase(propertyName)) {
      return;
    }

    const urn = `${this.metaModelElement.aspectModelUrn.split('#')?.[0]}#${propertyName}`;
    const newProperty = new DefaultProperty({
      metaModelVersion: this.metaModelElement.metaModelVersion,
      aspectModelUrn: urn,
      name: propertyName,
    });
    this.displayModel.set(propertyName);
    this.outputModel.set(newProperty);
    this.signalForm().set('outputValue', newProperty);
    this.locked.set(true);
  }

  unlockOutput() {
    this.locked.set(false);
    this.displayModel.set('');
    this.outputModel.set(null);
    this.signalForm().set('outputValue', null);
    this.displayField().markAsTouched();
  }

  hasError(kind: string): boolean {
    return this.displayField()
      .errors()
      .some(error => error.kind === kind);
  }
}
