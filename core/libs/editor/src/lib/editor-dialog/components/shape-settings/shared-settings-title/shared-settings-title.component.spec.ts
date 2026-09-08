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

import {LoadedFilesService} from '@ame/cache';
import {LanguageTranslationService} from '@ame/translation';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {DefaultAspect} from '@esmf/aspect-model-loader';
import {MockProvider} from 'ng-mocks';
import {BehaviorSubject, of} from 'rxjs';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {SharedSettingsTitleComponent} from './shared-settings-title.component';

describe('SharedSettingsTitleComponent', () => {
  let component: SharedSettingsTitleComponent;
  let fixture: ComponentFixture<SharedSettingsTitleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SharedSettingsTitleComponent],
      providers: [
        MockProvider(LanguageTranslationService, {
          translateService: {
            langChanges$: new BehaviorSubject('en'),
            load: vi.fn(() => of({})),
            translate: vi.fn((_key, opts) => `Edit ${opts?.value || 'element'}`),
          } as any,
          language: {
            editorCanvas: {
              shapeSetting: {
                edit: 'Edit',
              },
            },
          } as any,
        }),
        MockProvider(LoadedFilesService, {
          isElementExtern: vi.fn(() => false),
        }),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SharedSettingsTitleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and display default title when element is null', () => {
    expect(component).toBeTruthy();
    expect(component.getTitle()).toBe('Edit');
  });

  it('should update title when element input is set', () => {
    const aspect = new DefaultAspect({
      aspectModelUrn: 'urn:test:1.0.0#Aspect',
      name: 'Aspect',
      metaModelVersion: '2.0.0',
    });

    fixture.componentRef.setInput('metaModelElement', aspect);
    fixture.detectChanges();

    expect(component.metaModelElement()).toBe(aspect);
    expect(component.elementName()).toBe('Edit element');
  });
});
