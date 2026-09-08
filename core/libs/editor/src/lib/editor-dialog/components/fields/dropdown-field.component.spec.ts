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

import {LoadedFilesService, NamespaceFile} from '@ame/cache';
import {ModelService} from '@ame/rdf/services';
import {SammLanguageSettingsService} from '@ame/settings-dialog';
import {Component} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {DefaultCharacteristic, ModelElementCache, RdfModel} from '@esmf/aspect-model-loader';
import {Store} from 'n3';
import {MockProvider} from 'ng-mocks';
import {of} from 'rxjs';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {EditorModelService} from '../../editor-model.service';
import {EditorSignalFormContext} from '../../forms/editor-signal-form-context';
import {DropdownFieldComponent} from './dropdown-field.component';

@Component({
  selector: 'ame-test-dropdown-field',
  template: '',
  imports: [],
})
class TestDropdownFieldComponent extends DropdownFieldComponent<DefaultCharacteristic> {
  public triggerSetPreviousData() {
    this.setPreviousData();
  }
}

describe('DropdownFieldComponent', () => {
  let component: TestDropdownFieldComponent;
  let fixture: ComponentFixture<TestDropdownFieldComponent>;
  let signalForm: EditorSignalFormContext;
  let characteristic: DefaultCharacteristic;
  let editorModelService: EditorModelService;

  beforeEach(() => {
    characteristic = new DefaultCharacteristic({
      aspectModelUrn: 'urn:test:1.0.0#TestCharacteristic',
      name: 'TestCharacteristic',
      metaModelVersion: '2.0.0',
    });

    const cachedFile = new ModelElementCache();
    const rdfModel = new RdfModel(new Store(), '2.0.0', 'urn:test:1.0.0#');

    TestBed.configureTestingModule({
      imports: [TestDropdownFieldComponent],
      providers: [
        MockProvider(EditorModelService, {
          getMetaModelElement: vi.fn(() => of(characteristic)),
          updateMetaModelElement: vi.fn(),
          originalMetaModel: characteristic,
        }),
        MockProvider(ModelService),
        MockProvider(SammLanguageSettingsService, {
          getSammLanguageCodes: vi.fn(() => ['en', 'de']),
        }),
        MockProvider(LoadedFilesService, {
          currentLoadedFile: new NamespaceFile(rdfModel, cachedFile, null),
        }),
      ],
    });

    signalForm = TestBed.runInInjectionContext(() => EditorSignalFormContext.create());
    editorModelService = TestBed.inject(EditorModelService);

    fixture = TestBed.createComponent(TestDropdownFieldComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('signalForm', signalForm);
    component.metaModelElement = characteristic;
    component.selectedMetaModelElement = characteristic;
    fixture.detectChanges();
  });

  it('should create and provide originalCharacteristic', () => {
    expect(component).toBeTruthy();
    expect(component.originalCharacteristic).toBe(characteristic);
  });

  it('should set metaModelClassName based on selected element', () => {
    component.setMetaModelClassName();
    expect(component.metaModelClassName).toBe('Characteristic');
  });

  it('should set metaModelClassName for anonymous characteristics without split hash issues', () => {
    const anonChar = new DefaultCharacteristic({
      aspectModelUrn: '_:n3-29',
      name: '[Characteristic]',
      metaModelVersion: '2.0.0',
      isAnonymous: true,
    });
    component.selectedMetaModelElement = anonChar;
    component.setMetaModelClassName();
    expect(component.metaModelClassName).toBe('Characteristic');
  });

  it('should set metaModelClassName for predefined characteristics', () => {
    const predefined = new DefaultCharacteristic({
      aspectModelUrn: 'urn:samm:org.eclipse.esmf.samm:characteristic:2.2.0#Text',
      name: 'Text',
      metaModelVersion: '2.2.0',
      isPredefined: true,
    });
    component.selectedMetaModelElement = predefined;
    component.setMetaModelClassName();
    expect(component.metaModelClassName).toBe('Text');
  });

  it('should add language settings keys if missing', () => {
    component.addLanguageSettings(characteristic);
    expect(characteristic.descriptions.has('en')).toBe(true);
    expect(characteristic.descriptions.has('de')).toBe(true);
    expect(characteristic.preferredNames.has('en')).toBe(true);
    expect(characteristic.preferredNames.has('de')).toBe(true);
  });

  it('should update fields and signalForm changedMetaModel', () => {
    const newChar = new DefaultCharacteristic({
      aspectModelUrn: 'urn:test:1.0.0#NewChar',
      name: 'NewChar',
      metaModelVersion: '2.0.0',
    });

    component.updateFields(newChar);

    expect(editorModelService.updateMetaModelElement).toHaveBeenCalledWith(characteristic);
    expect(signalForm.value().changedMetaModel).toBe(newChar);
  });

  it('should set and emit previousData snapshot', () => {
    let emitted = null;
    component.previousData.subscribe(val => (emitted = val));

    signalForm.set('value', 'customVal');
    component.triggerSetPreviousData();

    expect(emitted).toBeTruthy();
    expect(emitted.value[characteristic.className]).toBe('customVal');
  });
});
