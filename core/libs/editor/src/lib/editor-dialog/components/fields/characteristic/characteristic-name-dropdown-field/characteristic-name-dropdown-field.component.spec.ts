/*
 * Copyright (c) 2026 Robert Bosch Manufacturing Solutions GmbH
 * SPDX-License-Identifier: MPL-2.0
 */

import {LoadedFilesService, NamespaceFile} from '@ame/cache';
import {CharacteristicClassType} from '@ame/editor';
import {ModelElementNamingService} from '@ame/meta-model';
import {ModelService} from '@ame/rdf/services';
import {SammLanguageSettingsService} from '@ame/settings-dialog';
import {ElementCreatorService} from '@ame/shared';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {
  DefaultCharacteristic,
  DefaultDuration,
  DefaultMeasurement,
  DefaultUnit,
  ModelElementCache,
  RdfModel,
} from '@esmf/aspect-model-loader';
import {Store} from 'n3';
import {MockProvider} from 'ng-mocks';
import {of} from 'rxjs';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {EditorModelService} from '../../../../editor-model.service';
import {EditorSignalFormContext} from '../../../../forms/editor-signal-form-context';
import {CharacteristicNameDropdownFieldComponent} from './characteristic-name-dropdown-field.component';

describe('CharacteristicNameDropdownFieldComponent', () => {
  let component: CharacteristicNameDropdownFieldComponent;
  let fixture: ComponentFixture<CharacteristicNameDropdownFieldComponent>;
  let signalForm: EditorSignalFormContext;
  let editorModelService: EditorModelService;
  let elementCreatorService: ElementCreatorService;
  const characteristic = new DefaultCharacteristic({
    aspectModelUrn: 'urn:test:1.0.0#Characteristic',
    name: 'Characteristic',
    metaModelVersion: '2.0.0',
  });

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [CharacteristicNameDropdownFieldComponent, BrowserAnimationsModule],
      providers: [
        MockProvider(EditorModelService, {
          getMetaModelElement: vi.fn(() => of(characteristic)),
          updateMetaModelElement: vi.fn(),
          originalMetaModel: characteristic,
        }),
        MockProvider(LoadedFilesService, {
          currentLoadedFile: new NamespaceFile(new RdfModel(new Store(), '2.0.0', 'urn:test:1.0.0#'), new ModelElementCache(), null),
        }),
        MockProvider(ModelElementNamingService),
        MockProvider(ModelService),
        MockProvider(SammLanguageSettingsService, {getSammLanguageCodes: vi.fn(() => [])}),
        MockProvider(ElementCreatorService, {
          createEmptyElement: vi.fn((cls: any) => new cls({aspectModelUrn: 'urn:test:1.0.0#New', name: 'New', metaModelVersion: '2.0.0'})),
        }),
      ],
    });
    signalForm = TestBed.runInInjectionContext(() => EditorSignalFormContext.create());
    editorModelService = TestBed.inject(EditorModelService);
    elementCreatorService = TestBed.inject(ElementCreatorService);
    fixture = TestBed.createComponent(CharacteristicNameDropdownFieldComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('signalForm', signalForm);
  });

  it('should initialize class and predefined-instance groups', () => {
    fixture.detectChanges();

    expect(component.listCharacteristicGroup().get('Classes')).toContain(CharacteristicClassType.Measurement);
    expect(component.listCharacteristicGroup().get('Instances')).toContain('Boolean');
    expect(component.listCharacteristics.size).toBeGreaterThan(20);
  });

  it('should emit the current characteristic class on initialization', () => {
    const selected = vi.fn();
    component.selectedCharacteristic.subscribe(selected);

    fixture.detectChanges();

    expect(selected).toHaveBeenCalledWith(CharacteristicClassType.Characteristic);
  });

  it('should route changed model output through Signal Forms', () => {
    fixture.detectChanges();
    const measurement = new DefaultMeasurement({
      aspectModelUrn: 'urn:test:1.0.0#Measurement',
      name: 'Measurement',
      metaModelVersion: '2.0.0',
    });
    component.metaModelElement = measurement;

    component.updateFields(measurement);

    expect(signalForm.value().changedMetaModel).toBe(measurement);
    expect(editorModelService.updateMetaModelElement).toHaveBeenCalledWith(measurement);
  });

  it('should preserve unit when changing characteristic class from Measurement to Duration', () => {
    fixture.detectChanges();

    const unit = new DefaultUnit({
      name: 'second',
      aspectModelUrn: 'urn:samm:org.eclipse.esmf.samm:unit:2.0.0#second',
      metaModelVersion: '2.0.0',
      quantityKinds: [],
    });
    const measurement = new DefaultMeasurement({
      aspectModelUrn: 'urn:test:1.0.0#Measurement1',
      name: 'Measurement1',
      metaModelVersion: '2.0.0',
      unit,
    });

    component.metaModelElement = measurement;
    component.selectedMetaModelElement = measurement;

    component.onCharacteristicChange(CharacteristicClassType.Duration);

    expect(component.metaModelElement).toBeInstanceOf(DefaultDuration);
    expect((component.metaModelElement as DefaultDuration).unit).toBe(unit);
    expect((component.metaModelElement as DefaultDuration).name).toBe('Measurement1');
    expect(editorModelService.updateMetaModelElement).toHaveBeenCalledWith(component.metaModelElement);
  });
});
