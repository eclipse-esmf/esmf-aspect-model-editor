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

import {MaxGraphService} from '@ame/max-graph';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {DefaultAspect} from '@esmf/aspect-model-loader';
import {TranslocoTestingModule} from '@jsverse/transloco';
import {MockProvider} from 'ng-mocks';
import {of} from 'rxjs';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {EditorModelService} from '../../../../editor-model.service';
import {LocateElementComponent} from './locate-element.component';

describe('LocateElementComponent', () => {
  let component: LocateElementComponent;
  let fixture: ComponentFixture<LocateElementComponent>;
  let maxGraphService: MaxGraphService;

  const aspect = new DefaultAspect({
    aspectModelUrn: 'urn:test:1.0.0#Aspect',
    name: 'Aspect',
    metaModelVersion: '2.0.0',
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        LocateElementComponent,
        TranslocoTestingModule.forRoot({langs: {en: {}}, translocoConfig: {availableLangs: ['en'], defaultLang: 'en'}}),
      ],
      providers: [
        MockProvider(EditorModelService, {
          getMetaModelElement: vi.fn(() => of(aspect)),
        }),
        MockProvider(MaxGraphService, {
          navigateToCellByUrn: vi.fn(),
        }),
      ],
    }).compileComponents();

    maxGraphService = TestBed.inject(MaxGraphService);
    fixture = TestBed.createComponent(LocateElementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and receive element', () => {
    expect(component).toBeTruthy();
    expect(component.element()).toBe(aspect);
  });

  it('should navigate to cell by urn on locate', () => {
    component.locate();
    expect(maxGraphService.navigateToCellByUrn).toHaveBeenCalledWith(aspect.aspectModelUrn);
  });
});
