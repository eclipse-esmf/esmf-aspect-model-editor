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

import {MigratorApiService} from '@ame/api';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MatDialog} from '@angular/material/dialog';
import {TranslocoTestingModule} from '@jsverse/transloco';
import {of} from 'rxjs';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {SidebarStateService} from '../../sidebar-state.service';
import {MigrationDialogComponent} from './migration-dialog';
import {WorkspaceMigrateComponent} from './workspace-migrate.component';

describe('WorkspaceMigrateComponent', () => {
  let component: WorkspaceMigrateComponent;
  let fixture: ComponentFixture<WorkspaceMigrateComponent>;
  let migratorApiMock: {hasFilesToMigrate: ReturnType<typeof vi.fn>};
  let matDialogMock: {open: ReturnType<typeof vi.fn>};
  let sidebarService: SidebarStateService;

  beforeEach(() => {
    migratorApiMock = {
      hasFilesToMigrate: vi.fn(() => of(true)),
    };
    matDialogMock = {
      open: vi.fn(() => ({
        afterClosed: () => of(true),
      })),
    };

    TestBed.configureTestingModule({
      imports: [
        WorkspaceMigrateComponent,
        TranslocoTestingModule.forRoot({langs: {en: {}}, translocoConfig: {availableLangs: ['en'], defaultLang: 'en'}}),
      ],
      providers: [
        SidebarStateService,
        {provide: MigratorApiService, useValue: migratorApiMock},
        {provide: MatDialog, useValue: matDialogMock},
      ],
    });

    sidebarService = TestBed.inject(SidebarStateService);
    fixture = TestBed.createComponent(WorkspaceMigrateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should open migration dialog and refresh workspace when files to migrate exist and migration succeeds', () => {
    const refreshSpy = vi.spyOn(sidebarService.workspace, 'refresh');
    const clearSpy = vi.spyOn(sidebarService.namespacesState, 'clear');

    component.migrate();

    expect(migratorApiMock.hasFilesToMigrate).toHaveBeenCalled();
    expect(matDialogMock.open).toHaveBeenCalledWith(MigrationDialogComponent, {disableClose: true});
    expect(clearSpy).toHaveBeenCalled();
    expect(refreshSpy).toHaveBeenCalled();
  });

  it('should not clear or refresh workspace when migration dialog is cancelled', () => {
    matDialogMock.open.mockReturnValue({
      afterClosed: () => of(false),
    });
    const refreshSpy = vi.spyOn(sidebarService.workspace, 'refresh');
    const clearSpy = vi.spyOn(sidebarService.namespacesState, 'clear');

    component.migrate();

    expect(migratorApiMock.hasFilesToMigrate).toHaveBeenCalled();
    expect(clearSpy).not.toHaveBeenCalled();
    expect(refreshSpy).not.toHaveBeenCalled();
  });

  it('should not open migration dialog when no files need migration', () => {
    migratorApiMock.hasFilesToMigrate.mockReturnValue(of(false));

    component.migrate();

    expect(matDialogMock.open).not.toHaveBeenCalled();
  });
});
