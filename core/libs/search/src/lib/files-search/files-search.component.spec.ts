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

import {beforeEach, describe, expect, it, vi} from 'vitest';

import {ModelCheckerPort, ModelOpenerPort, WorkspaceNamespacesService} from '@ame/domain';
import {LanguageTranslationService, NotificationsService, SearchService} from '@ame/shared';
import {provideHttpClient, withXhr} from '@angular/common/http';
import {provideHttpClientTesting} from '@angular/common/http/testing';
import {provideZonelessChangeDetection, signal} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {FormsModule} from '@angular/forms';
import {MatDialogRef} from '@angular/material/dialog';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {By} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {TranslocoService} from '@jsverse/transloco';
import {MockProvider} from 'ng-mocks';
import {BehaviorSubject, of, Subject} from 'rxjs';
import {SearchesStateService} from '../search-state.service';
import {FilesSearchComponent} from './files-search.component';

describe('Files search', () => {
  let component: FilesSearchComponent;
  let fixture: ComponentFixture<FilesSearchComponent>;
  let searchesStateService: SearchesStateService;
  let notificationService: NotificationsService;
  let namespacesState: WorkspaceNamespacesService;
  let searchService: SearchService;
  let modelOpenerService: any;

  const files = [
    {
      name: 'AspectDefault.ttl',
      loaded: true,
      outdated: false,
      errored: false,
      sammVersion: '2.1.0',
      aspectModelUrn: 'urn:samm:org.eclipse.examples:1.0.0#AspectDefault',
    },
    {
      name: 'SharedModel.ttl',
      outdated: false,
      errored: false,
      loaded: false,
      sammVersion: '2.1.0',
      aspectModelUrn: 'urn:samm:org.eclipse.examples:1.0.0#SharedModel',
    },
  ];

  const namespaces = {
    'org.eclipse.examples:1.0.0': files,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FilesSearchComponent, FormsModule, MatFormFieldModule, MatInputModule, BrowserAnimationsModule],
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(withXhr()),
        provideHttpClientTesting(),
        MockProvider(MatDialogRef),
        MockProvider(NotificationsService, {
          warning: vi.fn(),
        }),
        MockProvider(TranslocoService, {
          langChanges$: new BehaviorSubject('en'),
          events$: new Subject(),
          translate: vi.fn(() => ''),
          selectTranslate: vi.fn(() => of('')),
          _loadDependencies: vi.fn(() => of(undefined)),
          config: {reRenderOnLangChange: false} as any,
        } as Partial<TranslocoService>),
        MockProvider(SearchesStateService, {
          filesSearch: {close: vi.fn()} as any,
          elementsSearch: {close: vi.fn()} as any,
        }),
        {
          provide: WorkspaceNamespacesService,
          useValue: {
            namespaces: signal(namespaces),
            getFile: vi.fn(),
            applyFileStatuses: vi.fn(() => ({})),
          },
        },
        {
          provide: ModelOpenerPort,
          useValue: {
            promptAndOpen: vi.fn(() => of(true)),
          },
        },
        MockProvider(SearchService, {
          search: vi.fn(() => []),
        }),
        MockProvider(LanguageTranslationService, {
          language: {
            searches: {
              files: {
                notifications: {
                  title: 'Title',
                  errorMessage: 'Error message',
                  alreadyLoadedFileMessage: 'Already loaded',
                },
              },
            },
          } as any,
        }),
        {
          provide: ModelCheckerPort,
          useValue: {
            detectWorkspaceErrors: vi.fn(() => of([])),
          },
        },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FilesSearchComponent);
    component = fixture.componentInstance;
    searchesStateService = TestBed.inject(SearchesStateService);
    notificationService = TestBed.inject(NotificationsService);
    namespacesState = TestBed.inject(WorkspaceNamespacesService);
    searchService = TestBed.inject(SearchService);
    modelOpenerService = TestBed.inject(ModelOpenerPort);
    fixture.detectChanges();
  });

  it('should parse files correctly', () => {
    component.parseFiles(namespaces as any);

    expect(component.searchableFiles()).toEqual([
      {
        file: 'AspectDefault.ttl',
        namespace: 'org.eclipse.examples:1.0.0',
        aspectModelUrn: 'urn:samm:org.eclipse.examples:1.0.0#AspectDefault',
      },
      {file: 'SharedModel.ttl', namespace: 'org.eclipse.examples:1.0.0', aspectModelUrn: 'urn:samm:org.eclipse.examples:1.0.0#SharedModel'},
    ]);
  });

  it('should have mat option if there are namespaces with files', () => {
    vi.spyOn(component, 'openFile');

    component.searchableFiles.set([
      {
        file: 'AspectDefault.ttl',
        namespace: 'org.eclipse.examples:1.0.0',
        aspectModelUrn: 'urn:samm:org.eclipse.examples:1.0.0#AspectDefault',
      },
    ]);
    fixture.detectChanges();
    const autocomplete = fixture.debugElement.query(By.css('mat-autocomplete'));
    expect(autocomplete).toBeTruthy();
    fixture.detectChanges();
    const matOptions = autocomplete.nativeElement.querySelectorAll('mat-option');
    expect(matOptions).toBeTruthy();
  });

  it('should close search overlay', () => {
    component.closeSearch();
    expect(searchesStateService.filesSearch.close).toHaveBeenCalled();
  });

  it('should delegate to ModelOpenerService.promptAndOpen on openFile', () => {
    const mockFileStatus: any = {
      name: 'SharedModel.ttl',
      loaded: false,
      outdated: false,
      errored: false,
      sammVersion: '2.1.0',
      aspectModelUrn: 'urn:samm:org.eclipse.examples:1.0.0#SharedModel',
    };
    vi.spyOn(namespacesState, 'getFile').mockReturnValue(mockFileStatus);

    component.openFile({
      file: 'SharedModel.ttl',
      namespace: 'org.eclipse.examples:1.0.0',
      aspectModelUrn: 'urn:samm:org.eclipse.examples:1.0.0#SharedModel',
    });

    expect(modelOpenerService.promptAndOpen).toHaveBeenCalledWith({
      file: 'SharedModel.ttl',
      namespace: 'org.eclipse.examples:1.0.0',
      aspectModelUrn: 'urn:samm:org.eclipse.examples:1.0.0#SharedModel',
    });
    expect(component.searchQuery()).toBe('');
    expect(searchesStateService.filesSearch.close).toHaveBeenCalled();
  });

  it('should warn if file is already loaded or errored', () => {
    const mockFileStatus: any = {
      name: 'SharedModel.ttl',
      loaded: true,
      outdated: false,
      errored: false,
      sammVersion: '2.1.0',
      aspectModelUrn: 'urn:samm:org.eclipse.examples:1.0.0#SharedModel',
    };
    vi.spyOn(namespacesState, 'getFile').mockReturnValue(mockFileStatus);

    component.openFile({
      file: 'SharedModel.ttl',
      namespace: 'org.eclipse.examples:1.0.0',
      aspectModelUrn: 'urn:samm:org.eclipse.examples:1.0.0#SharedModel',
    });

    expect(notificationService.warning).toHaveBeenCalled();
    expect(modelOpenerService.promptAndOpen).not.toHaveBeenCalled();
  });

  it('should filter files when searchQuery changes', async () => {
    const mockSearchResults = [{file: 'AspectDefault.ttl', namespace: 'org.eclipse.examples:1.0.0', aspectModelUrn: ''}];
    vi.spyOn(searchService, 'search').mockReturnValue(mockSearchResults as any);

    await new Promise(resolve => setTimeout(resolve, 200));
    component.searchQuery.set('Aspect');
    TestBed.flushEffects();

    expect(searchService.search).toHaveBeenCalled();
    expect(component.searchableFiles()).toEqual(mockSearchResults);

    await new Promise(resolve => setTimeout(resolve, 200));
    component.searchQuery.set('');
    TestBed.flushEffects();
    expect(component.searchableFiles().length).toBe(2);
  });
});
