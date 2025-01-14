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
import {MigratorApiService, ModelApiService} from '@ame/api';
import {NotificationsService} from '@ame/shared';
import {Injectable} from '@angular/core';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {Router} from '@angular/router';
import {Observable, catchError, forkJoin, map, mergeMap, of, switchMap, tap} from 'rxjs';
import {MigratorComponent} from './components';

const prefixesToMigrate = {
  'meta-model': 'samm',
  characteristic: 'samm-c',
  entity: 'samm-e',
  unit: 'unit',
};

const newUrn = 'urn:samm:org.eclipse.esmf.samm';
// eslint-disable-next-line no-useless-escape
const oldUrnRegex = /@prefix\s+(\w+-?\w+:)\s+<urn:bamm:io.openmanufacturing:([\w-]+):([\d\.]+)#>/gim;

@Injectable({
  providedIn: 'root',
})
export class MigratorService {
  private _dialog: MatDialogRef<MigratorComponent>;
  public increaseNamespaceVersion = true;

  get dialogRef() {
    return this._dialog;
  }

  constructor(
    private dialog: MatDialog,
    private router: Router,
    private migratorApi: MigratorApiService,
    private modelApiService: ModelApiService,
    private notificationsService: NotificationsService,
  ) {}

  public startMigrating() {
    return this.migrateWorkspaceToSAMM().pipe(
      switchMap(dialog$ =>
        this.migratorApi.hasFilesToMigrate().pipe(
          switchMap(hasFiles => {
            if (hasFiles) {
              this.router.navigate([{outlets: {migrator: 'start-migration'}}]);
            } else {
              this.dialogRef.close();
              this.router.navigate([{outlets: {migrator: null}}]);
            }
            return dialog$;
          }),
        ),
      ),
    );
  }

  private migrateWorkspaceToSAMM() {
    this.router.navigate([{outlets: {migrator: 'samm-migration'}}]);
    const dialog$ = this.openDialog();

    return this.modelApiService.getAllNamespacesFilesContent().pipe(
      map(files => {
        return files.reduce((acc, file) => {
          const newSammFile = this.detectBammAndReplaceWithSamm(file.aspectMetaModel);
          if (file.aspectMetaModel !== newSammFile) {
            file.aspectMetaModel = newSammFile;
            return acc.concat([this.modelApiService.saveModel(newSammFile, file.aspectMetaModel, file.fileName)]);
          }
          return acc;
        }, []);
      }),
      mergeMap((requests: Observable<any>[]) => {
        if (requests.length) {
          this.notificationsService.info({
            title: 'Migrated models from BAMM to SAMM',
          });
          this.router.navigate([{outlets: {migrator: 'samm-migration'}}], {queryParams: {status: 'migrating'}});
          return forkJoin(requests).pipe(map(() => dialog$));
        }
        return of(dialog$);
      }),
      catchError(() => of(dialog$)),
    );
  }

  public detectBammAndReplaceWithSamm(fileContent: string) {
    const responses: RegExpExecArray[] = [];
    let regexResponse: RegExpExecArray;
    do {
      regexResponse = oldUrnRegex.exec(fileContent);
      regexResponse && responses.push(regexResponse);
    } while (regexResponse !== null);

    for (const [match, , type, version] of responses) {
      fileContent = fileContent.replace(match, `@prefix ${prefixesToMigrate[type]}: <${newUrn}:${type}:${version}#>`);
    }

    for (const [, prefix, type] of responses) {
      fileContent = fileContent.replace(new RegExp(prefix, 'g'), prefixesToMigrate[type] + ':');
    }

    return fileContent;
  }

  // This method is based on "detectBammAndReplaceWithSamm", in addition, it
  // shows the corresponding notification. Potentially can replace direct usage
  // of "detectBammAndReplaceWithSamm" method.
  bammToSamm(model: string): string {
    const migratedModel = this.detectBammAndReplaceWithSamm(model);
    if (migratedModel !== model) {
      this.notificationsService.info({
        title: 'Model migrated from BAMM to SAMM',
      });
    }

    return migratedModel;
  }

  private openDialog() {
    this._dialog = this.dialog.open(MigratorComponent, {disableClose: true});
    return this.dialogRef.afterClosed().pipe(
      tap(() => {
        this._dialog = null;
        this.router.navigate([{outlets: {migrator: null}}]);
      }),
    );
  }
}
