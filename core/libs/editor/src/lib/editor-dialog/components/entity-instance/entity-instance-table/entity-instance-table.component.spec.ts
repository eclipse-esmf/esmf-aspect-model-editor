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
  DefaultEntity,
  DefaultEntityInstance,
  DefaultProperty,
  DefaultScalar,
  ModelElementCache,
  RdfModel,
  Value,
} from '@esmf/aspect-model-loader';
import {TranslocoTestingModule} from '@jsverse/transloco';
import {Store} from 'n3';
import {MockProvider} from 'ng-mocks';
import {of} from 'rxjs';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {EditorModelService} from '../../../editor-model.service';
import {EditorSignalFormContext} from '../../../forms/editor-signal-form-context';
import {EntityInstanceTableComponent} from './entity-instance-table.component';

describe('EntityInstanceTableComponent', () => {
  let component: EntityInstanceTableComponent;
  let fixture: ComponentFixture<EntityInstanceTableComponent>;
  let context: EditorSignalFormContext;

  beforeEach(async () => {
    const scalar = new DefaultScalar({urn: 'http://www.w3.org/2001/XMLSchema#string', metaModelVersion: '2.0.0'});
    const property = new DefaultProperty({
      aspectModelUrn: 'urn:test:1.0.0#serialNumber',
      name: 'serialNumber',
      metaModelVersion: '2.0.0',
      characteristic: new DefaultCharacteristic({
        aspectModelUrn: 'urn:test:1.0.0#SerialNumberCharacteristic',
        name: 'SerialNumberCharacteristic',
        metaModelVersion: '2.0.0',
        dataType: scalar,
      }),
    });
    const entity = new DefaultEntity({
      aspectModelUrn: 'urn:test:1.0.0#Entity',
      name: 'Entity',
      metaModelVersion: '2.0.0',
      properties: [property],
    });
    entity.propertiesPayload = {[property.aspectModelUrn]: {optional: false, notInPayload: false, payloadName: property.name}};
    const entityValue = new DefaultEntityInstance({
      aspectModelUrn: 'urn:test:1.0.0#Instance',
      name: 'Instance',
      metaModelVersion: '2.0.0',
      type: entity,
    });
    entityValue.setAssertion(property.aspectModelUrn, new Value('SN-1', scalar));
    const cache = new ModelElementCache();
    cache.resolveInstance(property);
    const aspect = new DefaultAspect({aspectModelUrn: 'urn:test:1.0.0#Aspect', name: 'Aspect', metaModelVersion: '2.0.0'});
    const loadedFile = new NamespaceFile(new RdfModel(new Store(), '2.0.0', 'urn:test:1.0.0#'), cache, aspect);
    await TestBed.configureTestingModule({
      imports: [
        EntityInstanceTableComponent,
        BrowserAnimationsModule,
        TranslocoTestingModule.forRoot({langs: {en: {}}, translocoConfig: {availableLangs: ['en'], defaultLang: 'en'}}),
      ],
      providers: [
        MockProvider(EditorModelService, {getMetaModelElement: vi.fn(() => of(entityValue))}),
        MockProvider(LoadedFilesService, {
          currentLoadedFile: loadedFile,
          getElement: vi.fn((urn: string) => cache.get(urn)),
        }),
      ],
    }).compileComponents();

    context = TestBed.runInInjectionContext(() => EditorSignalFormContext.create());

    fixture = TestBed.createComponent(EntityInstanceTableComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('signalForm', context);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it('registers initialized property rows and nested new values', () => {
    expect(component).toBeTruthy();
    expect(context.value()).toMatchObject({
      entityValueProperties: {serialNumber: [{value: 'SN-1'}]},
      newEntityValues: [],
    });
    expect(context.valid()).toBe(true);
  });

  it('unregisters table fields on destroy', () => {
    fixture.destroy();

    expect(context.value()).not.toHaveProperty('entityValueProperties');
    expect(context.value()).not.toHaveProperty('newEntityValues');
  });
});
