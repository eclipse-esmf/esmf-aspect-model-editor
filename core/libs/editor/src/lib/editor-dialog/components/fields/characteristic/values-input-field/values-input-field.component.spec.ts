/*
 * Copyright (c) 2026 Robert Bosch Manufacturing Solutions GmbH
 * SPDX-License-Identifier: MPL-2.0
 */

import {LoadedFilesService, NamespaceFile} from '@ame/cache';
import {MaxGraphService} from '@ame/max-graph';
import {RdfService} from '@ame/rdf/services';
import {DataTypeService, NotificationsService, SearchService} from '@ame/shared';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {
  DefaultEntity,
  DefaultEntityInstance,
  DefaultEnumeration,
  DefaultValue,
  ModelElementCache,
  RdfModel,
  ScalarValue,
} from '@esmf/aspect-model-loader';
import {TranslocoTestingModule} from '@jsverse/transloco';
import {Store} from 'n3';
import {MockProvider} from 'ng-mocks';
import {of} from 'rxjs';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {EditorModelService} from '../../../../editor-model.service';
import {EditorSignalFormContext} from '../../../../forms/editor-signal-form-context';
import {ValuesInputFieldComponent} from './values-input-field.component';

describe('ValuesInputFieldComponent', () => {
  let component: ValuesInputFieldComponent;
  let fixture: ComponentFixture<ValuesInputFieldComponent>;
  let signalForm: EditorSignalFormContext;
  let enumeration: DefaultEnumeration;
  let cache: ModelElementCache;
  let loadedFiles: LoadedFilesService;
  const initial = new ScalarValue({value: 'initial', type: null});

  beforeEach(() => {
    enumeration = new DefaultEnumeration({
      aspectModelUrn: 'urn:test:1.0.0#Enumeration',
      name: 'Enumeration',
      metaModelVersion: '2.0.0',
      dataType: null,
      values: [initial],
    });
    cache = new ModelElementCache();
    cache.addElement(
      'urn:test:1.0.0#ReusableValue',
      new DefaultValue({
        aspectModelUrn: 'urn:test:1.0.0#ReusableValue',
        name: 'ReusableValue',
        value: 'value',
        metaModelVersion: '2.0.0',
      }),
    );

    TestBed.configureTestingModule({
      imports: [
        ValuesInputFieldComponent,
        BrowserAnimationsModule,
        TranslocoTestingModule.forRoot({langs: {en: {}}, translocoConfig: {availableLangs: ['en'], defaultLang: 'en'}}),
      ],
      providers: [
        MockProvider(EditorModelService, {getMetaModelElement: vi.fn(() => of(enumeration)), isReadOnly: vi.fn(() => false)}),
        MockProvider(LoadedFilesService, {
          currentLoadedFile: new NamespaceFile(new RdfModel(new Store(), '2.0.0', 'urn:test:1.0.0#'), cache, null),
          isElementExtern: vi.fn(() => false),
        }),
        MockProvider(DataTypeService, {getDataTypes: vi.fn(() => ({string: {}}))}),
        MockProvider(SearchService),
        MockProvider(MaxGraphService),
        MockProvider(NotificationsService),
        MockProvider(RdfService),
      ],
    });

    signalForm = TestBed.runInInjectionContext(() => EditorSignalFormContext.create());
    signalForm.patch({dataType: 'string', dataTypeEntity: null});
    loadedFiles = TestBed.inject(LoadedFilesService);
    fixture = TestBed.createComponent(ValuesInputFieldComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('signalForm', signalForm);
    fixture.detectChanges();
  });

  it('should aggregate search, chip list, and enum values', () => {
    expect(component).toBeTruthy();
    expect(signalForm.value()).toMatchObject({values: '', chipList: [initial], enumValues: [initial]});
    expect(signalForm.valid()).toBe(true);
  });

  it('should enforce at least one enumeration value', () => {
    component.enumValues.set([]);
    fixture.detectChanges();
    expect(
      component
        .chipListField()
        .errors()
        .some(error => error.kind === 'required'),
    ).toBe(true);
    expect(signalForm.valid()).toBe(false);
  });

  it('should add, edit, remove, and paste scalar values', () => {
    component.addValue('added');
    const added = component.enumValues()[component.enumValues().length - 1] as ScalarValue;
    expect(added.value).toBe('added');

    component.editValue(added, {value: 'edited'} as never);
    expect(added.value).toBe('edited');
    component.remove(added);
    expect(component.enumValues()).not.toContain(added);

    component.paste({
      preventDefault: vi.fn(),
      clipboardData: {getData: vi.fn(() => 'first; second; ')},
    } as unknown as ClipboardEvent);
    expect(
      component
        .enumValues()
        .slice(-2)
        .map(value => (value as ScalarValue).value),
    ).toEqual(['first', 'second']);
  });

  it('should filter reusable values and exclude already selected values', () => {
    component.searchField().value.set('Reusable');
    expect(component.filteredValues().map(value => value.name)).toEqual(['ReusableValue']);

    component.addValue(component.filteredValues()[0]);
    expect(component.filteredValues()).toEqual([]);
  });

  it('should aggregate complex entity-instance values', () => {
    const entity = new DefaultEntity({aspectModelUrn: 'urn:test:1.0.0#Entity', name: 'Entity', metaModelVersion: '2.0.0'});
    const instance = new DefaultEntityInstance({
      aspectModelUrn: 'urn:test:1.0.0#Instance',
      name: 'Instance',
      metaModelVersion: '2.0.0',
      type: entity,
    });
    signalForm.set('dataTypeEntity', entity);
    component.enumValueChange([instance]);

    expect(component.hasComplexValues()).toBe(true);
    expect(component.enumEntityValues()).toEqual([instance]);
    expect(signalForm.value()).toMatchObject({chipList: [instance], enumValues: [instance]});
  });

  it('should retain external values while disabling fields', () => {
    vi.mocked(loadedFiles.isElementExtern).mockReturnValue(true);
    component.initForm();

    expect(component.searchField().disabled()).toBe(true);
    expect(component.chipListField().disabled()).toBe(true);
    expect(signalForm.value().chipList).toEqual([initial]);
  });

  it('should unregister all fields on destroy', () => {
    fixture.destroy();
    expect(signalForm.value()).not.toHaveProperty('values');
    expect(signalForm.value()).not.toHaveProperty('chipList');
    expect(signalForm.value()).not.toHaveProperty('enumValues');
  });
});
