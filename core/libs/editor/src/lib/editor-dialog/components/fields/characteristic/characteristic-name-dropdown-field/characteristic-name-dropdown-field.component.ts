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

import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {NamespacesCacheService} from '@ame/cache';
import {BammCharacteristicInstantiator, BammUnitInstantiator, MetaModelElementInstantiator} from '@ame/instantiator';
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
import {LanguageSettingsService} from '@ame/settings-dialog';
import {DataFactory} from 'n3';
import {EditorModelService} from '../../../../editor-model.service';
import {DropdownFieldComponent} from '../../dropdown-field.component';

@Component({
  selector: 'ame-characteristic-name-dropdown-field',
  templateUrl: './characteristic-name-dropdown-field.component.html',
})
export class CharacteristicNameDropdownFieldComponent extends DropdownFieldComponent<DefaultCharacteristic> implements OnInit {
  public listCharacteristics: Map<string, Function> = new Map();
  public listCharacteristicGroup: Map<string, Array<string>> = new Map();
  public bammCharacteristicInstantiator: BammCharacteristicInstantiator;
  public bammUnitInstantiator: BammUnitInstantiator;
  public units: Array<Unit> = [];

  @Output() selectedCharacteristic = new EventEmitter<string>();

  constructor(
    public metaModelDialogService: EditorModelService,
    public modelService: ModelService,
    public languageSettings: LanguageSettingsService,
    private namespacesCacheService: NamespacesCacheService,
    private modelElementNamingService: ModelElementNamingService
  ) {
    super(metaModelDialogService, modelService, languageSettings);
  }

  ngOnInit(): void {
    this.initListCharacteristics();
    this.subscription.add(
      this.getMetaModelData().subscribe(() => {
        this.selectedMetaModelElement = this.metaModelElement;
        this.setMetaModelClassName();
        this.selectedCharacteristic.emit(this.metaModelClassName);
      })
    );
  }

  onCharacteristicChange(characteristic: string) {
    this.setPreviousData();

    const createInstanceFunction = this.listCharacteristics.get(characteristic);
    const newCharacteristicType = this.getMetaModelElementTypeWhenChange(createInstanceFunction);

    const oldMetaModelElement = this.metaModelElement;
    this.metaModelElement = newCharacteristicType;
    if (!this.bammUnitInstantiator) {
      this.bammUnitInstantiator = new BammUnitInstantiator(
        new MetaModelElementInstantiator(
          this.modelService.getLoadedAspectModel().rdfModel,
          this.namespacesCacheService.getCurrentCachedFile()
        )
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
      } else {
        this.metaModelElement.name = oldMetaModelElement.name;
        this.migrateCommonAttributes(oldMetaModelElement);
      }
    }
    this.addLanguageSettings(this.metaModelElement);
    this.setMetaModelElementAspectUrn(newCharacteristicType);
    this.updateFields(newCharacteristicType);

    this.selectedCharacteristic.emit(characteristic);
  }

  private initListCharacteristics(): void {
    if (this.listCharacteristics.size <= 0) {
      this.listCharacteristicGroup.set('Classes', this.createCharacteristicClassesList());
      this.listCharacteristicGroup.set('Instances', this.createCharacteristicInstancesList());
    }
  }

  private createCharacteristicClassesList() {
    const characteristicList = [...this.listCharacteristics.keys()];
    this.listCharacteristics.set('Characteristic', DefaultCharacteristic.createInstance);
    this.listCharacteristics.set('Code', DefaultCode.createInstance);
    this.listCharacteristics.set('Collection', DefaultCollection.createInstance);
    this.listCharacteristics.set('Duration', DefaultDuration.createInstance);
    this.listCharacteristics.set('Either', DefaultEither.createInstance);
    this.listCharacteristics.set('Enumeration', DefaultEnumeration.createInstance);
    this.listCharacteristics.set('List', DefaultList.createInstance);
    this.listCharacteristics.set('Measurement', DefaultMeasurement.createInstance);
    this.listCharacteristics.set('Quantifiable', DefaultQuantifiable.createInstance);
    this.listCharacteristics.set('Set', DefaultSet.createInstance);
    this.listCharacteristics.set('SortedSet', DefaultSortedSet.createInstance);
    this.listCharacteristics.set('SingleEntity', DefaultSingleEntity.createInstance);
    this.listCharacteristics.set('State', DefaultState.createInstance);
    this.listCharacteristics.set('StructuredValue', DefaultStructuredValue.createInstance);
    this.listCharacteristics.set('TimeSeries', DefaultTimeSeries.createInstance);
    return [...this.listCharacteristics.keys()].filter(value => !characteristicList.includes(value));
  }

  private createCharacteristicInstancesList() {
    const instanceList = [...this.listCharacteristics.keys()];
    this.listCharacteristics.set('Boolean', () => this.createDefaultBammCharacteristic('Boolean'));
    this.listCharacteristics.set('Language', () => this.createDefaultBammCharacteristic('Language'));
    this.listCharacteristics.set('Locale', () => this.createDefaultBammCharacteristic('Locale'));
    this.listCharacteristics.set('MultiLanguageText', () => this.createDefaultBammCharacteristic('MultiLanguageText'));
    this.listCharacteristics.set('MimeType', () => this.createDefaultBammCharacteristic('MimeType'));
    this.listCharacteristics.set('ResourcePath', () => this.createDefaultBammCharacteristic('ResourcePath'));
    this.listCharacteristics.set('Text', () => this.createDefaultBammCharacteristic('Text'));
    this.listCharacteristics.set('Timestamp', () => this.createDefaultBammCharacteristic('Timestamp'));
    this.listCharacteristics.set('UnitReference', () => this.createDefaultBammCharacteristic('UnitReference'));
    return [...this.listCharacteristics.keys()].filter(value => !instanceList.includes(value));
  }

  private createDefaultBammCharacteristic(characteristicName: string): Characteristic {
    const bammc = this.modelService.getLoadedAspectModel().rdfModel.BAMMC();
    if (!this.bammCharacteristicInstantiator) {
      this.bammCharacteristicInstantiator = new BammCharacteristicInstantiator(
        new MetaModelElementInstantiator(
          this.modelService.getLoadedAspectModel().rdfModel,
          this.namespacesCacheService.getCurrentCachedFile()
        )
      );
    }
    return this.bammCharacteristicInstantiator.createCharacteristic(DataFactory.namedNode(`${bammc.getNamespace()}${characteristicName}`));
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
            this.metaModelElement[oldKey] = this.bammUnitInstantiator.getUnit(matchedUnit.name);
          }
        } else {
          this.metaModelElement[oldKey] = oldMetaModelElement[oldKey];
        }
      }
    });
  }

  private setMetaModelElementAspectUrn(modelElement: BaseMetaModelElement) {
    if (
      this.bammCharacteristicInstantiator &&
      this.bammCharacteristicInstantiator.getSupportedCharacteristicNames().includes(modelElement.aspectModelUrn)
    ) {
      this.metaModelElement.aspectModelUrn = modelElement.aspectModelUrn;
    } else {
      this.metaModelElement.aspectModelUrn = `${this.modelService.getLoadedAspectModel().rdfModel.getAspectModelUrn()}${modelElement.name}`;
    }
  }

  private getMetaModelElementTypeWhenChange(createInstanceFunction: Function) {
    const ModelElementType = createInstanceFunction();
    if (ModelElementType.aspectModelUrn === this.selectedMetaModelElement.aspectModelUrn) {
      this.metaModelElement = this.selectedMetaModelElement;
      return;
    }
    return ModelElementType;
  }
}
