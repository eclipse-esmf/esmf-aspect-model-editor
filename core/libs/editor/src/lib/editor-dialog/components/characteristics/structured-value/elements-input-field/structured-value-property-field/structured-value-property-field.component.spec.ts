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
import {ElementCreatorService} from '@ame/shared';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {DefaultAspect, DefaultProperty, ModelElementCache, RdfModel} from '@esmf/aspect-model-loader';
import {TranslocoTestingModule} from '@jsverse/transloco';
import {Store} from 'n3';
import {MockProvider} from 'ng-mocks';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {EditorDialogValidators} from '../../../../../validators';
import {StructuredValuePropertyFieldComponent} from './structured-value-property-field.component';

describe('StructuredValuePropertyFieldComponent', () => {
  let component: StructuredValuePropertyFieldComponent;
  let fixture: ComponentFixture<StructuredValuePropertyFieldComponent>;

  const dummyAspect = new DefaultAspect({
    aspectModelUrn: 'urn:test:1.0.0#Aspect',
    name: 'Aspect',
    metaModelVersion: '2.0.0',
  });

  const defaultProp = new DefaultProperty({
    aspectModelUrn: 'urn:test:1.0.0#testProp',
    name: 'testProp',
    metaModelVersion: '2.0.0',
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        StructuredValuePropertyFieldComponent,
        BrowserAnimationsModule,
        TranslocoTestingModule.forRoot({langs: {en: {}}, translocoConfig: {availableLangs: ['en'], defaultLang: 'en'}}),
      ],
      providers: [
        MockProvider(LoadedFilesService, {
          currentLoadedFile: new NamespaceFile(new RdfModel(new Store(), '2.0.0', 'urn:test:1.0.0#'), new ModelElementCache(), dummyAspect),
          isElementExtern: vi.fn(() => false),
        }),
        MockProvider(ElementCreatorService),
        EditorDialogValidators,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(StructuredValuePropertyFieldComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('defaultProperty', defaultProp);
    fixture.detectChanges();
  });

  it('should create and initialize the signal form', () => {
    expect(component).toBeTruthy();
    expect(component.displayForm).toBeDefined();
    expect(component.displayModel()).toBe('testProp');
    expect(component.locked()).toBe(true);
  });

  it('should unlock and clear both signal models', () => {
    const propertyChangeSpy = vi.fn();
    component.propertyChange.subscribe(propertyChangeSpy);

    component.unlock();
    expect(component.locked()).toBe(false);
    expect(component.displayModel()).toBe('');
    expect(propertyChangeSpy).toHaveBeenCalledWith(null);
  });

  it('should update and emit property on selection', () => {
    const propertyChangeSpy = vi.fn();
    component.propertyChange.subscribe(propertyChangeSpy);

    component.unlock();
    component.onSelectionChange(defaultProp);

    expect(component.displayModel()).toBe('testProp');
    expect(component.locked()).toBe(true);
    expect(propertyChangeSpy).toHaveBeenCalledWith(defaultProp);
  });
});
