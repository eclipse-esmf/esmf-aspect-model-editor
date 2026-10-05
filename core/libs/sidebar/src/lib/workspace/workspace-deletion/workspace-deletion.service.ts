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

import {ConfirmDialogEnum, ConfirmDialogPort, ModelSessionFacade, ReferenceReport, TabsStore, WorkspaceFacade} from '@ame/domain';
import {
  LanguageTranslationService,
  NotificationsService,
  OtherWindowsModelsService,
  TauriSignalsService,
  viewportSafeWidth,
} from '@ame/shared';
import {HttpErrorResponse} from '@angular/common/http';
import {inject, Injectable, signal} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {catchError, finalize, map, Observable, of, switchMap} from 'rxjs';
import {FileStatus, SidebarStateService} from '../../sidebar-state.service';
import {ClearWorkspaceDialogComponent, ClearWorkspaceDialogData, ClearWorkspaceDialogResult} from './clear-workspace-dialog.component';
import {ReferencesDialogComponent, ReferencesDialogData} from './references-dialog.component';

/** Splits a workspace namespace key `org.example:1.0.0` into namespace and version. */
export function splitNamespaceKey(namespaceKey: string): {namespace: string; version: string} {
  const index = namespaceKey.lastIndexOf(':');
  return index < 0
    ? {namespace: namespaceKey, version: ''}
    : {namespace: namespaceKey.substring(0, index), version: namespaceKey.substring(index + 1)};
}

/** Why a file, a namespace version or the workspace cannot be deleted right now. */
export type DeletionBlockReason = 'busy' | 'empty' | 'openHere' | 'openElsewhere';

/**
 * Deletes files, namespace versions or the whole workspace.
 *
 * Files and namespaces are only deleted if no other workspace file uses their elements (incoming references).
 * The backend checks this again when deleting, so a 409 response is shown the same way as a blocked check.
 */
@Injectable({providedIn: 'root'})
export class WorkspaceDeletionService {
  private readonly workspaceApi = inject(WorkspaceFacade);
  private readonly confirmDialog = inject(ConfirmDialogPort);
  private readonly matDialog = inject(MatDialog);
  private readonly sidebarService = inject(SidebarStateService);
  private readonly loadedFiles = inject(ModelSessionFacade);
  private readonly tabsStore = inject(TabsStore);
  private readonly notifications = inject(NotificationsService);
  private readonly translate = inject(LanguageTranslationService);
  private readonly tauriSignals = inject(TauriSignalsService);
  private readonly otherWindows = inject(OtherWindowsModelsService);

  /** True while references are checked or something is deleted. */
  public readonly busy = signal(false);

  /** Whether a file of the namespace version is open in a tab of this window. */
  public isNamespaceOpen(namespaceKey: string): boolean {
    const files = this.sidebarService.namespacesState.namespaces()[namespaceKey] ?? [];
    return this.tabsStore.entities().some(tab => tab.namespace === namespaceKey && files.some(file => file.name === tab.file));
  }

  /** Whether the file is open in a tab of this window. */
  public isFileOpen(namespaceKey: string, fileName: string): boolean {
    return (
      this.sidebarService.isCurrentFile(namespaceKey, fileName) ||
      this.tabsStore.entities().some(tab => tab.namespace === namespaceKey && tab.file === fileName)
    );
  }

  /** Whether any workspace file is open in a tab of this window. */
  public hasOpenWorkspaceModels(): boolean {
    const namespaces = this.sidebarService.namespacesState.namespaces();
    return Object.keys(namespaces).some(namespaceKey => this.isNamespaceOpen(namespaceKey));
  }

  public workspaceFileCount(): number {
    return Object.values(this.sidebarService.namespacesState.namespaces()).reduce((count, files) => count + files.length, 0);
  }

  /** Why the file cannot be deleted right now, or null if it can. */
  public fileBlockReason(namespaceKey: string, fileName: string): DeletionBlockReason | null {
    if (this.busy()) return 'busy';
    if (this.isFileOpen(namespaceKey, fileName)) return 'openHere';
    if (this.otherWindows.isFileOpen(namespaceKey, fileName)) return 'openElsewhere';
    return null;
  }

