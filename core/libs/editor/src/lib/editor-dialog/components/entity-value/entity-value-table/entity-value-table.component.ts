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

import {ChangeDetectorRef, Component, OnChanges, OnInit, OnDestroy, SimpleChanges} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {
  BaseMetaModelElement,
  DefaultEntity,
  DefaultEntityValue,
  DefaultProperty,
  DefaultTrait,
  EntityValueProperty,
  OverWrittenProperty,
  Property,
} from '@ame/meta-model';
import {EditorModelService, FormFieldHelper} from '@ame/editor';
import {InputFieldComponent} from '../../fields';
import {NamespacesCacheService} from '@ame/cache';
import {MatTableDataSource} from '@angular/material/table';
import {map, Observable, startWith} from 'rxjs';

@Component({
  selector: 'ame-entity-value-table',
  templateUrl: './entity-value-table.component.html',
  styleUrls: ['./entity-value-table.component.scss'],
})
export class EntityValueTableComponent extends InputFieldComponent<DefaultEntityValue> implements OnInit, OnChanges, OnDestroy {
  public propertiesFormGroup: FormGroup = new FormGroup({});
  public dataSource: MatTableDataSource<DefaultProperty>;

  public filteredEntityValues$: {[key: string]: Observable<any[]>} = {};

  // only used for displaying the name of an entity value within an input as string
  public displayFormGroup = new FormGroup({});

  public readonly displayedColumns = ['key', 'value'];

  constructor(
    public metaModelDialogService: EditorModelService,
    public namespacesCacheService: NamespacesCacheService,
    private changeDetector: ChangeDetectorRef
  ) {
    super(metaModelDialogService);
  }

  ngOnInit(): void {
    this.subscription.add(
      this.getMetaModelData().subscribe((metaModelElement: BaseMetaModelElement) => {
        this.metaModelElement = metaModelElement as DefaultEntityValue;
        this.parentForm.setControl('entityValueProperties', this.propertiesFormGroup);

        const {properties, entity}: {properties: EntityValueProperty[]; entity: DefaultEntity} = this.metaModelElement;
        if (!properties.length && entity.allProperties.length) {
          for (const property of entity.allProperties) {
            this.metaModelElement.addProperty(property);
          }
        }

        this.metaModelElement.properties.forEach(property => {
          this.propertiesFormGroup.setControl(
            property.key.property.name,
            new FormControl(property.value, property.key.keys.optional ? null : Validators.required)
          );

          const propertyValue = property.value instanceof DefaultEntityValue ? property.value['name'] : null;

          this.displayFormGroup.setControl(
            property.key.property.name,
            new FormControl(propertyValue, property.key.keys.optional ? null : Validators.required)
          );

          this.initFilteredEntityValues(property.key.property);
          if (propertyValue) {
            this.displayFormGroup.get(property.key.property.name).disable();
          }
        });

        this.dataSource = new MatTableDataSource(this.metaModelElement.properties.map(({key}) => key.property));
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.hasOwnProperty('parentForm') && this.parentForm) {
      this.parentForm.setControl('entityValueProperties', this.propertiesFormGroup);
    }
  }

  isComplexProperty(property: Property) {
    return FormFieldHelper.isComplexProperty(property);
  }

  isEnumerationProperty(property: DefaultProperty) {
    return FormFieldHelper.isEnumerationProperty(property);
  }

  // get the dropdown suggestions for creating a new entity value for a complex property (not enumeration)
  getPropertyValues(property: Property): DefaultEntityValue[] {
    const entityValueFilter = (entityValue: DefaultEntityValue) => {
      const characteristic =
        property?.characteristic instanceof DefaultTrait ? property.characteristic.baseCharacteristic : property.characteristic;
      return entityValue.entity.aspectModelUrn === characteristic?.dataType?.['aspectModelUrn'];
    };
    const existingEntityValues = this.namespacesCacheService.getCurrentCachedFile().getCachedEntityValues().filter(entityValueFilter);
    const newEntityValues = this.parentForm.get('newEntityValues')?.value?.filter(entityValueFilter) || [];
    return [...existingEntityValues, ...newEntityValues];
  }

  showCreateNewEntityOption(entityValueName: string, entityValues: DefaultEntityValue[]): boolean {
    if (
      entityValueName &&
      entityValueName !== this.parentForm.get('name')?.value &&
      (entityValues.length === 0 || !entityValues.some(ev => ev.name === entityValueName)) &&
      entityValueName.indexOf(' ') < 0
    ) {
      const namespace = this.metaModelElement.entity.aspectModelUrn.split('#')[0];
      return (
        !this.namespacesCacheService.getCurrentCachedFile().getCachedElement(`${namespace}#${entityValueName}`) &&
        !this.parentForm.get('newEntityValues')?.value?.some(ev => ev.name === entityValueName)
      );
    }
    return false;
  }

  changeSelection(property, propertyValue) {
    this.displayFormGroup.get(property.name).setValue(propertyValue.name);
    this.displayFormGroup.get(property.name).disable();
    this.propertiesFormGroup.get(property.name).setValue(propertyValue);
    this.changeDetector.detectChanges();
  }

  getControl(propertyControlName: string): FormControl {
    return this.propertiesFormGroup.get(propertyControlName) as FormControl;
  }

  getComplexDisplayControl(propertyControlName: string): FormControl {
    return this.displayFormGroup.get(propertyControlName) as FormControl;
  }

  unlockEntityValue(property: Property) {
    this.getComplexDisplayControl(property.name).enable();
    this.getComplexDisplayControl(property.name).patchValue('');
    const removedEntityValue = this.propertiesFormGroup.get(property.name).value;
    if (this.parentForm.get('newEntityValues')?.value?.includes(removedEntityValue)) {
      this.parentForm
        .get('newEntityValues')
        .setValue(this.parentForm.get('newEntityValues')?.value.filter(ev => ev !== removedEntityValue));
    }
    this.propertiesFormGroup.get(property.name).patchValue(null);
  }

  createNewEntityValue(property, entityValueName) {
    const characteristic =
      property?.characteristic instanceof DefaultTrait ? property.characteristic.baseCharacteristic : property.characteristic;
    const urn = `${property.aspectModelUrn.split('#')?.[0]}#${entityValueName}`;
    const newEntityValue = new DefaultEntityValue(
      property.metaModelVersion,
      entityValueName,
      urn,
      characteristic?.dataType as DefaultEntity,
      (characteristic?.dataType?.['properties'] as OverWrittenProperty[]) || []
    );
    this.propertiesFormGroup.get(property.name).setValue(newEntityValue);
    if (this.parentForm.get('newEntityValues')?.value) {
      const newEntityValues = this.parentForm.get('newEntityValues').value;
      this.parentForm.get('newEntityValues').setValue([...newEntityValues, newEntityValue]);
    } else {
      this.parentForm.setControl('newEntityValues', new FormControl([newEntityValue]));
    }
    this.getComplexDisplayControl(property.name).disable();
  }

  // initialize the observables for the dropdown options for a specific property
  private initFilteredEntityValues(property: Property) {
    const entityValues = this.getPropertyValues(property);

    this.filteredEntityValues$[property.name] = this.getComplexDisplayControl(property.name)?.valueChanges.pipe(
      map(
        (value: string) => this.getPropertyValues(property).filter(entityValue => entityValue.name.startsWith(value)),
        startWith(entityValues)
      )
    );
  }
}
