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

import {ModelApiService} from '@ame/api';
import {ModelCheckerService} from '@ame/editor';
import {NotificationsService} from '@ame/shared';
import {LanguageTranslationService} from '@ame/translation';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MatDialogRef} from '@angular/material/dialog';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {TranslocoTestingModule} from '@jsverse/transloco';
import {of, throwError} from 'rxjs';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {SelectNamespacesComponent} from './select-namespaces.component';

describe('SelectNamespacesComponent', () => {
  let component: SelectNamespacesComponent;
  let fixture: ComponentFixture<SelectNamespacesComponent>;
  let modelApiService: {fetchExportPackage: ReturnType<typeof vi.fn>};
  let modelCheckerService: {detectWorkspace: ReturnType<typeof vi.fn>};
  let notificationService: {info: ReturnType<typeof vi.fn>; error: ReturnType<typeof vi.fn>};
  let dialogRef: {close: ReturnType<typeof vi.fn>};
  let translate: {
    language: {
      notificationService: {
        namespaceExportFailure: string;
        internalExportError: string;
      };
    };
  };

  const mockNamespaces = {
    'urn:samm:org.eclipse.esmf:test:1.0.0#TestModel': {
      namespace: 'org.eclipse.esmf:test:1.0.0',
      model: 'TestModel',
      version: '1.0.0',
    },
    'urn:samm:org.eclipse.esmf:demo:2.0.0#DemoModel': {
      namespace: 'org.eclipse.esmf:demo:2.0.0',
      model: 'DemoModel',
      version: '2.0.0',
    },
  };

  beforeEach(() => {
    modelApiService = {
      fetchExportPackage: vi.fn(() => of(new Blob(['test-zip'], {type: 'application/zip'}))),
    };
    modelCheckerService = {
      detectWorkspace: vi.fn(() => of(mockNamespaces)),
    };
    notificationService = {
      info: vi.fn(),
      error: vi.fn(),
    };
    dialogRef = {
      close: vi.fn(),
    };
    translate = {
      language: {
        notificationService: {
          namespaceExportFailure: 'Export Failed',
          internalExportError: 'An internal export error occurred.',
        },
      },
    };

    TestBed.configureTestingModule({
      imports: [
        SelectNamespacesComponent,
        NoopAnimationsModule,
        TranslocoTestingModule.forRoot({
          langs: {en: {exportNamespaceDialog: {title: 'Export Namespaces', next: 'Next', cancel: 'Cancel', infoContent: 'Select...'}}},
          translocoConfig: {availableLangs: ['en'], defaultLang: 'en'},
        }),
      ],
      providers: [
        {provide: ModelApiService, useValue: modelApiService},
        {provide: ModelCheckerService, useValue: modelCheckerService},
        {provide: NotificationsService, useValue: notificationService},
        {provide: LanguageTranslationService, useValue: translate},
        {provide: MatDialogRef, useValue: dialogRef},
      ],
    });
  });

  function createComponent(): void {
    fixture = TestBed.createComponent(SelectNamespacesComponent);
    component = fixture.componentInstance;
  }

  it('should initialize and load detected workspace namespaces', () => {
    createComponent();
    fixture.detectChanges();

    expect(modelCheckerService.detectWorkspace).toHaveBeenCalledWith(true);
    expect(component.entries()).toEqual(mockNamespaces);
    expect(component.extracting()).toBe(false);
    expect(dialogRef.close).not.toHaveBeenCalled();
  });

  it('should notify and close dialog when no namespaces exist in workspace', () => {
    modelCheckerService.detectWorkspace.mockReturnValue(of({}));

    createComponent();
    fixture.detectChanges();

    expect(notificationService.info).toHaveBeenCalledWith({
      title: 'Nothing to export',
      message: 'There are no namespaces available to export in the current workspace.',
    });
    expect(dialogRef.close).toHaveBeenCalled();
    expect(component.extracting()).toBe(false);
  });

  it('should notify error and close dialog when workspace detection fails', () => {
    modelCheckerService.detectWorkspace.mockReturnValue(throwError(() => new Error('Detection failed')));

    createComponent();
    fixture.detectChanges();

    expect(notificationService.error).toHaveBeenCalledWith({
      title: 'Error detecting namespaces',
      message: 'There is a problem to detect the workspace namespaces: Detection failed',
    });
    expect(dialogRef.close).toHaveBeenCalled();
    expect(component.extracting()).toBe(false);
  });

  it('should handle workspace detection returning null or undefined gracefully', () => {
    modelCheckerService.detectWorkspace.mockReturnValue(of(undefined));

    createComponent();
    fixture.detectChanges();

    expect(component.entries()).toBeUndefined();
    expect(dialogRef.close).not.toHaveBeenCalled();
    expect(component.extracting()).toBe(false);
  });

  describe('export', () => {
    it('should do nothing if no key is selected', () => {
      createComponent();
      fixture.detectChanges();

      component.selectedKey.set('');
      component.export();

      expect(modelApiService.fetchExportPackage).not.toHaveBeenCalled();
    });

    it('should fetch package, trigger file download, and close dialog on export success', () => {
      createComponent();
      fixture.detectChanges();

      const blob = new Blob(['sample-data'], {type: 'application/zip'});
      modelApiService.fetchExportPackage.mockReturnValue(of(blob));

      const createObjectURLSpy = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock-url');
      const clickMock = vi.fn();
      const createElementSpy = vi.spyOn(document, 'createElement').mockReturnValue({
        set href(val: string) {},
        set download(val: string) {},
        click: clickMock,
      } as unknown as HTMLAnchorElement);

      component.selectedKey.set('urn:samm:org.eclipse.esmf:test:1.0.0#TestModel');
      component.export();

      expect(modelApiService.fetchExportPackage).toHaveBeenCalledWith('urn:samm:org.eclipse.esmf:test:1.0.0#TestModel');
      expect(createObjectURLSpy).toHaveBeenCalledWith(blob);
      expect(clickMock).toHaveBeenCalled();
      expect(dialogRef.close).toHaveBeenCalled();

      createObjectURLSpy.mockRestore();
      createElementSpy.mockRestore();
    });

    it('should show error notification when fetchExportPackage fails', () => {
      createComponent();
      fixture.detectChanges();

      modelApiService.fetchExportPackage.mockReturnValue(throwError(() => new Error('Network error')));

      component.selectedKey.set('urn:samm:org.eclipse.esmf:test:1.0.0#TestModel');
      component.export();

      expect(notificationService.error).toHaveBeenCalledWith({
        title: 'Export Failed',
        message: 'An internal export error occurred.',
      });
      expect(dialogRef.close).not.toHaveBeenCalled();
    });
  });
});