  /** Why the namespace version cannot be deleted right now, or null if it can. */
  public namespaceBlockReason(namespaceKey: string): DeletionBlockReason | null {
    if (this.busy()) return 'busy';
    if (this.isNamespaceOpen(namespaceKey)) return 'openHere';
    if (this.otherWindows.isNamespaceOpen(namespaceKey)) return 'openElsewhere';
    return null;
  }

  /** Why the workspace cannot be cleared right now, or null if it can. */
  public clearBlockReason(): DeletionBlockReason | null {
    if (this.busy()) return 'busy';
    if (this.workspaceFileCount() === 0) return 'empty';
    if (this.hasOpenWorkspaceModels()) return 'openHere';
    if (this.otherWindows.hasOpenModels()) return 'openElsewhere';
    return null;
  }

  /** Tooltip explaining a block reason, empty if nothing blocks. */
  public blockReasonText(kind: 'file' | 'namespace' | 'clear', reason: DeletionBlockReason | null): string {
    if (!reason) return '';
    const key = reason === 'busy' ? 'busy' : `${kind}${reason.charAt(0).toUpperCase()}${reason.slice(1)}`;
    return this.translate.translateService.translate(`sidebar.deletion.reason.${key}`);
  }

  /** Checks the references of a file, asks for confirmation and deletes it. Emits whether it was deleted. */
  public deleteFile(namespaceKey: string, file: FileStatus): Observable<boolean> {
    const {namespace, version} = splitNamespaceKey(namespaceKey);
    return this.check(this.workspaceApi.getReferences(namespace, version, file.name), 'file', file.name).pipe(
      switchMap(deletable =>
        !deletable
          ? of(ConfirmDialogEnum.cancel)
          : this.confirmDialog.open({
              phrases: [
                this.translate.translateService.translate('confirmDialog.deleteFile.phrase1', {fileName: file.name}),
                this.translate.language.confirmDialog.deleteFile.phrase2,
              ],
              title: this.translate.language.confirmDialog.deleteFile.title,
            }),
      ),
      switchMap(confirm =>
        confirm !== ConfirmDialogEnum.ok
          ? of(false)
          : this.run(this.workspaceApi.deleteAspectModel(file.aspectModelUrn), 'file', file.name).pipe(
              map(deleted => {
                if (deleted) {
                  this.loadedFiles.removeFile(`${namespaceKey}:${file.name}`);
                  if (this.sidebarService.selection.isSelected(namespaceKey, file.name)) {
                    this.sidebarService.selection.reset();
                  }
                  this.refreshWorkspace();
                }
                return deleted;
              }),
            ),
      ),
    );
  }

  /** Checks the references of a namespace version, asks for confirmation and deletes it. Emits whether it was deleted. */
  public deleteNamespace(namespaceKey: string): Observable<boolean> {
    const {namespace, version} = splitNamespaceKey(namespaceKey);
    const files = this.sidebarService.namespacesState.namespaces()[namespaceKey] ?? [];
    const t = (key: string, params?: Record<string, unknown>) => this.translate.translateService.translate(key, params);

    return this.check(this.workspaceApi.getReferences(namespace, version), 'namespace', namespaceKey).pipe(
      switchMap(deletable =>
        !deletable
          ? of(ConfirmDialogEnum.cancel)
          : this.confirmDialog.open({
              phrases: [
                t('sidebar.deletion.namespace.phrase1', {name: namespaceKey}),
                t('sidebar.deletion.namespace.phrase2', {count: files.length}),
                t('sidebar.deletion.namespace.phrase3'),
              ],
              title: t('sidebar.deletion.namespace.title'),
              okButtonText: t('sidebar.deletion.namespace.ok'),
              closeButtonText: t('sidebar.deletion.clear.cancel'),
            }),
      ),
      switchMap(confirm =>
        confirm !== ConfirmDialogEnum.ok
          ? of(false)
          : this.run(this.workspaceApi.deleteNamespace(namespace, version), 'namespace', namespaceKey).pipe(
              map(deleted => {
                if (deleted) {
                  files.forEach(file => this.loadedFiles.removeFile(`${namespaceKey}:${file.name}`));
                  if (this.sidebarService.selection.namespace === namespaceKey) {
                    this.sidebarService.selection.reset();
                  }
                  this.notifications.success({title: t('sidebar.deletion.namespace.success', {name: namespaceKey})});
                  this.refreshWorkspace();
                }
                return deleted;
              }),
            ),
      ),
    );
  }

