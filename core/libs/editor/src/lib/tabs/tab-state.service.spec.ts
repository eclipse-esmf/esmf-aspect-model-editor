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

import {LoadedFilesService, NamespaceFile} from '@ame/domain';
import {MaxGraphService} from '@ame/graph';
import {BrowserService, TauriSignalsService, TitleService} from '@ame/shared';
import {provideZonelessChangeDetection, signal} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {MockProvider} from 'ng-mocks';
import {of, Subject} from 'rxjs';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {FileHandlingService} from '../editor-toolbar/services/file-handling.service';
import {ModelRendererService} from '../model-renderer.service';
import {ModelSavingTrackerService} from '../model-saving-tracker.service';
import {SaveModelDialogService} from '../save-model-dialog/save-model-dialog.service';
import {TabStateService} from './tab-state.service';

describe('TabStateService', () => {
  let service: TabStateService;
  let loadedFilesService: LoadedFilesService;
  let titleService: TitleService;
  let modelRenderer: ModelRendererService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        TabStateService,
        provideZonelessChangeDetection(),
        MockProvider(MaxGraphService, {
          graphModelChanged$: new Subject<void>(),
        }),
        MockProvider(LoadedFilesService, {
          getSnapshot: vi.fn(() => ({'mock-file': {} as any})),
          setFiles: vi.fn(),
          hasAspect: signal(false) as any,
        }),
        MockProvider(ModelSavingTrackerService, {
          getSavedModel: vi.fn(() => 'test-rdf'),
          setSavedModel: vi.fn(),
          isSaved$: of(true),
        }),
        MockProvider(TitleService, {
          updateTitle: vi.fn(),
        }),
        MockProvider(TauriSignalsService, {
          call: vi.fn(),
        }),
        MockProvider(ModelRendererService, {
          renderModel: vi.fn(() => of(true)),
        }),
        MockProvider(FileHandlingService, {
          loadNamespaceFile: vi.fn(),
          loadEmptyModel: vi.fn(() => of(undefined as unknown as void)),
        }),
        MockProvider(SaveModelDialogService, {
          openDialog: vi.fn(() => of(true)),
        }),
        MockProvider(BrowserService, {
          isStartedAsTauriApp: vi.fn(() => false),
        }),
      ],
    });

    service = TestBed.inject(TabStateService);
    loadedFilesService = TestBed.inject(LoadedFilesService);
    titleService = TestBed.inject(TitleService);
    modelRenderer = TestBed.inject(ModelRendererService);
  });

  it('should initialize with empty tabs and null active tab', () => {
    expect(service.tabs()).toEqual([]);
    expect(service.activeTabId()).toBeNull();
    expect(service.activeTab()).toBeNull();
    expect(service.hasMultipleTabs()).toBe(false);
  });

  it('should add a tab when onModelLoaded is called', () => {
    const mockFile = {
      name: 'AspectDefault.ttl',
      namespace: 'org.eclipse.examples:1.0.0',
      absoluteName: 'org.eclipse.examples:1.0.0:AspectDefault.ttl',
      aspect: {aspectModelUrn: 'urn:samm:org.eclipse.examples:1.0.0#AspectDefault'},
    } as unknown as NamespaceFile;

    service.onModelLoaded(mockFile, true);

    expect(service.tabs().length).toBe(1);
    expect(service.activeTabId()).toBe('org.eclipse.examples:1.0.0:AspectDefault.ttl');
    expect(service.activeTab()?.file).toBe('AspectDefault.ttl');
    expect(titleService.updateTitle).toHaveBeenCalledWith('org.eclipse.examples:1.0.0:AspectDefault.ttl');
  });

  describe('replacing the model of a tab (open in current tab)', () => {
    const file = (name: string) =>
      ({
        name,
        namespace: 'org.eclipse.examples:1.0.0',
        absoluteName: `org.eclipse.examples:1.0.0:${name}`,
        aspect: {aspectModelUrn: `urn:samm:org.eclipse.examples:1.0.0#${name.replace('.ttl', '')}`},
      }) as unknown as NamespaceFile;
    const ids = () => service.tabs().map(tab => tab.id);

    it('shows the new model in place of the replaced tab and keeps the tab order', () => {
      service.onModelLoaded(file('A.ttl'), true);
      service.onModelLoaded(file('B.ttl'), true);
      service.onModelLoaded(file('C.ttl'), true);

      service.onModelLoaded(file('D.ttl'), true, undefined, 'org.eclipse.examples:1.0.0:B.ttl');

      expect(ids()).toEqual(['org.eclipse.examples:1.0.0:A.ttl', 'org.eclipse.examples:1.0.0:D.ttl', 'org.eclipse.examples:1.0.0:C.ttl']);
      expect(service.activeTabId()).toBe('org.eclipse.examples:1.0.0:D.ttl');
      expect(service.activeTab()?.aspectModelUrn).toBe('urn:samm:org.eclipse.examples:1.0.0#D');
    });

    it('removes the replaced tab when the model is already open in another tab', () => {
      service.onModelLoaded(file('A.ttl'), true);
      service.onModelLoaded(file('B.ttl'), true);

      service.onModelLoaded(file('A.ttl'), true, undefined, 'org.eclipse.examples:1.0.0:B.ttl');

      expect(ids()).toEqual(['org.eclipse.examples:1.0.0:A.ttl']);
      expect(service.activeTabId()).toBe('org.eclipse.examples:1.0.0:A.ttl');
    });

    it('adds a tab as before when the tab to replace does not exist anymore', () => {
      service.onModelLoaded(file('A.ttl'), true);

      service.onModelLoaded(file('B.ttl'), true, undefined, 'org.eclipse.examples:1.0.0:Gone.ttl');

      expect(ids()).toEqual(['org.eclipse.examples:1.0.0:A.ttl', 'org.eclipse.examples:1.0.0:B.ttl']);
    });

    it('reloading the model of the replaced tab itself keeps the single tab', () => {
      service.onModelLoaded(file('A.ttl'), true);

      service.onModelLoaded(file('A.ttl'), true, undefined, 'org.eclipse.examples:1.0.0:A.ttl');

      expect(ids()).toEqual(['org.eclipse.examples:1.0.0:A.ttl']);
    });
  });

  it('should switch tabs and restore files snapshot and render model', () => {
    const mockFile1 = {
      name: 'Model1.ttl',
      namespace: 'org.eclipse.examples:1.0.0',
      absoluteName: 'org.eclipse.examples:1.0.0:Model1.ttl',
      aspect: {aspectModelUrn: 'urn:samm:org.eclipse.examples:1.0.0#Model1'},
    } as unknown as NamespaceFile;

    const mockFile2 = {
      name: 'Model2.ttl',
      namespace: 'org.eclipse.examples:1.0.0',
      absoluteName: 'org.eclipse.examples:1.0.0:Model2.ttl',
      aspect: {aspectModelUrn: 'urn:samm:org.eclipse.examples:1.0.0#Model2'},
    } as unknown as NamespaceFile;

    service.onModelLoaded(mockFile1);
    service.onModelLoaded(mockFile2);

    expect(service.tabs().length).toBe(2);
    expect(service.activeTabId()).toBe('org.eclipse.examples:1.0.0:Model2.ttl');
    expect(service.hasMultipleTabs()).toBe(true);

    service.switchToTab('org.eclipse.examples:1.0.0:Model1.ttl').subscribe();

    expect(service.activeTabId()).toBe('org.eclipse.examples:1.0.0:Model1.ttl');
    expect(loadedFilesService.setFiles).toHaveBeenCalled();
    expect(modelRenderer.renderModel).toHaveBeenCalled();
  });

  it('should find existing tab by file and namespace', () => {
    const mockFile = {
      name: 'AspectDefault.ttl',
      namespace: 'org.eclipse.examples:1.0.0',
      absoluteName: 'org.eclipse.examples:1.0.0:AspectDefault.ttl',
    } as unknown as NamespaceFile;

    service.onModelLoaded(mockFile);

    const found = service.findTab('org.eclipse.examples:1.0.0', 'AspectDefault.ttl');
    expect(found).toBeDefined();
    expect(found?.id).toBe('org.eclipse.examples:1.0.0:AspectDefault.ttl');
  });

  it('should close tab and switch to adjacent tab', () => {
    const mockFile1 = {
      name: 'Model1.ttl',
      namespace: 'org.eclipse.examples:1.0.0',
      absoluteName: 'org.eclipse.examples:1.0.0:Model1.ttl',
    } as unknown as NamespaceFile;

    const mockFile2 = {
      name: 'Model2.ttl',
      namespace: 'org.eclipse.examples:1.0.0',
      absoluteName: 'org.eclipse.examples:1.0.0:Model2.ttl',
    } as unknown as NamespaceFile;

    service.onModelLoaded(mockFile1);
    service.onModelLoaded(mockFile2);

    service.closeTab('org.eclipse.examples:1.0.0:Model2.ttl').subscribe();

    expect(service.tabs().length).toBe(1);
    expect(service.activeTabId()).toBe('org.eclipse.examples:1.0.0:Model1.ttl');
  });

  it('should call loadEmptyModel when the last tab is closed', () => {
    const mockFile1 = {
      name: 'Model1.ttl',
      namespace: 'org.eclipse.examples:1.0.0',
      absoluteName: 'org.eclipse.examples:1.0.0:Model1.ttl',
    } as unknown as NamespaceFile;

    const fileHandlingService = TestBed.inject(FileHandlingService);
    service.onModelLoaded(mockFile1);

    service.closeTab('org.eclipse.examples:1.0.0:Model1.ttl').subscribe();

    expect(service.tabs().length).toBe(0);
    expect(fileHandlingService.loadEmptyModel).toHaveBeenCalled();
  });

  it('should prompt save dialog when closing a dirty active tab and not close if cancelled', () => {
    const mockFile1 = {
      name: 'Model1.ttl',
      namespace: 'org.eclipse.examples:1.0.0',
      absoluteName: 'org.eclipse.examples:1.0.0:Model1.ttl',
    } as unknown as NamespaceFile;

    const saveModelDialog = TestBed.inject(SaveModelDialogService);
    const modelSavingTracker = TestBed.inject(ModelSavingTrackerService);
    (modelSavingTracker as any).isSaved$ = of(false);
    (saveModelDialog.openDialog as any).mockReturnValue(of(false));

    service.onModelLoaded(mockFile1);
    service.closeTab('org.eclipse.examples:1.0.0:Model1.ttl').subscribe();

    expect(saveModelDialog.openDialog).toHaveBeenCalled();
    // Tab should remain open because user cancelled
    expect(service.tabs().length).toBe(1);
  });

  it('should set dirty state on a tab', () => {
    const mockFile = {
      name: 'Model1.ttl',
      namespace: 'org.eclipse.examples:1.0.0',
      absoluteName: 'org.eclipse.examples:1.0.0:Model1.ttl',
    } as unknown as NamespaceFile;

    service.onModelLoaded(mockFile);
    expect(service.activeTab()?.isDirty).toBe(false);

    service.setTabDirty('org.eclipse.examples:1.0.0:Model1.ttl', true);
    expect(service.activeTab()?.isDirty).toBe(true);

    service.setTabDirty('org.eclipse.examples:1.0.0:Model1.ttl', false);
    expect(service.activeTab()?.isDirty).toBe(false);
  });

  it('should replace clean empty new-model tab when a model is loaded', () => {
    const emptyModel = {
      name: 'new-model.ttl',
      namespace: 'com.examples:1.0.0',
      absoluteName: 'com.examples:1.0.0:new-model.ttl',
      aspect: null,
    } as unknown as NamespaceFile;

    service.onModelLoaded(emptyModel);
    expect(service.tabs().length).toBe(1);
    expect(service.activeTab()?.file).toBe('new-model.ttl');
    expect(service.isActiveTabCleanEmpty()).toBe(true);

    const realModel = {
      name: 'Car.ttl',
      namespace: 'org.eclipse.examples:1.0.0',
      absoluteName: 'org.eclipse.examples:1.0.0:Car.ttl',
      aspect: {aspectModelUrn: 'urn:samm:org.eclipse.examples:1.0.0#Car'},
    } as unknown as NamespaceFile;

    service.onModelLoaded(realModel);

    expect(service.tabs().length).toBe(1);
    expect(service.activeTab()?.file).toBe('Car.ttl');
    expect(service.activeTabId()).toBe('org.eclipse.examples:1.0.0:Car.ttl');
  });

  it('should update tab naming when updateActiveTabNaming is called', () => {
    const emptyModel = {
      name: 'new-model.ttl',
      namespace: 'com.examples:1.0.0',
      absoluteName: 'com.examples:1.0.0:new-model.ttl',
      aspect: null,
    } as unknown as NamespaceFile;

    service.onModelLoaded(emptyModel);

    const renamed = {
      name: 'Truck.ttl',
      namespace: 'com.examples:1.0.0',
      absoluteName: 'com.examples:1.0.0:Truck.ttl',
      aspect: {aspectModelUrn: 'urn:samm:com.examples:1.0.0#Truck'},
    } as unknown as NamespaceFile;

    service.updateActiveTabNaming(renamed);

    expect(service.activeTab()?.file).toBe('Truck.ttl');
    expect(service.activeTabId()).toBe('com.examples:1.0.0:Truck.ttl');
  });

  it('should mark the active tab as workspace model after the first save', () => {
    const newModel = {
      name: 'new-model.ttl',
      namespace: 'org.eclipse.examples:1.0.0',
      absoluteName: 'org.eclipse.examples:1.0.0:new-model.ttl',
      aspect: null,
    } as unknown as NamespaceFile;
    service.onModelLoaded(newModel, false);

    const saved = {
      ...newModel,
      rdfModel: {
        store: {
          getSubjects: () => [
            {termType: 'BlankNode', value: 'n3-1'},
            {termType: 'NamedNode', value: 'urn:samm:org.eclipse.examples:1.0.0#property'},
          ],
        },
      },
    } as unknown as NamespaceFile;
    service.markActiveTabInWorkspace(saved);

    expect(service.activeTab()?.fromWorkspace).toBe(true);
    expect(service.activeTab()?.aspectModelUrn).toBe('urn:samm:org.eclipse.examples:1.0.0#property');
  });
});
