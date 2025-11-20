/*
 * Copyright (c) 2024 Robert Bosch Manufacturing Solutions GmbH
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
import {MigrationStatus, MigratorApiService} from '@ame/api';
import {APP_CONFIG, AppConfig, NotificationsService} from '@ame/shared';
import {LanguageTranslationService} from '@ame/translation';
import {Component, inject, signal, viewChild} from '@angular/core';
import {MatButton} from '@angular/material/button';
import {MatCheckbox, MatCheckboxChange} from '@angular/material/checkbox';
import {MatDialogActions, MatDialogContent, MatDialogRef, MatDialogTitle} from '@angular/material/dialog';
import {MatDivider} from '@angular/material/divider';
import {MatIcon} from '@angular/material/icon';
import {MatProgressSpinner} from '@angular/material/progress-spinner';
import {MatStep, MatStepper} from '@angular/material/stepper';
import {TranslateModule} from '@ngx-translate/core';
import {finalize, switchMap, tap} from 'rxjs';

@Component({
  selector: 'ame-migration-dialog',
  templateUrl: './migration-dialog.component.html',
  styleUrls: ['./migration-dialog.component.scss'],
  standalone: true,
  imports: [
    MatDialogTitle,
    MatDialogContent,
    MatCheckbox,
    MatDialogActions,
    MatButton,
    MatProgressSpinner,
    TranslateModule,
    MatStepper,
    MatStep,
    MatDivider,
    MatIcon,
  ],
})
export class MigrationDialogComponent {
  private stepper = viewChild('stepper', {read: MatStepper});

  private dialogRef = inject(MatDialogRef<MigrationDialogComponent>);
  private migratorApiService = inject(MigratorApiService);
  private notificationsService = inject(NotificationsService);
  private translate = inject(LanguageTranslationService);

  public config = inject(APP_CONFIG) as AppConfig;

  public loading = signal(false);

  public migrationStatus = signal<MigrationStatus>(undefined);
  public increaseNamespaceVersion = true;

  changeVersionCheck(event: MatCheckboxChange) {
    this.increaseNamespaceVersion = event.checked;
  }

  migrate(): void {
    this.loading.set(true);
    this.migratorApiService
      .createBackup()
      .pipe(
        switchMap(() => this.migratorApiService.migrateWorkspace(this.increaseNamespaceVersion)),
        tap((migrationStatus: MigrationStatus) => this.migrationStatus.set(migrationStatus)),
        finalize(() => this.loading.set(false)),
      )
      .subscribe({
        next: () => this.stepper()?.next(),
        error: err =>
          this.notificationsService.error({
            title: this.translate.language.SAMM_MIGRATION?.MIGRATION_DIALOG?.MIGRATION_FAILED_TITLE,
            message: err,
          }),
      });
  }

  closeDialog() {
    this.dialogRef.close();
  }

  currentStep() {
    return this.stepper()?.selectedIndex ?? 0;
  }
}
