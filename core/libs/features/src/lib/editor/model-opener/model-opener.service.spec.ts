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

import {TauriSignalsService} from '@ame/shared';
import {TestBed} from '@angular/core/testing';
import {MatDialog} from '@angular/material/dialog';
import {MockProvider} from 'ng-mocks';
import {of} from 'rxjs';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {OpenFileDialogComponent} from '../../search/open-file-dialog/open-file-dialog.component';
import {FileHandlingService} from '../editor-toolbar/services/file-handling.service';
import {ModelSavingTrackerService} from '../model-saving-tracker.service';
import {SaveModelDialogService} from '../save-model-dialog/save-model-dialog.service';
import {TabStateService} from '../tabs/tab-state.service';
import {ModelOpenerService} from './model-opener.service';

describe('ModelOpenerService', () => {
  let service: ModelOpenerService;
  let dialog: MatDialog;
  let tauriSignals: TauriSignalsService;
  let fileHandling: FileHandlingService;
  let modelSavingTracker: ModelSavingTrackerService;
  let saveModelDialog: SaveModelDialogService;
  let tabStateService: TabStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ModelOpenerService,
        {
          provide: MatDialog,
          useValue: {
            open: vi.fn(() => ({
              afterClosed: () => of('open-out'),
            })),
          },
        },
        MockProvider(TauriSignalsService, {
          call: vi.fn(),
        }),
        MockProvider(FileHandlingService, {
          loadNamespaceFile: vi.fn(),
        }),
        MockProvider(ModelSavingTrackerService, {
          isSaved$: of(true),
        }),
        MockProvider(SaveModelDialogService, {
          openDialog: vi.fn(() => of(true)),
        }),
        MockProvider(TabStateService, {
          findTab: vi.fn(),
          switchToTab: vi.fn(() => of(true)),
          saveActiveTabSnapshot: vi.fn(),
          isActiveTabCleanEmpty: vi.fn(() => false),
        }),
      ],
    });

    service = TestBed.inject(ModelOpenerService);
    dialog = TestBed.inject(MatDialog);
    tauriSignals = TestBed.inject(TauriSignalsService);
    fileHandling = TestBed.inject(FileHandlingService);
    modelSavingTracker = TestBed.inject(ModelSavingTrackerService);
    saveModelDialog = TestBed.inject(SaveModelDialogService);
    tabStateService = TestBed.inject(TabStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('promptAndOpen', () => {
    it('should switch directly to tab if file is already open in a tab', () => {
      vi.spyOn(tabStateService, 'findTab').mockReturnValue({
        id: 'org.eclipse.examples:1.0.0:TestModel.ttl',
        file: 'TestModel.ttl',
        namespace: 'org.eclipse.examples:1.0.0',
      });

      service
        .promptAndOpen({
          file: 'TestModel.ttl',
          namespace: 'org.eclipse.examples:1.0.0',
          aspectModelUrn: 'urn:samm:org.eclipse.examples:1.0.0#TestAspect',
        })
        .subscribe();

      expect(tabStateService.switchToTab).toHaveBeenCalledWith(
        'org.eclipse.examples:1.0.0:TestModel.ttl',
        'urn:samm:org.eclipse.examples:1.0.0#TestAspect',
      );
      expect(dialog.open).not.toHaveBeenCalled();
    });

    it('should open dialog and load in current window when user chooses open-in', () => {
      vi.spyOn(tabStateService, 'findTab').mockReturnValue(undefined);
      vi.spyOn(dialog, 'open').mockReturnValue({
        afterClosed: () => of('open-in'),
      } as any);

      service
        .promptAndOpen({
          file: 'TestModel.ttl',
          namespace: 'org.eclipse.examples:1.0.0',
          aspectModelUrn: 'urn:samm:org.eclipse.examples:1.0.0#TestAspect',
        })
        .subscribe();

      expect(dialog.open).toHaveBeenCalledWith(OpenFileDialogComponent, {
        data: {file: 'TestModel.ttl', namespace: 'org.eclipse.examples:1.0.0'},
      });
      expect(fileHandling.loadNamespaceFile).toHaveBeenCalledWith(
        'org.eclipse.examples:1.0.0:TestModel.ttl',
        'urn:samm:org.eclipse.examples:1.0.0#TestAspect',
      );
    });

    it('should open in new tab when user chooses open-tab', () => {
      vi.spyOn(tabStateService, 'findTab').mockReturnValue(undefined);
      vi.spyOn(dialog, 'open').mockReturnValue({
        afterClosed: () => of('open-tab'),
      } as any);

      service
        .promptAndOpen({
          file: 'TestModel.ttl',
          namespace: 'org.eclipse.examples:1.0.0',
          aspectModelUrn: 'urn:samm:org.eclipse.examples:1.0.0#TestAspect',
        })
        .subscribe();

      expect(tabStateService.saveActiveTabSnapshot).toHaveBeenCalled();
      expect(fileHandling.loadNamespaceFile).toHaveBeenCalledWith(
        'org.eclipse.examples:1.0.0:TestModel.ttl',
        'urn:samm:org.eclipse.examples:1.0.0#TestAspect',
      );
    });

    it('should open dialog and open in new window when user chooses open-out', () => {
      vi.spyOn(tabStateService, 'findTab').mockReturnValue(undefined);
      vi.spyOn(dialog, 'open').mockReturnValue({
        afterClosed: () => of('open-out'),
      } as any);

      service
        .promptAndOpen({
          file: 'TestModel.ttl',
          namespace: 'org.eclipse.examples:1.0.0',
          aspectModelUrn: 'urn:samm:org.eclipse.examples:1.0.0#TestAspect',
        })
        .subscribe();

      expect(tauriSignals.call).toHaveBeenCalledWith('openWindow', {
        namespace: 'org.eclipse.examples:1.0.0',
        file: 'TestModel.ttl',
        fromWorkspace: true,
        aspectModelUrn: 'urn:samm:org.eclipse.examples:1.0.0#TestAspect',
        editElement: undefined,
      });
    });

    it('should do nothing when user cancels dialog', () => {
      vi.spyOn(dialog, 'open').mockReturnValue({
        afterClosed: () => of(null),
      } as any);

      service
        .promptAndOpen({
          file: 'TestModel.ttl',
          namespace: 'org.eclipse.examples:1.0.0',
        })
        .subscribe();

      expect(fileHandling.loadNamespaceFile).not.toHaveBeenCalled();
      expect(tauriSignals.call).not.toHaveBeenCalled();
    });

    it('should directly open in current window without dialog if active tab is clean empty', () => {
      vi.spyOn(tabStateService, 'findTab').mockReturnValue(undefined);
      vi.spyOn(tabStateService, 'isActiveTabCleanEmpty').mockReturnValue(true);

      service
        .promptAndOpen({
          file: 'TestModel.ttl',
          namespace: 'org.eclipse.examples:1.0.0',
          aspectModelUrn: 'urn:samm:org.eclipse.examples:1.0.0#TestAspect',
        })
        .subscribe();

      expect(dialog.open).not.toHaveBeenCalled();
      expect(fileHandling.loadNamespaceFile).toHaveBeenCalledWith(
        'org.eclipse.examples:1.0.0:TestModel.ttl',
        'urn:samm:org.eclipse.examples:1.0.0#TestAspect',
      );
    });
  });

  describe('promptForUpload', () => {
    it('should open in new tab when user chooses open-tab for uploaded file', () => {
      vi.spyOn(dialog, 'open').mockReturnValue({
        afterClosed: () => of('open-tab'),
      } as any);
      vi.spyOn(fileHandling, 'loadModel').mockReturnValue(of(true));

      service
        .promptForUpload({
          fileName: 'Uploaded.ttl',
          namespace: 'org.eclipse.examples:1.0.0',
          modelContent: 'sample content',
        })
        .subscribe();

      expect(dialog.open).toHaveBeenCalledWith(OpenFileDialogComponent, {
        data: {file: 'Uploaded.ttl', namespace: 'org.eclipse.examples:1.0.0'},
      });
      expect(tabStateService.saveActiveTabSnapshot).toHaveBeenCalled();
      expect(fileHandling.loadModel).toHaveBeenCalledWith('sample content');
    });
  });

  describe('openInNewWindow', () => {
    it('should dispatch openWindow tauri signal', () => {
      service.openInNewWindow({
        file: 'TestModel.ttl',
        namespace: 'org.eclipse.examples:1.0.0',
        aspectModelUrn: 'urn:samm:org.eclipse.examples:1.0.0#TestAspect',
        editElementUrn: 'urn:samm:org.eclipse.examples:1.0.0#TestAspect',
      });

      expect(tauriSignals.call).toHaveBeenCalledWith('openWindow', {
        namespace: 'org.eclipse.examples:1.0.0',
        file: 'TestModel.ttl',
        fromWorkspace: true,
        aspectModelUrn: 'urn:samm:org.eclipse.examples:1.0.0#TestAspect',
        editElement: 'urn:samm:org.eclipse.examples:1.0.0#TestAspect',
      });
    });
  });

  describe('checkUnsavedChanges', () => {
    it('should prompt save dialog when model is not saved', () => {
      Object.defineProperty(modelSavingTracker, 'isSaved$', {value: of(false)});

      service.checkUnsavedChanges().subscribe();

      expect(saveModelDialog.openDialog).toHaveBeenCalled();
    });
  });
});
