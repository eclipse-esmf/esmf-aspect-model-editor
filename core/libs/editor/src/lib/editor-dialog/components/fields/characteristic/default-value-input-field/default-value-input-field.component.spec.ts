/*
 * Copyright (c) 2026 Robert Bosch Manufacturing Solutions GmbH
 * SPDX-License-Identifier: MPL-2.0
 */

import {LoadedFilesService, NamespaceFile} from '@ame/cache';
import {MaxGraphService} from '@ame/max-graph';
import {NotificationsService, SearchService} from '@ame/shared';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {DefaultEntity, DefaultState, DefaultValue, ModelElementCache, RdfModel, ScalarValue} from '@esmf/aspect-model-loader';
import {Store} from 'n3';
import {MockProvider} from 'ng-mocks';
import {of} from 'rxjs';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {EditorModelService} from '../../../../editor-model.service';
import {EditorSignalFormContext} from '../../../../forms/editor-signal-form-context';
import {DefaultValueInputFieldComponent} from './default-value-input-field.component';

describe('DefaultValueInputFieldComponent', () => {
  let component: DefaultValueInputFieldComponent;
  let fixture: ComponentFixture<DefaultValueInputFieldComponent>;
  let signalForm: EditorSignalFormContext;
  let state: DefaultState;
  let loadedFiles: LoadedFilesService;
  const initial = new ScalarValue({value: 'initial', type: null});
  const reusable = new DefaultValue({
    aspectModelUrn: 'urn:test:1.0.0#ReusableValue',
    name: 'ReusableValue',
    value: 'value',
    metaModelVersion: '2.0.0',
  });

  beforeEach(() => {
    state = new DefaultState({
      aspectModelUrn: 'urn:test:1.0.0#State',
      name: 'State',
      metaModelVersion: '2.0.0',
      dataType: null,
      values: [initial, reusable],
      defaultValue: initial,
    });
    TestBed.configureTestingModule({
      imports: [DefaultValueInputFieldComponent, BrowserAnimationsModule],
      providers: [
        MockProvider(EditorModelService, {getMetaModelElement: vi.fn(() => of(state)), isReadOnly: vi.fn(() => false)}),
        MockProvider(LoadedFilesService, {
          currentLoadedFile: new NamespaceFile(new RdfModel(new Store(), '2.0.0', 'urn:test:1.0.0#'), new ModelElementCache(), null),
          isElementExtern: vi.fn(() => false),
        }),
        MockProvider(SearchService),
        MockProvider(MaxGraphService),
        MockProvider(NotificationsService),
      ],
    });
    signalForm = TestBed.runInInjectionContext(() => EditorSignalFormContext.create());
    signalForm.patch({enumValues: [initial, reusable], chipList: [initial, reusable], dataTypeEntity: null});
    loadedFiles = TestBed.inject(LoadedFilesService);
    fixture = TestBed.createComponent(DefaultValueInputFieldComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('signalForm', signalForm);
    fixture.detectChanges();
  });

  it('should initialize, aggregate, and lock an existing default value', () => {
    expect(component).toBeTruthy();
    expect(component.displayValue()).toBe('initial');
    expect(component.displayField().disabled()).toBe(true);
    expect(signalForm.value().defaultValue).toBe(initial);
  });

  it('should derive and filter reusable values from shared enum values', () => {
    component.unlockDefaultValue();
    component.displayField().value.set('Reusable');

    expect(component.filteredValues()).toEqual([reusable]);
    expect(component.filteredEntityValues()).toEqual([]);
  });

  it('should create literal and named default values and unlock them', () => {
    component.unlockDefaultValue();
    component.addValue('literal');
    expect((signalForm.value().defaultValue as ScalarValue).value).toBe('literal');
    expect(component.displayField().disabled()).toBe(true);

    component.unlockDefaultValue();
    component.addValue('NamedValue', false);
    expect(signalForm.value().defaultValue).toMatchObject({name: 'NamedValue', value: ''});

    component.unlockDefaultValue();
    expect((signalForm.value().defaultValue as ScalarValue).value).toBe('');
    expect(component.displayField().disabled()).toBe(false);
  });

  it('should clear scalar state when an entity datatype is selected', () => {
    const entity = new DefaultEntity({aspectModelUrn: 'urn:test:1.0.0#Entity', name: 'Entity', metaModelVersion: '2.0.0'});
    signalForm.set('dataTypeEntity', entity);
    fixture.detectChanges();

    expect(component.isComplexDatatype()).toBe(true);
    expect(signalForm.value().defaultValue).toBeNull();
    expect(component.displayValue()).toBe('');
  });

  it('should retain external values while disabling the stored field', () => {
    vi.mocked(loadedFiles.isElementExtern).mockReturnValue(true);
    component.initForm();

    expect(component.displayField().disabled()).toBe(true);
    expect(component.defaultValueField().disabled()).toBe(true);
    expect(signalForm.value().defaultValue).toBe(initial);
  });

  it('should unregister defaultValue on destroy', () => {
    fixture.destroy();
    expect(signalForm.value()).not.toHaveProperty('defaultValue');
  });
});
