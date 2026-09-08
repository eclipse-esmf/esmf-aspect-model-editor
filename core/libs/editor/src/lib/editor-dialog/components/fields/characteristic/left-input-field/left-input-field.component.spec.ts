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
import {LeftInputFieldComponent} from './left-input-field.component';

describe('LeftInputFieldComponent', () => {
  let component: LeftInputFieldComponent;
  let fixture: ComponentFixture<LeftInputFieldComponent>;
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
        LeftInputFieldComponent,
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
    fixture = TestBed.createComponent(LeftInputFieldComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('signalForm', signalForm);
    fixture.detectChanges();
  });

  it('should register required left values', () => {
    expect(signalForm.value()).toMatchObject({left: '', leftCharacteristic: null});
    expect(component.hasError('required')).toBe(true);
    expect(signalForm.valid()).toBe(false);
  });

  it('should create, lock, unlock, and clear a left characteristic', () => {
    component.createNewCharacteristic('LeftCharacteristic');
    const created = signalForm.value().leftCharacteristic as DefaultCharacteristic;

    expect(created.aspectModelUrn).toBe('urn:test:1.0.0#LeftCharacteristic');
    expect(component.displayField().disabled()).toBe(true);
    expect(signalForm.valid()).toBe(true);

    component.unlockLeft();
    expect(component.displayField().touched()).toBe(true);
    expect(signalForm.value()).toMatchObject({left: '', leftCharacteristic: null});
  });

  it('should prevent self-links and equality with the right side', () => {
    signalForm.set('name', 'SelfCharacteristic');
    component.createNewCharacteristic('SelfCharacteristic');
    expect(notifications.error).toHaveBeenCalledWith({title: 'Element left cannot link itself'});

    signalForm.set('rightCharacteristic', createCharacteristic('SharedCharacteristic'));
    component.createNewCharacteristic('SharedCharacteristic');
    expect(notifications.error).toHaveBeenCalledWith({
      title: 'Element left cannot point to the same characteristic as the right element.',
    });
  });

  it('should filter itself and the selected right characteristic', () => {
    const available = createCharacteristic('AvailableCharacteristic');
    const right = createCharacteristic('RightCharacteristic');
    cache.addElement(either.aspectModelUrn, either);
    cache.addElement(available.aspectModelUrn, available);
    cache.addElement(right.aspectModelUrn, right);
    signalForm.set('rightCharacteristic', right);
    component.displayField().value.set('Characteristic');

    expect(component.filteredCharacteristicTypes().map(option => option.name)).toEqual(['AvailableCharacteristic']);
  });

  it('should initialize an existing value and unregister on destroy', () => {
    const existing = createCharacteristic('ExistingCharacteristic');
    either.left = existing;
    component.setLeftControl();

    expect(signalForm.value()).toMatchObject({left: existing.name, leftCharacteristic: existing});
    expect(component.displayField().disabled()).toBe(true);

    fixture.destroy();
    expect(signalForm.value()).not.toHaveProperty('left');
    expect(signalForm.value()).not.toHaveProperty('leftCharacteristic');
  });

  function createCharacteristic(name: string): DefaultCharacteristic {
    return new DefaultCharacteristic({aspectModelUrn: `urn:test:1.0.0#${name}`, name, metaModelVersion: '2.0.0'});
  }
});
