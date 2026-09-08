/*
 * Copyright (c) 2026 Robert Bosch Manufacturing Solutions GmbH
 * SPDX-License-Identifier: MPL-2.0
 */

import {LoadedFilesService, NamespaceFile} from '@ame/cache';
import {MaxGraphService} from '@ame/max-graph';
import {RdfService} from '@ame/rdf/services';
import {NotificationsService, SearchService} from '@ame/shared';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {DefaultCharacteristic, DefaultEither, ModelElementCache, RdfModel} from '@esmf/aspect-model-loader';
import {TranslocoTestingModule} from '@jsverse/transloco';
import {Store} from 'n3';
import {MockProvider} from 'ng-mocks';
import {of} from 'rxjs';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {EditorModelService} from '../../../../editor-model.service';
import {EditorSignalFormContext} from '../../../../forms/editor-signal-form-context';
import {EditorDialogValidators} from '../../../../validators';
import {RightInputFieldComponent} from './right-input-field.component';

describe('RightInputFieldComponent', () => {
  let component: RightInputFieldComponent;
  let fixture: ComponentFixture<RightInputFieldComponent>;
  let signalForm: EditorSignalFormContext;
  let either: DefaultEither;
  let cache: ModelElementCache;
  let notifications: NotificationsService;

  beforeEach(() => {
    either = new DefaultEither({
      aspectModelUrn: 'urn:test:1.0.0#Either',
      name: 'Either',
      metaModelVersion: '2.0.0',
      left: null,
      right: null,
    });
    cache = new ModelElementCache();
    TestBed.configureTestingModule({
      imports: [
        RightInputFieldComponent,
        BrowserAnimationsModule,
        TranslocoTestingModule.forRoot({langs: {en: {}}, translocoConfig: {availableLangs: ['en'], defaultLang: 'en'}}),
      ],
      providers: [
        MockProvider(EditorModelService, {getMetaModelElement: vi.fn(() => of(either)), isReadOnly: vi.fn(() => false)}),
        MockProvider(LoadedFilesService, {
          currentLoadedFile: new NamespaceFile(new RdfModel(new Store(), '2.0.0', 'urn:test:1.0.0#'), cache, null),
          findElementOnExtReferences: vi.fn(() => null),
          isElementExtern: vi.fn(() => false),
        }),
        MockProvider(EditorDialogValidators, {duplicateNameWithDifferentTypeValue: vi.fn(() => of(null))}),
        MockProvider(NotificationsService, {error: vi.fn()}),
        MockProvider(SearchService),
        MockProvider(MaxGraphService),
        MockProvider(RdfService),
      ],
    });
    signalForm = TestBed.runInInjectionContext(() => EditorSignalFormContext.create());
    notifications = TestBed.inject(NotificationsService);
    fixture = TestBed.createComponent(RightInputFieldComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('signalForm', signalForm);
    fixture.detectChanges();
  });

  it('should register required right values', () => {
    expect(signalForm.value()).toMatchObject({right: '', rightCharacteristic: null});
    expect(component.hasError('required')).toBe(true);
    expect(signalForm.valid()).toBe(false);
  });

  it('should create, lock, unlock, and clear a right characteristic', () => {
    component.createNewCharacteristic('RightCharacteristic');
    const created = signalForm.value().rightCharacteristic as DefaultCharacteristic;

    expect(created.aspectModelUrn).toBe('urn:test:1.0.0#RightCharacteristic');
    expect(component.displayField().disabled()).toBe(true);
    expect(signalForm.valid()).toBe(true);

    component.unlockRight();
    expect(component.displayField().touched()).toBe(true);
    expect(signalForm.value()).toMatchObject({right: '', rightCharacteristic: null});
  });

  it('should prevent self-links and equality with the left side', () => {
    signalForm.set('name', 'SelfCharacteristic');
    component.createNewCharacteristic('SelfCharacteristic');
    expect(notifications.error).toHaveBeenCalledWith({title: 'Element right cannot link itself'});

    signalForm.set('leftCharacteristic', createCharacteristic('SharedCharacteristic'));
    component.createNewCharacteristic('SharedCharacteristic');
    expect(notifications.error).toHaveBeenCalledWith({
      title: 'Element right cannot point to the same characteristic as the left element.',
    });
  });

  it('should filter itself and the selected left characteristic', () => {
    const available = createCharacteristic('AvailableCharacteristic');
    const left = createCharacteristic('LeftCharacteristic');
    cache.addElement(either.aspectModelUrn, either);
    cache.addElement(available.aspectModelUrn, available);
    cache.addElement(left.aspectModelUrn, left);
    signalForm.set('leftCharacteristic', left);
    component.displayField().value.set('Characteristic');

    expect(component.filteredCharacteristicTypes().map(option => option.name)).toEqual(['AvailableCharacteristic']);
  });

  it('should initialize an existing value and unregister on destroy', () => {
    const existing = createCharacteristic('ExistingCharacteristic');
    either.right = existing;
    component.setRightControl();

    expect(signalForm.value()).toMatchObject({right: existing.name, rightCharacteristic: existing});
    expect(component.displayField().disabled()).toBe(true);

    fixture.destroy();
    expect(signalForm.value()).not.toHaveProperty('right');
    expect(signalForm.value()).not.toHaveProperty('rightCharacteristic');
  });

  function createCharacteristic(name: string): DefaultCharacteristic {
    return new DefaultCharacteristic({aspectModelUrn: `urn:test:1.0.0#${name}`, name, metaModelVersion: '2.0.0'});
  }
});
