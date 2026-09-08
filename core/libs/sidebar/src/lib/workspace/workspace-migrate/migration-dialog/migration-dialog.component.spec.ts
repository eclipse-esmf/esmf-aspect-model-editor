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
import {APP_CONFIG, NotificationsService} from '@ame/shared';
import {LanguageTranslationService} from '@ame/translation';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MatButtonModule} from '@angular/material/button';
import {MatCheckboxChange, MatCheckboxModule} from '@angular/material/checkbox';
import {MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {TranslocoTestingModule} from '@jsverse/transloco';
import {of, throwError} from 'rxjs';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {MigrationDialogComponent} from './migration-dialog.component';

describe('MigrationDialogComponent', () => {
  let component: MigrationDialogComponent;
  let fixture: ComponentFixture<MigrationDialogComponent>;
  let migratorApiMock: {
    createBackup: ReturnType<typeof vi.fn>;
    migrateWorkspace: ReturnType<typeof vi.fn>;
  };
  let notificationsServiceMock: {
    error: ReturnType<typeof vi.fn>;
  };
  let dialogRefMock: {
    close: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    migratorApiMock = {
      createBackup: vi.fn(() => of(undefined)),
      migrateWorkspace: vi.fn(() => of({migratedFiles: ['Aspect.ttl']})),
    };
    notificationsServiceMock = {
      error: vi.fn(),
    };
    dialogRefMock = {
      close: vi.fn(),
    };

    TestBed.configureTestingModule({
      imports: [
        MigrationDialogComponent,
        MatDialogModule,
        MatCheckboxModule,
        MatButtonModule,
        MatProgressSpinnerModule,
        TranslocoTestingModule.forRoot({langs: {en: {}}, translocoConfig: {availableLangs: ['en'], defaultLang: 'en'}}),
        NoopAnimationsModule,
      ],
      providers: [
        {provide: MatDialogRef, useValue: dialogRefMock},
        {provide: NotificationsService, useValue: notificationsServiceMock},
        {provide: MigratorApiService, useValue: migratorApiMock},
        {
          provide: APP_CONFIG,
          useValue: {
            currentSammVersion: '2.1.0',
          },
        },
        {
          provide: LanguageTranslationService,
          useValue: {
            language: {
              sammMigration: {
                MIGRATION_DIALOG: {
                  MIGRATION_FAILED_TITLE: 'Migration Failed',
                },
              },
            },
          },
        },
      ],
    });

    fixture = TestBed.createComponent(MigrationDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
    expect(component.config.currentSammVersion).toBe('2.1.0');
    expect(component.increaseNamespaceVersion()).toBe(true);
    expect(component.loading()).toBe(false);
  });

  it('should toggle increaseNamespaceVersion on changeVersionCheck', () => {
    component.changeVersionCheck({checked: false} as MatCheckboxChange);
    expect(component.increaseNamespaceVersion()).toBe(false);

    component.changeVersionCheck({checked: true} as MatCheckboxChange);
    expect(component.increaseNamespaceVersion()).toBe(true);
  });

  it('should perform migration workflow successfully', () => {
    component.migrate();

    expect(migratorApiMock.createBackup).toHaveBeenCalledTimes(1);
    expect(migratorApiMock.migrateWorkspace).toHaveBeenCalledWith(true);
    expect(component.migrationStatus()).toEqual({migratedFiles: ['Aspect.ttl']});
    expect(component.loading()).toBe(false);
  });

  it('should handle migration failure and show error notification', () => {
    migratorApiMock.migrateWorkspace.mockReturnValue(throwError(() => 'Migration failed due to invalid syntax'));

    component.migrate();

    expect(notificationsServiceMock.error).toHaveBeenCalledWith({
      title: 'Migration Failed',
      message: 'Migration failed due to invalid syntax',
    });
    expect(component.loading()).toBe(false);
  });

  it('should close dialog when closeDialog is called', () => {
    component.closeDialog();
    expect(dialogRefMock.close).toHaveBeenCalledTimes(1);
  });

  it('should return current step index', () => {
    expect(component.currentStep()).toBe(0);
  });
});
