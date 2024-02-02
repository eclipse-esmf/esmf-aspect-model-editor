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

import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {NamespacesCacheService} from '@ame/cache';
import {MetaModelElementInstantiator, PredefinedCharacteristicInstantiator, UnitInstantiator} from '@ame/instantiator';
import {
  BaseMetaModelElement,
  Characteristic,
  DefaultCharacteristic,
  DefaultCode,
  DefaultCollection,
  DefaultDuration,
  DefaultEither,
  DefaultEnumeration,
  DefaultList,
  DefaultMeasurement,
  DefaultQuantifiable,
  DefaultSet,
  DefaultSingleEntity,
  DefaultSortedSet,
  DefaultState,
  DefaultStructuredValue,
  DefaultTimeSeries,
  ModelElementNamingService,
  Unit,
} from '@ame/meta-model';
import {ModelService} from '@ame/rdf/services';
import {SammLanguageSettingsService} from '@ame/settings-dialog';
import {DataFactory} from 'n3';
import {EditorModelService} from '../../../../editor-model.service';
import {DropdownFieldComponent} from '../../dropdown-field.component';
import {CharacteristicClassType} from '@ame/editor';

@Component({
  selector: 'ame-characteristic-name-dropdown-field',
  templateUrl: './characteristic-name-dropdown-field.component.html',
})
export class CharacteristicNameDropdownFieldComponent extends DropdownFieldComponent<DefaultCharacteristic> implements OnInit {
  public listCharacteristics: Map<string, Function> = new Map();
  public listCharacteristicGroup: Map<string, Array<string>> = new Map();
  public defaultCharacteristicInstantiator: PredefinedCharacteristicInstantiator;
  public unitInstantiator: UnitInstantiator;
  public units: Array<Unit> = [];

  @Output() selectedCharacteristic = new EventEmitter<CharacteristicClassType>();

  constructor(
    public editorModelService: EditorModelService,
    public modelService: ModelService,
    public languageSettings: SammLanguageSettingsService,
    private namespacesCacheService: NamespacesCacheService,
    private modelElementNamingService: ModelElementNamingService
  ) {
    super(editorModelService, modelService, languageSettings);
  }

  ngOnInit(): void {
    this.initListCharacteristics();
    this.subscription.add(
      this.getMetaModelData().subscribe(() => {
        this.selectedMetaModelElement = this.metaModelElement;
        this.setMetaModelClassName();
        this.selectedCharacteristic.emit(this.metaModelClassName as CharacteristicClassType);
      })
    );
  }

  onCharacteristicChange(characteristic: string) {
    this.setPreviousData();

    const createInstanceFunction = this.listCharacteristics.get(characteristic);
    const newCharacteristicType = this.getMetaModelElementTypeWhenChange(createInstanceFunction);

    const oldMetaModelElement = this.metaModelElement;
    this.metaModelElement = newCharacteristicType;
    if (!this.unitInstantiator) {
      this.unitInstantiator = new UnitInstantiator(
        new MetaModelElementInstantiator(this.modelService.getLoadedAspectModel().rdfModel, this.namespacesCacheService.currentCachedFile)
      );
    }

    if (newCharacteristicType?.isPredefined()) {
      this.metaModelElement.name = newCharacteristicType.name;
    } else {
      const oldCharacteristic = oldMetaModelElement;
      const selectedCharacteristic = this.selectedMetaModelElement;

      if (oldCharacteristic.isPredefined() && !selectedCharacteristic.isPredefined()) {
        this.metaModelElement.name = this.selectedMetaModelElement.name;
      } else if (oldCharacteristic.isPredefined() && selectedCharacteristic.isPredefined()) {
        this.metaModelElement = this.modelElementNamingService.resolveElementNaming(newCharacteristicType) as DefaultCharacteristic;
        if (this.originalCharacteristic && !this.originalCharacteristic.isPredefined()) {
          this.metaModelElement.name = this.originalCharacteristic.name;
          this.metaModelElement.aspectModelUrn = this.originalCharacteristic.aspectModelUrn;
        }
      } else {
        this.metaModelElement.name = oldMetaModelElement.name;
        this.migrateCommonAttributes(oldMetaModelElement);
      }
    }
    this.addLanguageSettings(this.metaModelElement);
    this.setMetaModelElementAspectUrn(newCharacteristicType);
    this.updateFields(newCharacteristicType);

    this.selectedCharacteristic.emit(characteristic as CharacteristicClassType);
  }

  private initListCharacteristics(): void {
    if (this.listCharacteristics.size <= 0) {
      this.listCharacteristicGroup.set('Classes', this.createCharacteristicClassesList());
      this.listCharacteristicGroup.set('Instances', this.createCharacteristicInstancesList());
    }
  }

