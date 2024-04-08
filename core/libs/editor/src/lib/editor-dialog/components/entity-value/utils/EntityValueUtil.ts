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

import {FormArray, FormControl, FormGroup} from '@angular/forms';
import {
  DefaultAbstractProperty,
  DefaultEntity,
  DefaultEntityValue,
  DefaultProperty,
  DefaultTrait,
  Entity,
  EntityValueProperty,
  OverWrittenProperty,
} from '@ame/meta-model';
import {CachedFile} from '@ame/cache';
import {extractNamespace} from '@ame/utils';
import {isDataTypeLangString} from '@ame/shared';

export class EntityValueUtil {
  /**
   * Ensures a FormArray exists for a given control name within a FormGroup. If the control does not exist or is not a FormArray,
   * a new FormArray is created and assigned to the control name. This method is useful for dynamically adding controls to a form.
   *
   * @param {FormGroup} form - The FormGroup to search within or modify.
   * @param {string} controlName - The name of the FormArray control to retrieve or initialize.
   * @returns {FormArray} The existing or newly created FormArray for the specified control name.
   */
  static getDisplayControl(form: FormGroup, controlName: string): FormArray {
    let control = form.get(controlName);
    if (!(control instanceof FormArray)) {
      control = new FormArray([]);
      form.setControl(controlName, control);
    }

    return control as FormArray;
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
   * @param {Entity | DefaultEntityValue} entity - The entity | entity value being evaluated.
   * @returns {boolean} True if the option to create a new entity should be shown, false otherwise.
   */
  static showCreateNewEntityOption(
    entityValueName: string,
    entityValues: DefaultEntityValue[],
    currentCachedFile: CachedFile,
    form: FormGroup,
    entity: Entity | DefaultEntityValue,
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
    form: FormGroup,
  ): boolean {
    return (
      !currentCachedFile.getElement(`${namespace}#${entityValueName}`) &&
      !form.get('newEntityValues')?.value?.some(ev => ev.name === entityValueName)
    );
  }

  /**
   * Updates form control values based on a property value change and then disables the entire form group.
   * This is particularly used for setting the value of a specific control within a FormArray and then
   * disabling further modifications to it, typically after a selection has been made.
   *
   * @param {FormGroup} propertiesForm - The form containing the property values. This form includes
   *  the control identified by `controlName`.
   * @param {string} controlName - The name of the control within `propertiesForm` to be updated.
   *  This control is expected to be part of a FormArray.
   * @param {DefaultEntityValue} ev - The new value to be set for the specified control. This parameter
   *  represents the updated entity value that should be reflected in the UI.
   */
  static changeSelection(propertiesForm: FormGroup, controlName: string, ev: DefaultEntityValue): void {
    (propertiesForm.get(controlName) as FormArray).at(0).get('value').setValue(ev);
    propertiesForm.get(controlName).disable();
  }

  /**
   * Updates the language selection for a specific property in a form array. It sets the value of the
   * language control based on the provided property value and then disables it to prevent further changes.
   * This is typically used to finalize the language selection after a user makes a choice.
   *
   * @param {FormGroup} propertiesForm - The FormGroup that contains the FormArray of properties.
   * @param {EntityValueProperty} ev - An object representing the entity value property, used to identify
   *  the specific FormArray and control within the form.
   * @param {string} propertyValue - The value to set for the language control.
   * @param {number} index - The index of the control within the FormArray that should be updated.
   */
  static changeLanguageSelection(propertiesForm: FormGroup, ev: EntityValueProperty, propertyValue: string, index: number): void {
    const propertiesFormArray = propertiesForm.get(ev.key.property.name) as FormArray;
    const languageControl = propertiesFormArray.at(index).get('language');
    languageControl.setValue(propertyValue);
    languageControl.disable();
  }

  /**
   * Unlocks the entity value for editing and updates the specified control within a form group.
   * This involves enabling the control and resetting its value.
   * @param {FormGroup} displayedFormGroup - The form group displayed on the UI.
   * @param {string} controlName - The name of the control group within the displayed form group.
   * @param {number} index - The index of the control within the form array to be unlocked.
   * @param {string} valueControlName - The name of the specific control to unlock for editing.
   */
  static unlockValue(displayedFormGroup: FormGroup, controlName: string, index: number, valueControlName: string) {
    const displayControl = this.getDisplayControl(displayedFormGroup, controlName).at(index).get(valueControlName);
    displayControl.enable();
    displayControl.patchValue('');
  }

  /**
   * Creates a new entity value and updates the form controls accordingly.
   * @param {FormGroup} form - The form containing the entity value properties.
   * @param {any} property - The property for which to create a new entity value.
   * @param {any} entityValueName - The name of the new entity value.
   */
  static createNewEntityValue(form: FormGroup, property: any, entityValueName: any) {
    const characteristic =
      property?.characteristic instanceof DefaultTrait ? property.characteristic.baseCharacteristic : property.characteristic;
    const urn = `${property.aspectModelUrn.split('#')?.[0]}#${entityValueName}`;
    const newEntityValue = new DefaultEntityValue(
      property.metaModelVersion,
      entityValueName,
      urn,
      characteristic?.dataType as DefaultEntity,
      (characteristic?.dataType?.['properties'] as OverWrittenProperty[]) || [],
    );

    const newEntityValues = form.get('newEntityValues');
    if (newEntityValues?.value) {
      newEntityValues.setValue([...newEntityValues.value, newEntityValue]);
    } else {
      form.setControl('newEntityValues', new FormControl([newEntityValue]));
    }

    const propertiesForm = form.get('properties');
    const entityValuePropertiesForm = form.get('entityValueProperties');
    const formGroup = propertiesForm ? propertiesForm : entityValuePropertiesForm;

    if (formGroup) {
      const propertyForm = formGroup.get(property.name);
      if (propertyForm instanceof FormArray) {
        propertyForm.at(0).get('value').patchValue(newEntityValue);
      } else {
        propertyForm.patchValue(newEntityValue);
      }
      EntityValueUtil.getDisplayControl(formGroup as FormGroup, property.name).disable();
    }
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
