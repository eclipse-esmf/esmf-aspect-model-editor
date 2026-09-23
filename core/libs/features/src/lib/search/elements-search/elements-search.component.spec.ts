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

import {MaxGraphHelper, MaxGraphService} from '@ame/graph';
import {LoadedFilesService} from '@ame/infrastructure';
import {MODEL_OPENER_SERVICE, SearchService, SHAPE_SETTINGS_SERVICE} from '@ame/shared';
import {provideZonelessChangeDetection} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {FormsModule} from '@angular/forms';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {DefaultAspect, DefaultProperty} from '@esmf/aspect-model-loader';
import {TranslocoService} from '@jsverse/transloco';
import {MockProvider} from 'ng-mocks';
import {BehaviorSubject, of, Subject} from 'rxjs';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {SearchesStateService} from '../search-state.service';
import {ElementsSearchComponent} from './elements-search.component';

describe('ElementsSearchComponent', () => {
  let component: ElementsSearchComponent;
  let fixture: ComponentFixture<ElementsSearchComponent>;
  let maxGraphService: MaxGraphService;
  let searchesStateService: SearchesStateService;
  let searchService: SearchService;
  let loadedFiles: LoadedFilesService;
  let shapeSettingsService: any;
  let modelOpenerService: any;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ElementsSearchComponent,
        FormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatAutocompleteModule,
        MatIconModule,
        BrowserAnimationsModule,
      ],
      providers: [
        provideZonelessChangeDetection(),
        MockProvider(LoadedFilesService, {
          isElementExtern: vi.fn(() => false),
          getFileFromElement: vi.fn(() => 'TestFile.ttl'),
        }),
        MockProvider(MaxGraphService, {
          getAllCells: vi.fn(() => []),
          navigateToCellByUrn: vi.fn(),
        }),
        {
          provide: SHAPE_SETTINGS_SERVICE,
          useValue: {
            editModel: vi.fn(),
          },
        },
        MockProvider(SearchesStateService, {
          elementsSearch: {close: vi.fn()} as any,
          filesSearch: {close: vi.fn()} as any,
        }),
        {
          provide: MODEL_OPENER_SERVICE,
          useValue: {
            promptAndOpen: vi.fn(() => of(true)),
          },
        },
        MockProvider(SearchService, {
          search: vi.fn(() => []),
        }),
        MockProvider(TranslocoService, {
          langChanges$: new BehaviorSubject('en'),
          events$: new Subject(),
          translate: vi.fn((key: string) => key),
          selectTranslate: vi.fn(() => of('')),
          _loadDependencies: vi.fn(() => of(undefined)),
          config: {reRenderOnLangChange: false} as any,
        } as Partial<TranslocoService>),
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ElementsSearchComponent);
    component = fixture.componentInstance;
    maxGraphService = TestBed.inject(MaxGraphService);
    searchesStateService = TestBed.inject(SearchesStateService);
    searchService = TestBed.inject(SearchService);
    loadedFiles = TestBed.inject(LoadedFilesService);
    shapeSettingsService = TestBed.inject(SHAPE_SETTINGS_SERVICE);
    modelOpenerService = TestBed.inject(MODEL_OPENER_SERVICE);
    fixture.detectChanges();
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should transform elements and provide symbols', () => {
    const aspect = new DefaultAspect({
      name: 'TestAspect',
      aspectModelUrn: 'urn:samm:org.eclipse.examples:1.0.0#TestAspect',
      metaModelVersion: '2.0.0',
    });

    const property = new DefaultProperty({
      name: 'testProp',
      aspectModelUrn: 'urn:samm:org.eclipse.examples:1.0.0#testProp',
      metaModelVersion: '2.0.0',
    });

    component.elements.set([aspect, property]);

    const transformed = component.transformedElements();
    expect(transformed.length).toBe(2);
    expect(transformed[0].element).toBe(aspect);
    expect(transformed[0].type).toBe('aspect');
    expect(transformed[1].element).toBe(property);
    expect(transformed[1].type).toBe('abstract-property');
  });

  it('should filter elements when search query changes', async () => {
    const mockCell = {} as any;
    const aspect = new DefaultAspect({
      name: 'TestAspect',
      aspectModelUrn: 'urn:samm:org.eclipse.examples:1.0.0#TestAspect',
      metaModelVersion: '2.0.0',
    });
    vi.spyOn(MaxGraphHelper, 'getModelElement').mockReturnValue(aspect);
    vi.spyOn(searchService, 'search').mockReturnValue([mockCell]);

    await new Promise(resolve => setTimeout(resolve, 200));
    component.searchQuery.set('Test');
    TestBed.flushEffects();

    expect(searchService.search).toHaveBeenCalled();
    expect(component.elements()).toEqual([aspect]);
  });

  it('should navigate to local element and edit model', () => {
    const aspect = new DefaultAspect({
      name: 'TestAspect',
      aspectModelUrn: 'urn:samm:org.eclipse.examples:1.0.0#TestAspect',
      metaModelVersion: '2.0.0',
    });
    vi.spyOn(loadedFiles, 'isElementExtern').mockReturnValue(false);

    vi.stubGlobal('requestAnimationFrame', (cb: () => void) => {
      cb();
      return 0;
    });

    component.openElement(aspect);

    expect(shapeSettingsService.editModel).toHaveBeenCalledWith(aspect);
    expect(maxGraphService.navigateToCellByUrn).toHaveBeenCalledWith(aspect.aspectModelUrn);
    expect(searchesStateService.elementsSearch.close).toHaveBeenCalled();
    expect(component.searchQuery()).toBe('');

    vi.unstubAllGlobals();
  });

  it('should delegate to ModelOpenerService.promptAndOpen for external element', () => {
    const aspect = new DefaultAspect({
      name: 'ExternalAspect',
      aspectModelUrn: 'urn:samm:org.eclipse.examples:1.0.0#ExternalAspect',
      metaModelVersion: '2.0.0',
    });
    aspect.isPredefined = false;

    vi.spyOn(loadedFiles, 'isElementExtern').mockReturnValue(true);

    component.openElement(aspect);

    expect(modelOpenerService.promptAndOpen).toHaveBeenCalledWith({
      file: 'TestFile.ttl',
      namespace: 'org.eclipse.examples:1.0.0',
      aspectModelUrn: aspect.aspectModelUrn,
      editElementUrn: aspect.aspectModelUrn,
    });
    expect(searchesStateService.elementsSearch.close).toHaveBeenCalled();
  });
});
