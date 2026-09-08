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

import {LoadedFilesService} from '@ame/cache';
import {CharacteristicClassType} from '@ame/editor';
import {ModelElementNamingService} from '@ame/meta-model';
import {ModelService} from '@ame/rdf/services';
import {SammLanguageSettingsService} from '@ame/settings-dialog';
import {ElementCreatorService} from '@ame/shared';
import {KeyValuePipe} from '@angular/common';
import {Component, DestroyRef, inject, OnInit, output, signal} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatLabel} from '@angular/material/input';
import {MatOptgroup, MatOption, MatSelect} from '@angular/material/select';
import {
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
  NamedElement,
  useLoader,
} from '@esmf/aspect-model-loader';
import {DataFactory} from 'n3';
import {EditorModelService} from '../../../../editor-model.service';
import {DropdownFieldComponent} from '../../dropdown-field.component';

@Component({
  selector: 'ame-characteristic-name-dropdown-field',
  templateUrl: './characteristic-name-dropdown-field.component.html',
  imports: [MatFormFieldModule, MatLabel, MatSelect, KeyValuePipe, MatOptgroup, MatOption],
})
export class CharacteristicNameDropdownFieldComponent extends DropdownFieldComponent<DefaultCharacteristic> implements OnInit {
  private destroyRef = inject(DestroyRef);
  private modelElementNamingService = inject(ModelElementNamingService);
  private elementCreator = inject(ElementCreatorService);

  public editorModelService = inject(EditorModelService);
  public modelService = inject(ModelService);
  public languageSettings = inject(SammLanguageSettingsService);
  public loadedFilesService = inject(LoadedFilesService);

  public listCharacteristics: Map<string, () => DefaultCharacteristic> = new Map();

  public listCharacteristicGroup = signal<Map<string, Array<string>>>(new Map());

  readonly selectedCharacteristic = output<CharacteristicClassType>();

