/*
 * Copyright (c) 2026 Robert Bosch Manufacturing Solutions GmbH
 * SPDX-License-Identifier: MPL-2.0
 */

import {LoadedFilesService, NamespaceFile} from '@ame/cache';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {
  DefaultAspect,
  DefaultCharacteristic,
  DefaultCollection,
  DefaultEntity,
  DefaultEntityInstance,
  DefaultProperty,
  DefaultScalar,
  ModelElementCache,
  RdfModel,
} from '@esmf/aspect-model-loader';
import {TranslocoTestingModule} from '@jsverse/transloco';
import {Store} from 'n3';
import {MockProvider} from 'ng-mocks';
import {beforeEach, describe, expect, it} from 'vitest';
import {EntityInstanceModalTableComponent} from './entity-instance-modal-table.component';

describe('EntityInstanceModalTableComponent', () => {
  let component: EntityInstanceModalTableComponent;
  let fixture: ComponentFixture<EntityInstanceModalTableComponent>;
  let property: DefaultProperty;
  let entity: DefaultEntity;

  beforeEach(async () => {
    property = scalarProperty('serialNumber');
    entity = entityWith(property);

    const aspect = new DefaultAspect({aspectModelUrn: 'urn:test:1.0.0#Aspect', name: 'Aspect', metaModelVersion: '2.0.0'});
    await TestBed.configureTestingModule({
      imports: [
        EntityInstanceModalTableComponent,
        BrowserAnimationsModule,
        TranslocoTestingModule.forRoot({langs: {en: {}}, translocoConfig: {availableLangs: ['en'], defaultLang: 'en'}}),
      ],
      providers: [
        MockProvider(LoadedFilesService, {
          currentLoadedFile: new NamespaceFile(new RdfModel(new Store(), '2.0.0', 'urn:test:1.0.0#'), new ModelElementCache(), aspect),
        }),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(EntityInstanceModalTableComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('entity', entity);
    fixture.detectChanges();
  });

  it('builds required property rows and reports their validity', () => {
    expect(component.propertiesModel()).toMatchObject({serialNumber: [{value: ''}]});
    expect(component.propertiesForm().valid()).toBe(false);

    component.propertiesModel.set({serialNumber: [{value: '42'}]});

    expect(component.propertiesForm().valid()).toBe(true);
  });

  it('selects, locks, and unlocks a complex entity value', () => {
    const nestedType = new DefaultEntity({aspectModelUrn: 'urn:test:1.0.0#Part', name: 'Part', metaModelVersion: '2.0.0'});
    const selected = new DefaultEntityInstance({
      aspectModelUrn: 'urn:test:1.0.0#PartOne',
      name: 'PartOne',
      metaModelVersion: '2.0.0',
      type: nestedType,
    });

    component.changeSelection('serialNumber', selected);
    expect(component.propertiesModel().serialNumber[0].value).toBe('PartOne');
    expect(component.isLocked('serialNumber', 0, 'value')).toBe(true);

    component.unlockValue('serialNumber', 0, 'value');
    expect(component.propertiesModel().serialNumber[0].value).toBe('');
    expect(component.isLocked('serialNumber', 0, 'value')).toBe(false);
  });

  it('creates and tracks a nested entity instance with nested properties without stack overflow', () => {
    const nestedProperty = scalarProperty('subProperty');
    const nestedType = entityWith(nestedProperty);
    nestedProperty.parents.push(nestedType);

    property.characteristic = new DefaultCharacteristic({
      aspectModelUrn: 'urn:test:1.0.0#PartCharacteristic',
      name: 'PartCharacteristic',
      metaModelVersion: '2.0.0',
      dataType: nestedType,
    });
    property.parents.push(entity);

    component.createNewEntityValue(property, 'PartOne');

    expect(component.newEntityValues()).toHaveLength(1);
    expect(component.newEntityValues()[0]).toMatchObject({name: 'PartOne', type: nestedType});
    expect(component.propertiesModel().serialNumber[0].value).toBe('PartOne');
  });

  it('adds and removes collection language rows', () => {
    const languageProperty = langStringProperty('label');
    const languageEntity = entityWith(languageProperty);
    fixture.componentRef.setInput('entity', languageEntity);
    fixture.detectChanges();
    const source = component.sources()[0];

    component.addLanguage(source);
    expect(component.propertiesModel().label).toHaveLength(2);

    component.removeLanguage(source, 1);
    expect(component.propertiesModel().label).toMatchObject([{value: '', language: ''}]);
  });
});

function scalarProperty(name: string): DefaultProperty {
  const scalar = new DefaultScalar({urn: 'http://www.w3.org/2001/XMLSchema#string', metaModelVersion: '2.0.0'});
  return new DefaultProperty({
    aspectModelUrn: `urn:test:1.0.0#${name}`,
    name,
    metaModelVersion: '2.0.0',
    characteristic: new DefaultCharacteristic({
      aspectModelUrn: `urn:test:1.0.0#${name}Characteristic`,
      name: `${name}Characteristic`,
      metaModelVersion: '2.0.0',
      dataType: scalar,
    }),
  });
}

function langStringProperty(name: string): DefaultProperty {
  const scalar = new DefaultScalar({urn: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#langString', metaModelVersion: '2.0.0'});
  return new DefaultProperty({
    aspectModelUrn: `urn:test:1.0.0#${name}`,
    name,
    metaModelVersion: '2.0.0',
    characteristic: new DefaultCollection({
      aspectModelUrn: `urn:test:1.0.0#${name}Collection`,
      name: `${name}Collection`,
      metaModelVersion: '2.0.0',
      dataType: scalar,
    }),
  });
}

function entityWith(property: DefaultProperty): DefaultEntity {
  const entity = new DefaultEntity({
    aspectModelUrn: 'urn:test:1.0.0#Entity',
    name: 'Entity',
    metaModelVersion: '2.0.0',
    properties: [property],
  });
  entity.propertiesPayload = {[property.aspectModelUrn]: {optional: false, notInPayload: false, payloadName: property.name}};
  return entity;
}
