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
import {FileHandlingService} from '../editor-toolbar/services/file-handling.service';
import {ModelSavingTrackerService} from '../model-saving-tracker.service';
import {SaveModelDialogService} from '../save-model-dialog/save-model-dialog.service';
import {TabStateService} from '../tabs/tab-state.service';
import {ModelOpenerService} from './model-opener.service';
import {OpenFileDialogComponent} from './open-file-dialog/open-file-dialog.component';

const ACTIVE_TAB_ID = 'org.eclipse.examples:1.0.0:Current.ttl';

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
          activeTabId: vi.fn(() => ACTIVE_TAB_ID) as any,
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
        ACTIVE_TAB_ID,
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
        ACTIVE_TAB_ID,
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

    it('replaces the model of the active tab when user chooses open-in for uploaded file', () => {
      vi.spyOn(dialog, 'open').mockReturnValue({afterClosed: () => of('open-in')} as any);
      vi.spyOn(fileHandling, 'loadModel').mockReturnValue(of(true));
      const result = vi.fn();

      service
        .promptForUpload({fileName: 'Uploaded.ttl', namespace: 'org.eclipse.examples:1.0.0', modelContent: 'content'})
        .subscribe(result);

      expect(fileHandling.loadModel).toHaveBeenCalledWith('content', ACTIVE_TAB_ID);
      expect(result).toHaveBeenCalledWith(true);
    });

    it('does not load the uploaded file when the user keeps editing the unsaved model', () => {
      Object.defineProperty(modelSavingTracker, 'isSaved$', {value: of(false)});
      vi.spyOn(saveModelDialog, 'openDialog').mockReturnValue(of(false));
      vi.spyOn(dialog, 'open').mockReturnValue({afterClosed: () => of('open-in')} as any);
      vi.spyOn(fileHandling, 'loadModel').mockReturnValue(of(true));
      const result = vi.fn();

      service
        .promptForUpload({fileName: 'Uploaded.ttl', namespace: 'org.eclipse.examples:1.0.0', modelContent: 'content'})
        .subscribe(result);

      expect(fileHandling.loadModel).not.toHaveBeenCalled();
      expect(result).toHaveBeenCalledWith(false);
    });
  });

  describe('openInCurrentWindow', () => {
    const options = {
      file: 'TestModel.ttl',
      namespace: 'org.eclipse.examples:1.0.0',
      aspectModelUrn: 'urn:samm:org.eclipse.examples:1.0.0#TestAspect',
    };

    it('loads the model into the active tab instead of opening a new tab', () => {
      const result = vi.fn();

      service.openInCurrentWindow(options).subscribe(result);

      expect(fileHandling.loadNamespaceFile).toHaveBeenCalledWith(
        'org.eclipse.examples:1.0.0:TestModel.ttl',
        'urn:samm:org.eclipse.examples:1.0.0#TestAspect',
        ACTIVE_TAB_ID,
      );
      expect(tabStateService.saveActiveTabSnapshot).not.toHaveBeenCalled();
      expect(result).toHaveBeenCalledWith(true);
    });

    it('shows the tab of a model that is already open instead of opening it twice', () => {
      vi.spyOn(tabStateService, 'findTab').mockReturnValue({
        id: 'org.eclipse.examples:1.0.0:TestModel.ttl',
        file: 'TestModel.ttl',
        namespace: 'org.eclipse.examples:1.0.0',
      });

      service.openInCurrentWindow(options).subscribe();

      expect(tabStateService.switchToTab).toHaveBeenCalledWith(
        'org.eclipse.examples:1.0.0:TestModel.ttl',
        'urn:samm:org.eclipse.examples:1.0.0#TestAspect',
      );
      expect(fileHandling.loadNamespaceFile).not.toHaveBeenCalled();
    });

    it('replaces the unsaved model after the changes were discarded or saved', () => {
      Object.defineProperty(modelSavingTracker, 'isSaved$', {value: of(false)});
      vi.spyOn(saveModelDialog, 'openDialog').mockReturnValue(of(true));

      service.openInCurrentWindow(options).subscribe();

      expect(saveModelDialog.openDialog).toHaveBeenCalled();
      expect(fileHandling.loadNamespaceFile).toHaveBeenCalledWith(
        'org.eclipse.examples:1.0.0:TestModel.ttl',
        'urn:samm:org.eclipse.examples:1.0.0#TestAspect',
        ACTIVE_TAB_ID,
      );
    });

    for (const [label, answer] of [
      ['continue editing', false],
      ['closing the dialog (Escape / x)', undefined],
    ] as const) {
      it(`keeps the unsaved model after ${label}`, () => {
        Object.defineProperty(modelSavingTracker, 'isSaved$', {value: of(false)});
        vi.spyOn(saveModelDialog, 'openDialog').mockReturnValue(of(answer));
        const result = vi.fn();

        service.openInCurrentWindow(options).subscribe(result);

        expect(fileHandling.loadNamespaceFile).not.toHaveBeenCalled();
        expect(result).toHaveBeenCalledWith(false);
      });
    }
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