  private createCharacteristicClassesList() {
    const characteristicList = [...this.listCharacteristics.keys()];
    this.listCharacteristics.set(CharacteristicClassType.Characteristic, DefaultCharacteristic.createInstance);
    this.listCharacteristics.set(CharacteristicClassType.Code, DefaultCode.createInstance);
    this.listCharacteristics.set(CharacteristicClassType.Collection, DefaultCollection.createInstance);
    this.listCharacteristics.set(CharacteristicClassType.Duration, DefaultDuration.createInstance);
    this.listCharacteristics.set(CharacteristicClassType.Either, DefaultEither.createInstance);
    this.listCharacteristics.set(CharacteristicClassType.Enumeration, DefaultEnumeration.createInstance);
    this.listCharacteristics.set(CharacteristicClassType.List, DefaultList.createInstance);
    this.listCharacteristics.set(CharacteristicClassType.Measurement, DefaultMeasurement.createInstance);
    this.listCharacteristics.set(CharacteristicClassType.Quantifiable, DefaultQuantifiable.createInstance);
    this.listCharacteristics.set(CharacteristicClassType.Set, DefaultSet.createInstance);
    this.listCharacteristics.set(CharacteristicClassType.SortedSet, DefaultSortedSet.createInstance);
    this.listCharacteristics.set(CharacteristicClassType.SingleEntity, DefaultSingleEntity.createInstance);
    this.listCharacteristics.set(CharacteristicClassType.State, DefaultState.createInstance);
    this.listCharacteristics.set(CharacteristicClassType.StructuredValue, DefaultStructuredValue.createInstance);
    this.listCharacteristics.set(CharacteristicClassType.TimeSeries, DefaultTimeSeries.createInstance);
    return [...this.listCharacteristics.keys()].filter(value => !characteristicList.includes(value));
  }

  private createCharacteristicInstancesList() {
    const instanceList = [...this.listCharacteristics.keys()];
    this.listCharacteristics.set('Boolean', () => this.createDefaultCharacteristic('Boolean'));
    this.listCharacteristics.set('Language', () => this.createDefaultCharacteristic('Language'));
    this.listCharacteristics.set('Locale', () => this.createDefaultCharacteristic('Locale'));
    this.listCharacteristics.set('MultiLanguageText', () => this.createDefaultCharacteristic('MultiLanguageText'));
    this.listCharacteristics.set('MimeType', () => this.createDefaultCharacteristic('MimeType'));
    this.listCharacteristics.set('ResourcePath', () => this.createDefaultCharacteristic('ResourcePath'));
    this.listCharacteristics.set('Text', () => this.createDefaultCharacteristic('Text'));
    this.listCharacteristics.set('Timestamp', () => this.createDefaultCharacteristic('Timestamp'));
    this.listCharacteristics.set('UnitReference', () => this.createDefaultCharacteristic('UnitReference'));
    return [...this.listCharacteristics.keys()].filter(value => !instanceList.includes(value));
  }

  private createDefaultCharacteristic(characteristicName: string): Characteristic {
    const sammC = this.modelService.getLoadedAspectModel().rdfModel.SAMMC();
    if (!this.defaultCharacteristicInstantiator) {
      this.defaultCharacteristicInstantiator = new PredefinedCharacteristicInstantiator(
        new MetaModelElementInstantiator(this.modelService.getLoadedAspectModel().rdfModel, this.namespacesCacheService.currentCachedFile)
      );
    }
    return this.defaultCharacteristicInstantiator.createCharacteristic(
      DataFactory.namedNode(`${sammC.getNamespace()}${characteristicName}`)
    );
  }

  private migrateCommonAttributes(oldMetaModelElement: BaseMetaModelElement) {
    Object.keys(oldMetaModelElement).forEach(oldKey => {
      if (Object.keys(this.metaModelElement).find(key => key === oldKey) && oldKey !== 'aspectModelUrn' && oldKey !== 'name') {
        if (oldKey === 'unit' && this.metaModelElement instanceof DefaultDuration) {
          const matchedUnit = this.units.find(
            unit =>
              unit.quantityKinds &&
              unit.quantityKinds.includes('time') &&
              unit.name.toLowerCase().indexOf(oldMetaModelElement[oldKey].name.toLowerCase()) >= 0
          );
          if (matchedUnit) {
            this.metaModelElement[oldKey] = this.unitInstantiator.getUnit(matchedUnit.name);
          }
        } else {
          this.metaModelElement[oldKey] = oldMetaModelElement[oldKey];
        }
      }
    });
  }

  private setMetaModelElementAspectUrn(modelElement: BaseMetaModelElement) {
    if (
      this.defaultCharacteristicInstantiator &&
      this.defaultCharacteristicInstantiator.getSupportedCharacteristicNames().includes(modelElement.aspectModelUrn)
    ) {
      this.metaModelElement.aspectModelUrn = modelElement.aspectModelUrn;
    } else {
      this.metaModelElement.aspectModelUrn = `${this.modelService.getLoadedAspectModel().rdfModel.getAspectModelUrn()}${modelElement.name}`;
    }
  }

  private getMetaModelElementTypeWhenChange(createInstanceFunction: Function) {
    const modelElementType = createInstanceFunction();
    if (modelElementType.aspectModelUrn === this.selectedMetaModelElement.aspectModelUrn) {
      this.metaModelElement = this.selectedMetaModelElement;
      return;
    }
    return modelElementType;
  }
}
