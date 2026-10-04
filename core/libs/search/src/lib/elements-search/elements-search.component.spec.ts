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

import {GraphNavigatorPort, ModelOpenerPort, ModelSessionFacade, ShapeSettingsPort} from '@ame/domain';
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
  let graphNavigator: GraphNavigatorPort;
  let searchesStateService: SearchesStateService;
  let loadedFiles: ModelSessionFacade;
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
        MockProvider(ModelSessionFacade, {
          isElementExtern: vi.fn(() => false),
          getFileFromElement: vi.fn(() => 'TestFile.ttl'),
        }),
        {
          provide: GraphNavigatorPort,
          useValue: {
            searchElements: vi.fn(() => []),
            searchElementsWithDetails: vi.fn(() => []),
            navigateToElement: vi.fn(),
          },
        },
        {
          provide: ShapeSettingsPort,
          useValue: {
            editModel: vi.fn(),
          },
        },
        MockProvider(SearchesStateService, {
          elementsSearch: {close: vi.fn()} as any,
          filesSearch: {close: vi.fn()} as any,
        }),
        {
          provide: ModelOpenerPort,
          useValue: {
            promptAndOpen: vi.fn(() => of(true)),
          },
        },
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
    graphNavigator = TestBed.inject(GraphNavigatorPort);
    searchesStateService = TestBed.inject(SearchesStateService);
    loadedFiles = TestBed.inject(ModelSessionFacade);
    shapeSettingsService = TestBed.inject(ShapeSettingsPort);
    modelOpenerService = TestBed.inject(ModelOpenerPort);
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

    component.results.set([aspect, property].map(item => ({item, score: 1, matches: [], fuzzy: false, partial: false})));

    const transformed = component.transformedElements();
    expect(transformed.length).toBe(2);
    expect(transformed[0].element).toBe(aspect);
    expect(transformed[0].type).toBe('aspect');
    expect(transformed[1].element).toBe(property);
    expect(transformed[1].type).toBe('abstract-property');
  });

  it('should search with details after debouncing the query', async () => {
    const aspect = new DefaultAspect({
      name: 'TestAspect',
      aspectModelUrn: 'urn:samm:org.eclipse.examples:1.0.0#TestAspect',
      metaModelVersion: '2.0.0',
    });
    vi.mocked(graphNavigator.searchElementsWithDetails).mockReturnValue([
      {item: aspect, score: 1, matches: [], fuzzy: false, partial: false},
    ]);

    component.searchQuery.set('Te');
    TestBed.flushEffects();
    component.searchQuery.set('Test');
    TestBed.flushEffects();
    await new Promise(resolve => setTimeout(resolve, 150));

    expect(graphNavigator.searchElementsWithDetails).toHaveBeenCalledWith('Test');
    expect(graphNavigator.searchElementsWithDetails).not.toHaveBeenCalledWith('Te');
    expect(component.elements()).toEqual([aspect]);
  });

  it('should show the matched preferred name or description as hint', () => {
    const property = new DefaultProperty({
      name: 'capacityThresholdExhaustion',
      aspectModelUrn: 'urn:samm:org.eclipse.examples:1.0.0#capacityThresholdExhaustion',
      metaModelVersion: '2.0.0',
    });
    const descriptionMatch = {key: 'description' as const, value: 'Threshold for exhaustion', lang: 'en', terms: ['exhaustion']};
    component.results.set([
      {
        item: property,
        score: 1,
        matches: [{key: 'name', value: property.name, terms: ['exhaustion']}, descriptionMatch],
        fuzzy: false,
        partial: false,
      },
    ]);

    expect(component.transformedElements()[0].hint).toEqual(descriptionMatch);
  });

  it('should flag approximate results', () => {
    const aspect = new DefaultAspect({name: 'A', aspectModelUrn: 'urn:samm:org.eclipse.examples:1.0.0#A', metaModelVersion: '2.0.0'});
    component.searchQuery.set('a b');
    component.results.set([{item: aspect, score: 1, matches: [], fuzzy: false, partial: true}]);
    expect(component.approximateResults()).toBe('partial');

    component.results.set([{item: aspect, score: 1, matches: [], fuzzy: true, partial: false}]);
    expect(component.approximateResults()).toBe('fuzzy');

    component.results.set([{item: aspect, score: 1, matches: [], fuzzy: false, partial: false}]);
    expect(component.approximateResults()).toBeNull();
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
    expect(graphNavigator.navigateToElement).toHaveBeenCalledWith(aspect.aspectModelUrn);
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
