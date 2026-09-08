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

import {NamespacesManagerService} from '@ame/namespace-manager';
import {ElectronSignalsService} from '@ame/shared';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {TranslocoTestingModule} from '@jsverse/transloco';
import {of} from 'rxjs';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {WorkspaceEmptyComponent} from './workspace-empty.component';

describe('WorkspaceEmptyComponent', () => {
  let component: WorkspaceEmptyComponent;
  let fixture: ComponentFixture<WorkspaceEmptyComponent>;
  let namespacesManagerMock: {importNamespaces: ReturnType<typeof vi.fn>};
  let electronSignalsMock: {call: ReturnType<typeof vi.fn>};

  beforeEach(() => {
    namespacesManagerMock = {
      importNamespaces: vi.fn(() => of(undefined)),
    };
    electronSignalsMock = {
      call: vi.fn(),
    };

    TestBed.configureTestingModule({
      imports: [
        WorkspaceEmptyComponent,
        NoopAnimationsModule,
        TranslocoTestingModule.forRoot({langs: {en: {}}, translocoConfig: {availableLangs: ['en'], defaultLang: 'en'}}),
      ],
      providers: [
        {provide: NamespacesManagerService, useValue: namespacesManagerMock},
        {provide: ElectronSignalsService, useValue: electronSignalsMock},
      ],
    });

    fixture = TestBed.createComponent(WorkspaceEmptyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should import namespace file on file input change', () => {
    const file = new File(['content'], 'models.zip', {type: 'application/zip'});
    const fileList = {
      0: file,
      length: 1,
      item: (index: number) => (index === 0 ? file : null),
    } as unknown as FileList;

    component.onFileInput(fileList);

    expect(namespacesManagerMock.importNamespaces).toHaveBeenCalledWith(file);
    expect(electronSignalsMock.call).toHaveBeenCalledWith('requestRefreshWorkspaces');
  });

  it('should ignore null file input', () => {
    component.onFileInput(null);
    expect(namespacesManagerMock.importNamespaces).not.toHaveBeenCalled();
    expect(electronSignalsMock.call).not.toHaveBeenCalled();
  });
});
