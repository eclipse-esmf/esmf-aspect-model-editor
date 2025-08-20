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

import {CacheUtils, LoadedFilesService} from '@ame/cache';
import {MxGraphHelper, MxGraphService} from '@ame/mx-graph';
import {SearchService, mxCellSearchOption, unitSearchOption} from '@ame/shared';
import {Directive, Input, OnChanges, OnDestroy, SimpleChanges, inject} from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import {
  DefaultCharacteristic,
  DefaultConstraint,
  DefaultEntity,
  DefaultProperty,
  DefaultUnit,
  HasExtends,
  NamedElement,
  Unit,
} from '@esmf/aspect-model-loader';
import {mxgraph} from 'mxgraph-factory';
import {Observable, Subscription, of, startWith} from 'rxjs';
import {filter, map, tap} from 'rxjs/operators';
import {EditorModelService} from '../../editor-model.service';
import {PreviousFormDataSnapshot} from '../../interfaces';

interface FilteredType {
  name: string;
  description: string;
  urn: string;
  namespace?: string;
  complex?: boolean;
}

@Directive()
export abstract class InputFieldComponent<T extends NamedElement> implements OnDestroy, OnChanges {
  @Input() public parentForm: FormGroup;
  @Input() previousData: PreviousFormDataSnapshot = {};

  public metaModelDialogService = inject(EditorModelService);
  public searchService = inject(SearchService);
  public mxGraphService = inject(MxGraphService);
  public loadedFiles = inject(LoadedFilesService);

  public metaModelElement: T;
  public subscription: Subscription = new Subscription();
  public formSubscription: Subscription = new Subscription(); // subscriptions from form controls are added here
  public frozen: boolean;
  protected resetFormOnDestroy = true;
  protected fieldName: string = null;

  get currentCachedFile() {
    return this.loadedFiles.currentLoadedFile.cachedFile;
  }

