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
import {Directive, Input, OnChanges, OnDestroy, SimpleChanges} from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import {EditorModelService} from '../../editor-model.service';
import {Observable, startWith, Subscription} from 'rxjs';
import {map, tap} from 'rxjs/operators';
import {BaseMetaModelElement, DefaultCharacteristic, DefaultConstraint, DefaultUnit, Unit} from '@ame/meta-model';
import {NamespacesCacheService} from '@ame/cache';
import {PreviousFormDataSnapshot} from '../../interfaces';
import {SearchService, unitSearchOption} from '@ame/shared';

interface FilteredType {
  name: string;
  description: string;
  urn: string;
}

@Directive()
export abstract class InputFieldComponent<T extends BaseMetaModelElement> implements OnDestroy, OnChanges {
  @Input() public parentForm: FormGroup;
  @Input() previousData: PreviousFormDataSnapshot = {};

  public metaModelElement: T;
  public subscription: Subscription = new Subscription();
  public formSubscription: Subscription = new Subscription(); // subscriptions from form controls are added here
  protected resetFormOnDestroy = true;
  protected fieldName: string = null;

  get currentCachedFile() {
    return this.namespacesCacheService.getCurrentCachedFile();
  }

  protected constructor(public metaModelDialogService: EditorModelService, public namespacesCacheService?: NamespacesCacheService) {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getCurrentValue(key: string, _locale?: string) {
    if (this.metaModelElement instanceof DefaultCharacteristic && this.metaModelElement?.isPredefined()) {
      return this.metaModelElement?.[key] || '';
    }

    return this.previousData?.[key] || this.metaModelElement?.[key] || '';
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ngOnChanges(_changes: SimpleChanges) {
    if (
      !this.fieldName ||
      !(this.metaModelElement instanceof DefaultCharacteristic || this.metaModelElement instanceof DefaultConstraint)
    ) {
      return;
    }

    const multiLanguageFields = ['description', 'preferredName'];

    for (const key in this.previousData) {
      if (key.startsWith(this.fieldName) && multiLanguageFields.includes(this.fieldName)) {
        const locale = key.substr(0, this.fieldName.length);
        this.parentForm.get(key)?.patchValue(this.getCurrentValue(key, locale));
      }

      if (key === this.fieldName) {
        this.parentForm.get(key)?.setValue(this.getCurrentValue(key));
      }
    }
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
    this.cleanSubscriptions();
    this.resetFormOnDestroy && this.resetForm();
  }

  getControl(path: string | string[]): FormControl {
    return this.parentForm.get(path) as FormControl;
  }

  getMetaModelData() {
    return this.metaModelDialogService.getMetaModelElement().pipe(
      tap(metaModelElement => {
        this.metaModelElement = <T>metaModelElement;
      })
    );
  }

  cleanSubscriptions() {
    this.formSubscription.unsubscribe();
    this.formSubscription = new Subscription();
  }

  private resetForm() {
    if (!this.parentForm) {
      return;
    }
    // we need to keep the meta model changed form field
    const changedMetaModel = this.parentForm.value.changedMetaModel;
    if (changedMetaModel) {
      return;
    }
    Object.keys(this.parentForm.controls).forEach((key: string) => {
      if (key === 'changedMetaModel') {
        return;
      }
      this.parentForm.setControl(key, new FormControl());
    });
    this.parentForm.reset();
    this.parentForm.setControl('changedMetaModel', new FormControl());
  }

  initFilteredPropertyTypes(control: FormControl): Observable<Array<FilteredType>> {
    return control?.valueChanges.pipe(
      map((value: string) => {
        const properties: Array<FilteredType> = this.currentCachedFile.getCachedProperties()?.map(property => ({
          name: property.name,
          description: property.getDescription('en') || '',
          urn: property.aspectModelUrn,
        }));

        return value ? properties?.filter(type => this.inSearchList(type, value)) : properties;
      }),
      startWith([])
    );
  }

  initFilteredCharacteristicTypes(control: FormControl, elementAspectUrn: string): Observable<Array<FilteredType>> {
    return control?.valueChanges.pipe(
      map((value: string) => {
        const characteristics: Array<FilteredType> = this.currentCachedFile
          .getCachedCharacteristics()
          ?.map(cachedCharacteristic => ({
            name: cachedCharacteristic.name,
            description: cachedCharacteristic.getDescription('en') || '',
            urn: cachedCharacteristic.aspectModelUrn,
          }))
          .filter(char => char.urn !== elementAspectUrn);

        return value ? characteristics?.filter(type => this.inSearchList(type, value)) : characteristics;
      }),
      startWith([])
    );
  }

  initFilteredUnits(control: FormControl, searchService: SearchService) {
    const units = this.currentCachedFile.getCachedUnits();
    return control?.valueChanges.pipe(
      map((value: string) => {
        if (!value) {
          return units;
        }
        return searchService
          .search<DefaultUnit>(value, units, unitSearchOption);
      }),
      startWith(units)
    );
  }

  initFilteredPredefinedUnits(control: FormControl, units: Array<Unit>, searchService: SearchService) {
    return control?.valueChanges.pipe(
      map((value: string) => {
        if (!value) {
          return units;
        }
        return searchService
          .search<Unit>(value, units, unitSearchOption);
      }),
      startWith(units)
    );
  }

  inSearchList(type, value: string) {
    return !!(
      type.name?.toLowerCase().includes(value?.toLowerCase()) ||
      type.description?.toLowerCase().includes(value?.toLowerCase()) ||
      !value
    );
  }

  isLowerCase(value: string) {
    return /[a-z]/.test(value);
  }

  isUpperCase(value: string) {
    return /^(\b[A-Z]+[a-zA-Z0-9]*)$/.test(value); //NOSONAR
  }

  isAlreadyDefined(filteredType: any, value: string) {
    return Object.values(filteredType).some((type: any) => type.name === value);
  }
}
