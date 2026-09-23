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
import {MaxGraphService} from '@ame/max-graph';
import {NotificationsService, SearchService} from '@ame/shared';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {DefaultQuantifiable, DefaultUnit, ModelElementCache, RdfModel} from '@esmf/aspect-model-loader';
import {TranslocoTestingModule} from '@jsverse/transloco';
import {Store} from 'n3';
import {MockProvider} from 'ng-mocks';
import {of} from 'rxjs';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {EditorModelService} from '../../../../editor-model.service';
import {EditorSignalFormContext} from '../../../../forms/editor-signal-form-context';
import {EditorDialogValidators} from '../../../../validators';
import {UnitInputFieldComponent} from './unit-input-field.component';

describe('UnitInputFieldComponent', () => {
  let component: UnitInputFieldComponent;
  let fixture: ComponentFixture<UnitInputFieldComponent>;
  let signalForm: EditorSignalFormContext;
  let quantifiable: DefaultQuantifiable;
  let cachedFile: ModelElementCache;
  let loadedFilesService: LoadedFilesService;

  beforeEach(() => {
    vi.stubGlobal('sammUDefinition', {
      units: {
        second: {name: 'second', description: 'Time unit', quantityKinds: ['time']},
        metre: {name: 'metre', description: 'Length unit', quantityKinds: ['length']},
      },
    });
    quantifiable = new DefaultQuantifiable({
      aspectModelUrn: 'urn:test:1.0.0#Quantifiable',
      name: 'Quantifiable',
      metaModelVersion: '2.0.0',
    });
    cachedFile = new ModelElementCache();

    TestBed.configureTestingModule({
      imports: [
        UnitInputFieldComponent,
        BrowserAnimationsModule,
        TranslocoTestingModule.forRoot({langs: {en: {}}, translocoConfig: {availableLangs: ['en'], defaultLang: 'en'}}),
      ],
      providers: [
        MockProvider(EditorModelService, {
          getMetaModelElement: vi.fn(() => of(quantifiable)),
          isReadOnly: vi.fn(() => false),
        }),
        MockProvider(LoadedFilesService, {
          currentLoadedFile: new NamespaceFile(new RdfModel(new Store(), '2.0.0', 'urn:test:1.0.0#'), cachedFile, null),
          isElementExtern: vi.fn(() => false),
        }),
        MockProvider(EditorDialogValidators, {
          duplicateNameWithDifferentTypeValue: vi.fn(value => of(value === 'UsedUnit' ? {checkShapeName: true, foundModel: true} : null)),
        }),
        MockProvider(SearchService),
        MockProvider(MaxGraphService),
        MockProvider(NotificationsService),
      ],
    });

    signalForm = TestBed.runInInjectionContext(() => EditorSignalFormContext.create());
    loadedFilesService = TestBed.inject(LoadedFilesService);
    fixture = TestBed.createComponent(UnitInputFieldComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('signalForm', signalForm);
    fixture.detectChanges();
  });

  it('should register all unit values in the shared form', () => {
    expect(component).toBeTruthy();
    expect(signalForm.value()).toMatchObject({unitDisplay: '', unit: null, changedUnit: null});
    expect(signalForm.valid()).toBe(true);
  });

  it('should require both display and object values for mandatory unit characteristics', () => {
    component.unitRequired.set(true);

    expect(component.hasError('required')).toBe(true);
    expect(signalForm.valid()).toBe(false);

    component.onExistingUnitChange(createUnit('requiredUnit'));
    expect(signalForm.valid()).toBe(true);
  });

  it('should initialize, lock, and preserve an existing unit', () => {
    const unit = createUnit('existingUnit');
    quantifiable.unit = unit;

    component.initUnitFormControl();

    expect(component.displayField().disabled()).toBe(true);
    expect(signalForm.value()).toMatchObject({unitDisplay: 'existingUnit', unit});
  });

  it('should create and unlock a custom unit', () => {
    component.createNewUnit('CustomUnit');

    const unit = signalForm.value().unit as DefaultUnit;
    expect(unit.aspectModelUrn).toBe('urn:test:1.0.0#CustomUnit');
    expect(component.displayField().disabled()).toBe(true);

    component.unlockUnit();
    expect(component.displayField().touched()).toBe(true);
    expect(signalForm.value()).toMatchObject({unitDisplay: '', unit: null, changedUnit: null});
  });

  it('should filter cached and predefined units from the display signal', () => {
    cachedFile.addElement('urn:test:1.0.0#matchingUnit', createUnit('matchingUnit'));

    component.displayField().value.set('matching');
    expect(component.filteredUnits().map(unit => unit.name)).toEqual(['matchingUnit']);

    component.displayField().value.set('met');
    expect(component.filteredPredefinedUnits().map(unit => unit.name)).toEqual(['metre']);
  });

  it('should retain externally owned save values while disabling display field', () => {
    const unit = createUnit('externalUnit');
    quantifiable.unit = unit;
    vi.mocked(loadedFilesService.isElementExtern).mockReturnValue(true);

    component.initUnitFormControl();

    expect(component.displayField().disabled()).toBe(true);
    expect(signalForm.value().unit).toBe(unit);
  });

  it('should propagate async duplicate errors', async () => {
    component.displayField().value.set('UsedUnit');
    fixture.detectChanges();
    await fixture.whenStable();

    await vi.waitFor(() => expect(component.hasError('checkShapeName')).toBe(true));
    expect(signalForm.valid()).toBe(false);
  });

  it('should unregister all dynamic fields on destroy', () => {
    fixture.destroy();

    expect(signalForm.value()).not.toHaveProperty('unitDisplay');
    expect(signalForm.value()).not.toHaveProperty('unit');
    expect(signalForm.value()).not.toHaveProperty('changedUnit');
  });

  function createUnit(name: string): DefaultUnit {
    return new DefaultUnit({
      aspectModelUrn: `urn:test:1.0.0#${name}`,
      name,
      metaModelVersion: '2.0.0',
      quantityKinds: [],
    });
  }
});
