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

import {FormControl, FormGroup} from '@angular/forms';
import {
  DefaultAbstractProperty,
  DefaultEntity,
  DefaultEntityValue,
  DefaultProperty,
  DefaultTrait,
  Entity,
  OverWrittenProperty,
  Property,
} from '@ame/meta-model';
import {CachedFile} from '@ame/cache';
import {Observable} from 'rxjs';
import {extractNamespace} from '@ame/utils';
import {isDataTypeLangString} from '@ame/shared';

export class EntityValueUtil {
  /**
   * Initializes filtered entity values as an observable from a given form control.
   * @param {Property} property - The property to initialize values for.
   * @param {FormGroup} form - The form group containing the control.
   * @returns {Observable<string>} An observable of the form control's value changes.
   */
  static initFilteredEntityValues(property: Property, form: FormGroup): Observable<string> {
    return EntityValueUtil.getDisplayControl(form, property.name).valueChanges;
  }

  /**
   * Initializes filtered languages as an observable from a given form control.
   * @param {Property} property - The property related to language control.
   * @param {FormGroup} form - The form group containing the language control.
   * @returns {Observable<string>} An observable of the language control's value changes.
   */
  static initFilteredLanguages(property: Property, form: FormGroup): Observable<string> {
    return EntityValueUtil.getDisplayControl(form, `${property.name}-lang`)?.valueChanges;
  }

  /**
   * Retrieves a FormControl from a FormGroup, or creates a new one if it doesn't exist.
   * @param {FormGroup} form - The form group to search within.
   * @param {string} controlName - The name of the form control to retrieve.
   * @returns {FormControl} The retrieved or newly created form control.
   */
  static getDisplayControl(form: FormGroup, controlName: string): FormControl {
    let formControl = form.get(controlName) as FormControl;

    if (!formControl) {
      formControl = new FormControl(null);
      form.setControl(controlName, formControl);
    }

    return formControl;
  }

  /**
   * Retrieves existing entity values from the cached file that match a given property.
   * @param {CachedFile} currentCachedFile - The file containing cached entity values.
   * @param {DefaultProperty} property - The property to match against the cached values.
   * @returns {DefaultEntityValue[]} An array of entity values that match the given property.
   */
  static existingEntityValues = (currentCachedFile: CachedFile, property: DefaultProperty) => {
    return currentCachedFile.getCachedEntityValues().filter(value => this.entityValueFilter(value, property));
  };

  /**
   * Retrieves entity values from a form control that match a given property.
   * @param {FormGroup} form - The form containing the entity values.
   * @param {DefaultProperty} property - The property to match against the form values.
   * @returns {DefaultEntityValue[]} An array of entity values that match the given property.
   */
  static entityValues = (form: FormGroup, property: DefaultProperty) => {
    return form.get('newEntityValues')?.value?.filter(val => this.entityValueFilter(val, property)) || [];
  };

  private static entityValueFilter = (entityValue: DefaultEntityValue, property?: DefaultProperty) => {
    const characteristic =
      property?.characteristic instanceof DefaultTrait ? property.characteristic.baseCharacteristic : property?.characteristic;

    return entityValue.entity.aspectModelUrn === characteristic?.dataType?.['aspectModelUrn'];
  };

  /**
   * Determines whether the option to create a new entity should be shown.
   * @param {string} entityValueName - The name of the entity value.
   * @param {DefaultEntityValue[]} entityValues - Array of existing entity values.
   * @param {CachedFile} currentCachedFile - The file containing cached entity values.
   * @param {FormGroup} form - The form group associated with the entity.
   * @param {Entity} entity - The entity being evaluated.
   * @returns {boolean} True if the option to create a new entity should be shown, false otherwise.
   */
  static showCreateNewEntityOption(
    entityValueName: string,
    entityValues: DefaultEntityValue[],
    currentCachedFile: CachedFile,
    form: FormGroup,
    entity: Entity
  ): boolean {
    if (!this.isEntityNameValid(entityValueName, form, entityValues)) {
      return false;
    }

    const namespace = extractNamespace(entity.aspectModelUrn);

    return this.isEntityValueAvailable(entityValueName, namespace, currentCachedFile, form);
  }