  ngOnInit(): void {
    this.initListCharacteristics();
    this.getMetaModelData()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.selectedMetaModelElement = this.metaModelElement;
        this.setMetaModelClassName();
        this.selectedCharacteristic.emit(this.metaModelClassName as CharacteristicClassType);
      });
  }

  onCharacteristicChange(characteristic: string) {
    this.metaModelClassName = characteristic;
    this.setPreviousData();

    const createInstanceFunction = this.listCharacteristics.get(characteristic);
    const newCharacteristicType = this.getMetaModelElementTypeWhenChange(createInstanceFunction);

    const oldMetaModelElement = this.metaModelElement;
    this.metaModelElement = newCharacteristicType;
    this.metaModelElement.anonymous = Boolean(oldMetaModelElement?.isAnonymous?.());

    if (newCharacteristicType?.isPredefined) {
      this.metaModelElement.name = newCharacteristicType.name;
    } else {
      const oldCharacteristic = oldMetaModelElement;
      const selectedCharacteristic = this.selectedMetaModelElement;

      if (oldCharacteristic.isPredefined && !selectedCharacteristic.isPredefined) {
        this.metaModelElement.name = this.selectedMetaModelElement.name;
      } else if (oldCharacteristic.isPredefined && selectedCharacteristic.isPredefined) {
        this.metaModelElement = this.modelElementNamingService.resolveElementNaming(newCharacteristicType) as DefaultCharacteristic;
        if (this.originalCharacteristic && !this.originalCharacteristic.isPredefined) {
          this.metaModelElement.name = this.originalCharacteristic.name;
          this.metaModelElement.aspectModelUrn = this.originalCharacteristic.aspectModelUrn;
        }
      } else {
        this.metaModelElement.name = this.metaModelElement.isAnonymous?.() ? `[${characteristic}]` : oldMetaModelElement.name;
        this.migrateCommonAttributes(oldMetaModelElement);
      }
    }
    this.addLanguageSettings(this.metaModelElement);
    this.setMetaModelElementAspectUrn(newCharacteristicType);

    if (this.metaModelElement.isAnonymous?.()) {
      this.signalForm().set('name', this.metaModelElement.name);
      this.signalForm().set('isAnonymous', true);
    }

    this.updateFields(newCharacteristicType);

    this.selectedCharacteristic.emit(characteristic as CharacteristicClassType);
  }

  private initListCharacteristics(): void {
    if (this.listCharacteristics.size <= 0) {
      this.listCharacteristicGroup.set(
        new Map([
          ['Classes', this.createCharacteristicClassesList()],
          ['Instances', this.createCharacteristicInstancesList()],
        ]),
      );
    }
  }

  private createCharacteristicClassesList() {
    const characteristicList = [...this.listCharacteristics.keys()];
    this.listCharacteristics.set(CharacteristicClassType.Characteristic, () => this.createEmptyElement(DefaultCharacteristic));
    this.listCharacteristics.set(CharacteristicClassType.Code, () => this.createEmptyElement(DefaultCode));
    this.listCharacteristics.set(CharacteristicClassType.Collection, () => this.createEmptyElement(DefaultCollection));
    this.listCharacteristics.set(CharacteristicClassType.Duration, () => this.createEmptyElement(DefaultDuration));
    this.listCharacteristics.set(CharacteristicClassType.Either, () => this.createEmptyElement(DefaultEither));
    this.listCharacteristics.set(CharacteristicClassType.Enumeration, () => this.createEmptyElement(DefaultEnumeration));
    this.listCharacteristics.set(CharacteristicClassType.List, () => this.createEmptyElement(DefaultList));
    this.listCharacteristics.set(CharacteristicClassType.Measurement, () => this.createEmptyElement(DefaultMeasurement));
    this.listCharacteristics.set(CharacteristicClassType.Quantifiable, () => this.createEmptyElement(DefaultQuantifiable));
    this.listCharacteristics.set(CharacteristicClassType.Set, () => this.createEmptyElement(DefaultSet));
    this.listCharacteristics.set(CharacteristicClassType.SortedSet, () => this.createEmptyElement(DefaultSortedSet));
    this.listCharacteristics.set(CharacteristicClassType.SingleEntity, () => this.createEmptyElement(DefaultSingleEntity));
    this.listCharacteristics.set(CharacteristicClassType.State, () => this.createEmptyElement(DefaultState));
    this.listCharacteristics.set(CharacteristicClassType.StructuredValue, () => this.createEmptyElement(DefaultStructuredValue));
    this.listCharacteristics.set(CharacteristicClassType.TimeSeries, () => this.createEmptyElement(DefaultTimeSeries));
    return [...this.listCharacteristics.keys()].filter(value => !characteristicList.includes(value));
  }

  private createEmptyElement<T>(elementClass: {new (...x: any[]): T}): T {
    const element = this.elementCreator.createEmptyElement(elementClass);
    this.loadedFilesService.currentLoadedFile.cachedFile.removeElement((element as NamedElement).aspectModelUrn);
    (element as DefaultCharacteristic).aspectModelUrn = this.metaModelElement.aspectModelUrn;
    return element;
  }

  private createCharacteristicInstancesList() {
    const instanceList = [...this.listCharacteristics.keys()];
    this.listCharacteristics.set('Boolean', () => this.createPredefinedCharacteristic('Boolean'));
    this.listCharacteristics.set('Language', () => this.createPredefinedCharacteristic('Language'));
    this.listCharacteristics.set('Locale', () => this.createPredefinedCharacteristic('Locale'));
    this.listCharacteristics.set('MultiLanguageText', () => this.createPredefinedCharacteristic('MultiLanguageText'));
    this.listCharacteristics.set('MimeType', () => this.createPredefinedCharacteristic('MimeType'));
    this.listCharacteristics.set('ResourcePath', () => this.createPredefinedCharacteristic('ResourcePath'));
    this.listCharacteristics.set('Text', () => this.createPredefinedCharacteristic('Text'));
    this.listCharacteristics.set('Timestamp', () => this.createPredefinedCharacteristic('Timestamp'));
    this.listCharacteristics.set('UnitReference', () => this.createPredefinedCharacteristic('UnitReference'));
    return [...this.listCharacteristics.keys()].filter(value => !instanceList.includes(value));
  }

  private createPredefinedCharacteristic(characteristicName: string): Characteristic {
    const rdfModel = this.loadedFilesService.currentLoadedFile.rdfModel;
    const cache = this.loadedFilesService.currentLoadedFile.cachedFile;
    const {createDefaultCharacteristic} = useLoader({rdfModel, cache});
    return createDefaultCharacteristic(
      DataFactory.quad(null, null, DataFactory.namedNode(`${rdfModel.sammC.getUri()}#${characteristicName}`)),
    );
  }

  private migrateCommonAttributes(oldMetaModelElement: NamedElement) {
    const modelKeys = Object.keys(this.metaModelElement);
    const skipKeys = ['aspectModelUrn', 'name', '_name', 'className'];

    Object.keys(oldMetaModelElement).forEach(oldKey => {
      if (!skipKeys.includes(oldKey) && (modelKeys.includes(oldKey) || oldKey in this.metaModelElement)) {
        this.metaModelElement[oldKey] = oldMetaModelElement[oldKey];
      }
    });
  }

  private setMetaModelElementAspectUrn(modelElement: NamedElement) {
    if (this.metaModelElement?.isAnonymous?.()) {
      return;
    }
    const currentRdfModel = this.loadedFilesService.currentLoadedFile.rdfModel;
    const {getSupportedCharacteristicNames} = useLoader({
      rdfModel: currentRdfModel,
      cache: this.loadedFilesService.currentLoadedFile.cachedFile,
    });

    if (getSupportedCharacteristicNames()?.includes(modelElement.name)) {
      this.metaModelElement.aspectModelUrn = `${currentRdfModel.getAspectModelUrn()}${modelElement.name}`;
    }
  }

  private getMetaModelElementTypeWhenChange(createInstanceFunction: () => DefaultCharacteristic) {
    const modelElementType = createInstanceFunction();
    if (modelElementType.aspectModelUrn === this.selectedMetaModelElement.aspectModelUrn) {
      this.metaModelElement = this.selectedMetaModelElement;
      return modelElementType;
    }
    return modelElementType;
  }
}
