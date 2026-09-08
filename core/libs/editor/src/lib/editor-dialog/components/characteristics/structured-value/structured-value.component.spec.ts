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
import {RdfService} from '@ame/rdf/services';
import {NotificationsService, SearchService} from '@ame/shared';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MatDialog} from '@angular/material/dialog';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {DefaultAspect, DefaultProperty, DefaultStructuredValue, ModelElementCache, RdfModel} from '@esmf/aspect-model-loader';
import {TranslocoTestingModule} from '@jsverse/transloco';
import {Store} from 'n3';
import {MockProvider} from 'ng-mocks';
import {of} from 'rxjs';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {EditorModelService} from '../../../editor-model.service';
import {EditorSignalFormContext} from '../../../forms/editor-signal-form-context';
import {PredefinedRulesService} from './predefined-rules.service';
import {StructuredValueComponent} from './structured-value.component';

describe('StructuredValueComponent', () => {
  let component: StructuredValueComponent;
  let fixture: ComponentFixture<StructuredValueComponent>;
  let signalForm: EditorSignalFormContext;
  let loadedFilesService: LoadedFilesService;

  const dummyAspect = new DefaultAspect({
    aspectModelUrn: 'urn:test:1.0.0#Aspect',
    name: 'Aspect',
    metaModelVersion: '2.0.0',
  });
  const elementProperty = new DefaultProperty({
    aspectModelUrn: 'urn:test:1.0.0#elementProperty',
    name: 'elementProperty',
    metaModelVersion: '2.0.0',
  });

  const structuredValue = new DefaultStructuredValue({
    aspectModelUrn: 'urn:test:1.0.0#TestStructuredValue',
    name: 'TestStructuredValue',
    metaModelVersion: '2.0.0',
    deconstructionRule: '(.*)',
    elements: [elementProperty],
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        StructuredValueComponent,
        BrowserAnimationsModule,
        TranslocoTestingModule.forRoot({langs: {en: {}}, translocoConfig: {availableLangs: ['en'], defaultLang: 'en'}}),
      ],
      providers: [
        MockProvider(EditorModelService, {
          getMetaModelElement: vi.fn(() => of(structuredValue)),
          isReadOnly: vi.fn(() => false),
        }),
        MockProvider(LoadedFilesService, {
          currentLoadedFile: new NamespaceFile(new RdfModel(new Store(), '2.0.0', 'urn:test:1.0.0#'), new ModelElementCache(), dummyAspect),
          isElementExtern: vi.fn(() => false),
        }),
        PredefinedRulesService,
        MockProvider(MatDialog, {open: vi.fn()}),
        MockProvider(MaxGraphService),
        MockProvider(NotificationsService),
        MockProvider(RdfService),
        MockProvider(SearchService),
      ],
    }).compileComponents();

    signalForm = TestBed.runInInjectionContext(() => EditorSignalFormContext.create());
    loadedFilesService = TestBed.inject(LoadedFilesService);
    fixture = TestBed.createComponent(StructuredValueComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('signalForm', signalForm);
    fixture.detectChanges();
  });

  it('should create and initialize form with rules', () => {
    expect(component).toBeTruthy();
    expect(component.selectedRule()).toBeDefined();
    expect(component.predefinedRules().length).toBeGreaterThan(0);
  });

  it('should aggregate rule and elements in the shared Signal Forms context', () => {
    expect(signalForm.value()).toMatchObject({
      deconstructionRule: structuredValue.deconstructionRule,
      elements: structuredValue.elements,
    });
    expect(component.deconstructionRuleField().touched()).toBe(true);
  });

  it('should validate required and malformed regular expressions', () => {
    component.deconstructionRuleField().value.set('');
    expect(component.hasRuleError('required')).toBe(true);

    component.deconstructionRuleField().value.set('[');
    expect(component.hasRuleError('regexValidator')).toBe(true);
    expect(signalForm.valid()).toBe(false);

    component.deconstructionRuleField().value.set('(.*)');
    expect(component.deconstructionRuleField().valid()).toBe(true);
  });

  it('should select a predefined rule, lock it, and restore custom editing', () => {
    const rule = component.predefinedRules()[0];
    const predefinedRule = TestBed.inject(PredefinedRulesService).getRule(rule.regex);

    component.selectPredefinedRule(rule);

    expect(component.selectedRule()).toBe(rule.regex);
    expect(component.deconstructionRuleField().disabled()).toBe(true);
    expect(signalForm.value()).toMatchObject({deconstructionRule: rule.regex, elements: predefinedRule.elements});

    component.setCustomRule();
    expect(component.deconstructionRuleField().disabled()).toBe(false);
    expect(signalForm.value().deconstructionRule).toBe(structuredValue.deconstructionRule);
  });

  it('should invalidate unassigned regex groups', () => {
    component.groups = [{start: 0, end: 3, text: '(.*)'}];

    expect(component.hasGroupsError).toBe(true);
  });

  it('should retain externally owned values while disabling deconstruction rule field', () => {
    vi.mocked(loadedFilesService.isElementExtern).mockReturnValue(true);

    component.initForm();

    expect(component.deconstructionRuleField().disabled()).toBe(true);
    expect(signalForm.value()).toMatchObject({
      deconstructionRule: structuredValue.deconstructionRule,
      elements: structuredValue.elements,
    });
  });

  it('should apply property assignments returned by the elements modal', () => {
    const property = new DefaultProperty({
      aspectModelUrn: 'urn:test:1.0.0#property',
      name: 'property',
      metaModelVersion: '2.0.0',
    });
    component.groups = [{start: 0, end: 3, text: '(.*)'}];
    vi.mocked(TestBed.inject(MatDialog).open).mockReturnValue({
      beforeClosed: () => of({'[0-3] -> (.*)': property}),
      afterClosed: () => of({'[0-3] -> (.*)': property}),
    } as never);

    component.openModal();

    expect(component.groups[0].property).toBe(property);
    expect(signalForm.value().elements).toContain(property);
  });

  it('should unregister both fields on destroy', () => {
    fixture.destroy();

    expect(signalForm.value()).not.toHaveProperty('deconstructionRule');
    expect(signalForm.value()).not.toHaveProperty('elements');
  });
});