  get elementExtends() {
    return this.metaModelElement as any as HasExtends;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getCurrentValue(key: string, _locale?: string) {
    if (this.metaModelElement?.isPredefined) {
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
      }),
    );
  }

  cleanSubscriptions() {
    this.formSubscription.unsubscribe();
    this.formSubscription = new Subscription();
  }

  initFilteredEntities(control: FormControl, disabled = false) {
    return disabled
      ? of([])
      : control?.valueChanges.pipe(
          startWith(''),
          filter(value => value !== null),
          map((value: string) => {
            const entities = CacheUtils.getCachedElements(this.currentCachedFile, DefaultEntity)
              .filter(e => !e.isAbstractEntity())
              ?.map(entity => ({
                name: entity.name,
                description: entity.getDescription('en') || '',
                urn: entity.getUrn(),
                complex: true,
                entity,
              }));

            return [...entities, ...this.searchExtEntity(value)]?.filter(type => this.inSearchList(type, value));
          }),
          startWith([]),
        );
  }

  initFilteredAbstractEntities(control: FormControl, disabled = false) {
    return disabled
      ? of([])
      : control?.valueChanges.pipe(
          startWith(''),
          filter(value => value !== null),
          map((value: string) => {
            const entities = CacheUtils.getCachedElements(this.currentCachedFile, DefaultEntity)
              .filter(e => e.isAbstractEntity())
              ?.map(abstractEntity => ({
                name: abstractEntity.name,
                description: abstractEntity.getDescription('en') || '',
                urn: abstractEntity.getUrn(),
                complex: true,
                entity: abstractEntity,
              }));

            return [...entities, ...this.searchExtAbstractEntity(value)]?.filter(type => this.inSearchList(type, value));
          }),
          startWith([]),
        );
  }

  initFilteredPropertyTypes(control: FormControl): Observable<any> {
    return control?.valueChanges.pipe(
      startWith(''),
      filter(value => value !== null),
      map((value: string) => {
        const properties: Array<any> = CacheUtils.getCachedElements(this.currentCachedFile, DefaultProperty)
          .filter(e => !e.isAbstract)
          ?.map(property => ({
            name: property.name,
            description: property.getDescription('en') || '',
            urn: property.aspectModelUrn,
          }));
        return [...properties, ...this.searchExtProperty(value)]?.filter(type => this.inSearchList(type, value));
      }),
      startWith([]),
    );
  }

  initFilteredAbstractPropertyTypes(control: FormControl): Observable<any> {
    return control?.valueChanges.pipe(
      startWith(''),
      filter(value => value !== null),
      map((value: string) => {
        const properties: Array<any> = CacheUtils.getCachedElements(this.currentCachedFile, DefaultProperty)
          .filter(e => e.isAbstract)
          ?.map(property => ({
            name: property.name,
            description: property.getDescription('en') || '',
            urn: property.aspectModelUrn,
          }));
        return [...properties, ...this.searchExtProperty(value)]?.filter(type => this.inSearchList(type, value));
      }),
      startWith([]),
    );
  }

  initFilteredCharacteristicTypes(control: FormControl, elementAspectUrn: string): Observable<any> {
    return control?.valueChanges.pipe(
      startWith(''),
      filter(value => value !== null),
      map((value: string) => {
        const characteristics: Array<any> = CacheUtils.getCachedElements(this.currentCachedFile, DefaultCharacteristic)
          ?.map(cachedCharacteristic => ({
            name: cachedCharacteristic.name,
            description: cachedCharacteristic.getDescription('en') || '',
            urn: cachedCharacteristic.aspectModelUrn,
          }))
          .filter(char => char.urn !== elementAspectUrn);

        return [...characteristics, ...this.searchExtCharacteristic(value)]?.filter(type => this.inSearchList(type, value));
      }),
      startWith([]),
    );
  }

  initFilteredUnits(control: FormControl, searchService: SearchService) {
    const units = CacheUtils.getCachedElements(this.currentCachedFile, DefaultUnit);
    return control?.valueChanges.pipe(
      startWith(''),
      filter(value => value !== null),
      map((value: string) => {
        if (!value) {
          return units;
        }
        return searchService.search<DefaultUnit>(value, units, unitSearchOption);
      }),
      startWith(units),
    );
  }

  initFilteredPredefinedUnits(control: FormControl, units: Array<Unit>, searchService: SearchService) {
    return control?.valueChanges.pipe(
      filter(value => value !== null),
      map((value: string) => {
        if (!value) {
          return units;
        }
        return searchService.search<Unit>(value, units, unitSearchOption);
      }),
      startWith(units),
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

  searchExtProperty(value: string): FilteredType[] {
    return this.searchExtElement(value)
      ?.map((cell: mxgraph.mxCell) => {
        const modelElement = MxGraphHelper.getModelElement(cell);
        if (this.loadedFiles.isElementExtern(modelElement) && modelElement instanceof DefaultProperty) {
          return {
            name: modelElement.name,
            description: modelElement.getDescription('en') || '',
            urn: modelElement.aspectModelUrn,
            namespace: modelElement.aspectModelUrn.split('#')[0],
          };
        }
        return null;
      })
      .filter(cell => cell);
  }

  searchExtCharacteristic(value: string): FilteredType[] {
    return this.searchExtElement(value)
      ?.map((cell: mxgraph.mxCell) => {
        const modelElement = MxGraphHelper.getModelElement(cell);
        if (this.loadedFiles.isElementExtern(modelElement) && modelElement instanceof DefaultCharacteristic) {
          return {
            name: modelElement.name,
            description: modelElement.getDescription('en') || '',
            urn: modelElement.aspectModelUrn,
            namespace: modelElement.aspectModelUrn.split('#')[0],
          };
        }
        return null;
      })
      .filter(cell => cell);
  }

  searchExtEntity(value: string): FilteredType[] {
    return this.searchExtElement(value)
      ?.map((cell: mxgraph.mxCell) => {
        const modelElement = MxGraphHelper.getModelElement(cell);
        if (this.loadedFiles.isElementExtern(modelElement) && modelElement instanceof DefaultEntity) {
          return {
            name: modelElement.name,
            description: modelElement.getDescription('en') || '',
            urn: modelElement.aspectModelUrn,
            namespace: modelElement.aspectModelUrn.split('#')[0],
            complex: true,
          };
        }
        return null;
      })
      .filter(cell => cell);
  }

  searchExtAbstractEntity(value: string): FilteredType[] {
    return this.searchExtElement(value)
      ?.map((cell: mxgraph.mxCell) => {
        const modelElement = MxGraphHelper.getModelElement(cell);
        if (this.loadedFiles.isElementExtern(modelElement) && modelElement instanceof DefaultEntity && modelElement.isAbstractEntity()) {
          return {
            name: modelElement.name,
            description: modelElement.getDescription('en') || '',
            urn: modelElement.aspectModelUrn,
            namespace: modelElement.aspectModelUrn.split('#')[0],
            complex: true,
          };
        }
        return null;
      })
      .filter(cell => cell);
  }

  enableWhenEmpty(currentControl: () => FormControl, dependantControlKey: string) {
    const subscription = this.parentForm.valueChanges.subscribe(() => {
      const charElementControl = this.parentForm.get(dependantControlKey);
      if (!charElementControl) {
        return;
      }

      if (charElementControl.value && currentControl().enabled) {
        currentControl().disable();
        this.frozen = true;
      }

      const charElementSubscription = charElementControl.valueChanges.subscribe(value => {
        this.frozen = !!value;
        this.frozen ? currentControl().disable() : currentControl().enable();
      });

      subscription.unsubscribe();
      this.formSubscription.add(charElementSubscription);
    });

    this.formSubscription.add(subscription);
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

  private searchExtElement(value: string): mxgraph.mxCell[] {
    return this.searchService.search<mxgraph.mxCell>(value, this.mxGraphService.getAllCells(), mxCellSearchOption);
  }
}