  private static isEntityNameValid(entityValueName: string, form: FormGroup, entityValues: DefaultEntityValue[]): boolean {
    return (
      entityValueName &&
      entityValueName !== form.get('name')?.value &&
      (entityValues.length === 0 || !entityValues.some(ev => ev.name === entityValueName)) &&
      !entityValueName.includes(' ')
    );
  }

  private static isEntityValueAvailable(
    entityValueName: string,
    namespace: string,
    currentCachedFile: CachedFile,
    form: FormGroup
  ): boolean {
    return (
      !currentCachedFile.getElement(`${namespace}#${entityValueName}`) &&
      !form.get('newEntityValues')?.value?.some(ev => ev.name === entityValueName)
    );
  }

  /**
   * Updates form control values based on a property value change.
   * @param {FormGroup} displayedForm - The form displaying the property values.
   * @param {FormGroup} propertiesForm - The form containing the property values.
   * @param {string} controlName - The name of the control to update.
   * @param {any} propertyValue - The new value for the property.
   */
  static changeSelection(displayedForm: FormGroup, propertiesForm: FormGroup, controlName: string, propertyValue: any): void {
    displayedForm.get(controlName).setValue(propertyValue.name ? propertyValue.name : propertyValue);
    displayedForm.get(controlName).disable();
    propertiesForm.get(controlName).setValue(propertyValue);
  }

  /**
   * Unlocks the entity value for editing and updates relevant form controls.
   * @param {FormGroup} displayedFormGroup - The displayed form group where the control is unlocked.
   * @param {FormGroup} form - The main form group containing entity value properties.
   * @param {string} controlName - The name of the control to unlock.
   */
  static unlockEntityValue(displayedFormGroup: FormGroup, form: FormGroup, controlName: string) {
    const displayControl = this.getDisplayControl(displayedFormGroup, controlName);

    const propertyForm = form.get('properties') || form.get('entityValueProperties');
    const removedEntityValue = propertyForm.get(controlName).value;

    displayControl.enable();
    displayControl.patchValue('');

    propertyForm.get(controlName).patchValue(null);

    const newEntityValues = form.get('newEntityValues');

    if (newEntityValues?.value?.includes(removedEntityValue)) {
      newEntityValues.setValue(newEntityValues.value.filter(ev => ev !== removedEntityValue));
    }
  }

  /**
   * Creates a new entity value and updates the form controls accordingly.
   * @param {FormGroup} displayedForm - The form displaying the entity values.
   * @param {FormGroup} form - The form containing the entity value properties.
   * @param {any} property - The property for which to create a new entity value.
   * @param {any} entityValueName - The name of the new entity value.
   */
  static createNewEntityValue(displayedForm: FormGroup, form: FormGroup, property: any, entityValueName: any) {
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

    const newEntityValues = form.get('newEntityValues');
    if (newEntityValues?.value) {
      newEntityValues.setValue([...newEntityValues.value, newEntityValue]);
    } else {
      form.setControl('newEntityValues', new FormControl([newEntityValue]));
    }

    (form.get('properties') || form.get('entityValueProperties')).get(property.name).patchValue(newEntityValue);

    EntityValueUtil.getDisplayControl(displayedForm, property.name).disable();
  }

  /**
   * Checks if a given property is a default property with a language string.
   * @param {OverWrittenProperty<DefaultProperty | DefaultAbstractProperty>} element - The property to check.
   * @returns {boolean} True if the property is a default property with a language string, false otherwise.
   */
  static isDefaultPropertyWithLangString(element: OverWrittenProperty<DefaultProperty | DefaultAbstractProperty>): boolean {
    return element.property instanceof DefaultProperty && isDataTypeLangString(element.property);
  }
}
