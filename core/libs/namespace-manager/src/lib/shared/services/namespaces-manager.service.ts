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

import {ModelApiService} from '@ame/api';
import {EditorService, FileInfo, FileTypes, FileUploadService} from '@ame/editor';
import {Injectable, InjectionToken} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {Router} from '@angular/router';
import {catchError, first, Observable, of, switchMap, tap} from 'rxjs';
import {RootExportNamespacesComponent} from '../../namespace-exporter/components';
import {RootNamespacesImporterComponent} from '../../namespace-importer/components';
import {NamespacesSession} from '../models';
import {createFile} from '@ame/utils';
import {SidebarStateService} from '@ame/sidebar';
import {environment} from '../../../../../../environments/environment';

const NAMESPACES_SESSION_NAME = 'NAMESPACES_SESSION';
export let NAMESPACES_SESSION: InjectionToken<NamespacesSession>;

@Injectable({providedIn: 'root'})
export class NamespacesManagerService {
  public session = new NamespacesSession();

  constructor(
    private modelApiService: ModelApiService,
    private matDialog: MatDialog,
    private router: Router,
    private editorService: EditorService,
    private fileUploadService: FileUploadService,
    private sidebarService: SidebarStateService,
  ) {
    if (!environment.production) {
      window['angular.namespacesManagerService'] = this;
    }
  }

  onImportNamespaces(fileInfo?: FileInfo) {
    this.resolveNamespacesFile(fileInfo)
      .pipe(
        switchMap(file => this.importNamespaces(file)),
        first(),
      )
      .subscribe();
  }

  resolveNamespacesFile(fileInfo?: FileInfo): Observable<File> {
    return fileInfo ? of(createFile(fileInfo.content, fileInfo.name, FileTypes.ZIP)) : this.fileUploadService.selectFile([FileTypes.ZIP]);
  }

  importNamespaces(zip: File) {
    this.setInjectionTokens();
    this.session.state.validating$.next(true);
    this.session.modalRef = this.matDialog.open(RootNamespacesImporterComponent, {disableClose: true});

    return this.session.modalRef.afterOpened().pipe(
      tap(() =>
        this.setOnClose(() => {
          this.editorService.loadExternalModels().subscribe(() => this.sidebarService.workspace.refresh());
          this.router.navigate([{outlets: {'import-namespaces': null}}]);
        }),
      ),
      switchMap(() => this.modelApiService.uploadZip(zip)),
      tap(result => {
        this.session.parseResponse(result);
        this.session.state.validating$.next(false);
      }),
      catchError(e => of(this.session.state.validating$.error(e))),
    );
  }

  onExportNamespaces() {
    this.exportNamespaces().pipe(first()).subscribe();
  }

  exportNamespaces(): Observable<void> {
    this.setInjectionTokens();
    this.session.modalRef = this.matDialog.open(RootExportNamespacesComponent, {disableClose: true});
    return this.session.modalRef.afterOpened().pipe(
      tap(() => {
        const cb = () => this.router.navigate([{outlets: {'export-namespaces': null}}]);
        this.setOnClose(cb);
      }),
    );
  }

  validateExport(files: {namespace: string; files: string[]}[]) {
    this.session.state.validating$.next(true);
    return this.modelApiService.validateFilesForExport(files).pipe(
      tap(result => {
        this.session.parseResponse(result);
        this.session.state.validating$.next(false);
      }),
      catchError(err => of(this.session.state.validating$.error(err))),
    );
  }

  private setInjectionTokens() {
    NAMESPACES_SESSION = new InjectionToken<NamespacesSession>(NAMESPACES_SESSION_NAME, {
      providedIn: 'root',
      factory: () => this.session,
    });
  }

  private setOnClose(callback?: () => any) {
    this.session.modalRef
      .afterClosed()
      .pipe(first())
      .subscribe(() => {
        this.session = new NamespacesSession();
        this.setInjectionTokens();
        callback?.();
      });
  }
}
