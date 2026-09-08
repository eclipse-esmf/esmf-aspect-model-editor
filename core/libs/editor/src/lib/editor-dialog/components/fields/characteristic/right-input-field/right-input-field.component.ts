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
import {RdfService} from '@ame/rdf/services';
import {NotificationsService} from '@ame/shared';
import {Component, computed, inject, OnDestroy, OnInit, signal, Signal} from '@angular/core';
import {rxResource, takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {disabled, form, FormField, required, validateAsync} from '@angular/forms/signals';
import {MatAutocomplete, MatAutocompleteTrigger, MatOption} from '@angular/material/autocomplete';
import {MatIconButton} from '@angular/material/button';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatError, MatInput, MatLabel} from '@angular/material/input';
import {Characteristic, DefaultCharacteristic, DefaultEither} from '@esmf/aspect-model-loader';
import {TranslocoDirective} from '@jsverse/transloco';
import {of} from 'rxjs';
import {EditorDialogValidators} from '../../../../validators';
import {InputFieldComponent} from '../../input-field.component';

export interface RightCharacteristicOption {
  name: string;
  description: string;
  urn: string;
  namespace?: string;
}

@Component({
  selector: 'ame-right-input-field',
  templateUrl: './right-input-field.component.html',
  styleUrls: ['../../field.scss'],
  imports: [
    MatFormFieldModule,
    MatLabel,
    MatAutocompleteTrigger,
    MatInput,
    FormField,
    MatIconModule,
    MatAutocomplete,
    MatIconButton,
    MatOption,
    MatError,
    TranslocoDirective,
  ],
})
export class RightInputFieldComponent extends InputFieldComponent<DefaultEither> implements OnInit, OnDestroy {
  private notificationsService = inject(NotificationsService);
  private validators = inject(EditorDialogValidators);
  public rdfService = inject(RdfService);

  private readonly displayModel = signal('');
  private readonly characteristicModel = signal<Characteristic | null>(null);
  private readonly locked = signal(false);
  private readonly blocked = signal(false);
  private unregisterDisplay = () => undefined;

  private readonly createDuplicateNameResource = (name: Signal<string>) =>
    rxResource({
      params: () => name(),
      stream: ({params}) =>
        this.metaModelElement
          ? this.validators.duplicateNameWithDifferentTypeValue(params, this.metaModelElement, DefaultCharacteristic)
          : of(null),
    });

  readonly displayField = form(this.displayModel, path => {
    required(path);
    validateAsync(path, {
      params: ({value}) => value(),
      factory: this.createDuplicateNameResource,
      onSuccess: result => {
        const kind = result?.['checkShapeNameExtRef'] ? 'checkShapeNameExtRef' : result?.['checkShapeName'] ? 'checkShapeName' : undefined;
        return kind ? {kind, message: 'Characteristic name is already used by another type'} : null;
      },
      onError: () => ({kind: 'duplicateNameValidation', message: 'Characteristic name could not be validated'}),
    });
    disabled(path, {when: () => this.locked() || this.blocked()});
  });
  readonly displayValue = this.displayModel.asReadonly();
  readonly filteredCharacteristicTypes = computed<RightCharacteristicOption[]>(() => {
    const value = this.displayModel();
    const leftUrn = (this.signalForm()?.get('leftCharacteristic') as Characteristic)?.aspectModelUrn;
    const local = CacheUtils.getCachedElements(this.currentCachedFile, DefaultCharacteristic)
      .filter(characteristic => characteristic.aspectModelUrn !== this.metaModelElement?.aspectModelUrn)
      .map(characteristic => ({
        name: characteristic.name,
        description: characteristic.getDescription('en') || '',
        urn: characteristic.aspectModelUrn,
      }));
    return [...local, ...this.searchExtCharacteristic(value)].filter(option => option.urn !== leftUrn && this.inSearchList(option, value));
  });

  constructor() {
    super();
    this.fieldName = 'rightCharacteristic';
  }

  getCurrentValue() {
    return this.previousData()?.[this.fieldName] || this.metaModelElement?.right || null;
  }

  ngOnInit(): void {
    this.getMetaModelData()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.setRightControl());
  }

  ngOnDestroy() {
    this.unregisterDisplay();
    this.signalForm().remove('rightCharacteristic');
    super.ngOnDestroy();
  }

  setRightControl() {
    const eitherRight = this.getCurrentValue();
    const value = eitherRight?.name || '';

    this.blocked.set(this.loadedFiles.isElementExtern(this.metaModelElement));
    this.locked.set(!!value);
    this.displayModel.set(value);
    this.characteristicModel.set(eitherRight);
    this.unregisterDisplay = this.signalForm().register('right', this.displayField);
    this.signalForm().set('rightCharacteristic', eitherRight);
  }

  onSelectionChange(fieldPath: string, newValue: RightCharacteristicOption | null) {
    if (fieldPath !== 'right') {
      return;
    }

    if (newValue === null) {
      return; // happens on reset form
    }

    let defaultCharacteristic = CacheUtils.getCachedElements(this.currentCachedFile, DefaultCharacteristic).find(
      characteristic => characteristic.aspectModelUrn === newValue.urn,
    );

    if (!defaultCharacteristic) {
      defaultCharacteristic = this.loadedFiles.findElementOnExtReferences<Characteristic>(newValue.urn);
    }

    if (defaultCharacteristic) this.selectCharacteristic(defaultCharacteristic, newValue.name);
  }

  createNewCharacteristic(characteristicName: string) {
    if (!this.isUpperCase(characteristicName)) {
      return;
    }

    const urn = `${this.metaModelElement.aspectModelUrn.split('#')?.[0]}#${characteristicName}`;

    if (this.metaModelElement.aspectModelUrn === urn || this.signalForm().get('name') === characteristicName) {
      this.notificationsService.error({title: 'Element right cannot link itself'});
      this.displayModel.set('');
      return;
    }

    if (characteristicName === (this.signalForm().get('leftCharacteristic') as Characteristic)?.name) {
      this.notificationsService.error({title: 'Element right cannot point to the same characteristic as the left element.'});
      this.displayModel.set('');
      return;
    }

    const newCharacteristic = new DefaultCharacteristic({
      metaModelVersion: this.metaModelElement.metaModelVersion,
      aspectModelUrn: urn,
      name: characteristicName,
    });
    this.selectCharacteristic(newCharacteristic, characteristicName);
  }

  unlockRight() {
    this.locked.set(false);
    this.displayModel.set('');
    this.characteristicModel.set(null);
    this.signalForm().set('rightCharacteristic', null);
    this.displayField().markAsTouched();
  }

  hasError(kind: string): boolean {
    return this.displayField()
      .errors()
      .some(error => error.kind === kind);
  }

  private selectCharacteristic(characteristic: Characteristic, name: string): void {
    this.displayModel.set(name);
    this.characteristicModel.set(characteristic);
    this.signalForm().set('rightCharacteristic', characteristic);
    this.locked.set(true);
  }
}