  /** Asks for a typed confirmation and deletes all Aspect Models of the workspace. Emits whether it was cleared. */
  public clearWorkspace(): Observable<boolean> {
    const t = (key: string, params?: Record<string, unknown>) => this.translate.translateService.translate(key, params);

    return this.matDialog
      .open<ClearWorkspaceDialogComponent, ClearWorkspaceDialogData, ClearWorkspaceDialogResult>(ClearWorkspaceDialogComponent, {
        data: {fileCount: this.workspaceFileCount()},
        width: viewportSafeWidth(560),
      })
      .afterClosed()
      .pipe(
        switchMap(result => {
          if (!result) return of(false);
          this.busy.set(true);
          return this.workspaceApi.clearWorkspace(result.backup).pipe(
            map(cleared => {
              const files = this.sidebarService.namespacesState.namespaces();
              Object.entries(files).forEach(([namespaceKey, namespaceFiles]) =>
                namespaceFiles.forEach(file => this.loadedFiles.removeFile(`${namespaceKey}:${file.name}`)),
              );
              this.sidebarService.selection.reset();
              this.notifications.success({
                title: t('sidebar.deletion.clear.success'),
                message: cleared.backupCreated
                  ? t('sidebar.deletion.clear.successBackup', {count: cleared.deletedFiles})
                  : t('sidebar.deletion.clear.successMessage', {count: cleared.deletedFiles}),
              });
              this.refreshWorkspace();
              return true;
            }),
            catchError(error => {
              this.notifyFailure(error);
              return of(false);
            }),
            finalize(() => this.busy.set(false)),
          );
        }),
      );
  }

  /** Emits whether it may be deleted; shows why not otherwise. Never emits true if the check failed. */
  private check(check$: Observable<ReferenceReport>, kind: ReferencesDialogData['kind'], name: string): Observable<boolean> {
    this.busy.set(true);
    return check$.pipe(
      switchMap(report => (report.deletable ? of(true) : this.showReferences(kind, name, report))),
      catchError(error => {
        this.notifications.error({
          title: this.translate.translateService.translate('sidebar.deletion.failed'),
          message: this.translate.translateService.translate('sidebar.deletion.checkFailed') + this.errorDetails(error),
        });
        return of(false);
      }),
      finalize(() => this.busy.set(false)),
    );
  }

  /** Runs the delete request. A 409 with a reference report (references changed meanwhile) is shown like a blocked check. */
  private run(delete$: Observable<unknown>, kind: ReferencesDialogData['kind'], name: string): Observable<boolean> {
    this.busy.set(true);
    return delete$.pipe(
      map(() => true),
      catchError(error => {
        const report = this.referenceReportOf(error);
        if (report) {
          return this.showReferences(kind, name, report);
        }
        this.notifyFailure(error);
        return of(false);
      }),
      finalize(() => this.busy.set(false)),
    );
  }

  private showReferences(kind: ReferencesDialogData['kind'], name: string, report: ReferenceReport): Observable<false> {
    return this.matDialog
      .open<ReferencesDialogComponent, ReferencesDialogData>(ReferencesDialogComponent, {
        data: {kind, name, report},
        width: viewportSafeWidth(640),
      })
      .afterClosed()
      .pipe(map(() => false as const));
  }

  private referenceReportOf(error: unknown): ReferenceReport | null {
    const body = (error as HttpErrorResponse)?.error;
    return (error as HttpErrorResponse)?.status === 409 && Array.isArray(body?.references) ? (body as ReferenceReport) : null;
  }

  private notifyFailure(error: unknown): void {
    this.notifications.error({
      title: this.translate.translateService.translate('sidebar.deletion.failed'),
      message: this.errorDetails(error).trim(),
    });
  }

  private errorDetails(error: unknown): string {
    const message = (error as HttpErrorResponse)?.error?.error?.message ?? (error as Error)?.message;
    return message ? ` ${message}` : '';
  }

  private refreshWorkspace(): void {
    this.sidebarService.namespacesState.clear();
    this.sidebarService.workspace.refresh();
    this.tauriSignals.call('requestRefreshWorkspaces');
  }
}
