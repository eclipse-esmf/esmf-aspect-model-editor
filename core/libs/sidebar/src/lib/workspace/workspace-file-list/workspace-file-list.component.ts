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
import {LoadedFilesService} from '@ame/cache';
import {ConfirmDialogEnum, ConfirmDialogService, FileHandlingService, ModelSaverService} from '@ame/editor';
import {ElectronSignals, ElectronSignalsService, NotificationsService} from '@ame/shared';
import {LanguageTranslationService} from '@ame/translation';
import {KeyValuePipe} from '@angular/common';
import {Component, DestroyRef, effect, inject, signal} from '@angular/core';
import {MatMiniFabButton} from '@angular/material/button';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatInput} from '@angular/material/input';
import {MatMenu, MatMenuItem, MatMenuTrigger} from '@angular/material/menu';
import {MatTooltip} from '@angular/material/tooltip';
import {TranslocoDirective} from '@jsverse/transloco';
import {filter, finalize, switchMap} from 'rxjs';
import {FileStatus, SidebarStateService} from '../../sidebar-state.service';
import {WorkspaceMigrateComponent} from '../workspace-migrate/workspace-migrate.component';

@Component({
  selector: 'ame-workspace-file-list',
  templateUrl: './workspace-file-list.component.html',
  styleUrls: ['./workspace-file-list.component.scss'],
  imports: [
    MatFormFieldModule,
    MatIconModule,
    MatInput,
    MatTooltip,
    MatMiniFabButton,
    MatMenuTrigger,
    MatMenu,
    MatMenuItem,
    WorkspaceMigrateComponent,
    TranslocoDirective,
    KeyValuePipe,
  ],
})
export class WorkspaceFileListComponent {
  private electronSignalsService: ElectronSignals = inject(ElectronSignalsService);
  private modelSaverService = inject(ModelSaverService);
  private notificationService = inject(NotificationsService);
  private confirmDialogService = inject(ConfirmDialogService);
  private modelApiService = inject(ModelApiService);
  private fileHandlingService = inject(FileHandlingService);
  private translate = inject(LanguageTranslationService);
  private loadedFiles = inject(LoadedFilesService);
  private destroyRef = inject(DestroyRef);

  public sidebarService = inject(SidebarStateService);

  public readonly menuSelection = signal<{namespace: string; file: FileStatus} | null>(null);
  public readonly foldedStatus = signal(false);
  public readonly searched = signal<Record<string, FileStatus[]>>({});
  public readonly folded = signal<Record<string, boolean>>({});
  public readonly searchString = signal('');

  public get namespaces() {
    return this.sidebarService.namespacesState.namespaces();
  }

  public get selection() {
    return this.sidebarService.selection;
  }

  private searchThrottle: NodeJS.Timeout | null = null;

  constructor() {
    this.destroyRef.onDestroy(() => {
      if (this.searchThrottle) {
        clearTimeout(this.searchThrottle);
      }
    });

    effect(() => {
      const namespaces = this.sidebarService.namespacesState.namespaces();
      const currentFolded = this.foldedStatus();

      const newSearched: Record<string, FileStatus[]> = {};
      const newFolded: Record<string, boolean> = {};

      for (const namespace in namespaces) {
        newSearched[namespace] = namespaces[namespace];
        newFolded[namespace] = currentFolded;
      }

      this.searched.set(newSearched);
      this.folded.set(newFolded);
    });
  }

  public toggleFold() {
    const newFoldedStatus = !this.foldedStatus();
    this.foldedStatus.set(newFoldedStatus);

    const currentFolded = this.folded();
    const newFolded: Record<string, boolean> = {};

    for (const namespace in currentFolded) {
      newFolded[namespace] = newFoldedStatus;
    }

    this.folded.set(newFolded);
  }

  public search($event: KeyboardEvent) {
    const target = $event.target as HTMLInputElement;
    const newSearchString = target.value.toLowerCase();
    this.searchString.set(newSearchString);

    if (this.searchThrottle) {
      clearTimeout(this.searchThrottle);
    }

    this.searchThrottle = setTimeout(() => {
      const namespaces = this.namespaces;
      const newSearched: Record<string, FileStatus[]> = {};

      for (const namespace in namespaces) {
        if (namespace.toLowerCase().includes(newSearchString)) {
          newSearched[namespace] = namespaces[namespace];
          continue;
        }

        newSearched[namespace] = newSearchString
          ? namespaces[namespace].filter(file => file.name.toLowerCase().includes(newSearchString))
          : namespaces[namespace];
      }

      this.searched.set(newSearched);
    }, 100);
  }

  public selectFile(namespace: string, file: FileStatus) {
    if (file.outdated || file.errored) {
      return;
    }

    if (!this.sidebarService.isCurrentFileLoaded()) {
      this.notificationService.info({
        title: this.translate.language.notificationService.loadModelInfoTitle,
        message: this.translate.language.notificationService.loadModelInfoMessage,
      });
      return;
    }

    if (this.sidebarService.isCurrentFile(namespace, file.name)) {
      return;
    }

    this.sidebarService.selection.select(namespace, file);
  }

  public isOpenable() {
    const selection = this.menuSelection();
    if (!selection) return false;

    const {namespace, file} = selection;
    return !(this.sidebarService.isCurrentFile(namespace, file.name) || file.outdated || file.errored);
  }

  public loadInNewWindow() {
    const selection = this.menuSelection();
    if (!selection) return;

    const {namespace, file} = selection;

    if (file.outdated || file.errored) {
      return;
    }

    this.electronSignalsService.call('openWindow', {
      namespace,
      file: file.name,
      fromWorkspace: true,
      aspectModelUrn: file.aspectModelUrn,
    });

    this.menuSelection.set(null);
  }

  public isLoadDisabled() {
    return !this.isOpenable();
  }

  public isCurrentFile(namespace?: string, fileName?: string): boolean {
    return this.sidebarService.isCurrentFile(namespace, fileName);
  }

  public isDeleteDisabled() {
    const selection = this.menuSelection();
    if (!selection) return true;

    const {namespace, file} = selection;
    return this.sidebarService.isCurrentFile(namespace, file.name);
  }

  public openFile() {
    const selection = this.menuSelection();
    if (!selection) return;

    const {namespace, file} = selection;
    const absoluteFileName = `${namespace}:${file.name}`;

    if (file.outdated || file.errored) {
      return;
    }

    this.confirmDialogService
      .open({
        phrases: [
          this.translate.translateService.translate('confirmDialog.saveBeforeLoad.phrase1', {fileName: file.name}),
          this.translate.language.confirmDialog.saveBeforeLoad.phrase2,
        ],
        title: this.translate.language.confirmDialog.saveBeforeLoad.title,
        closeButtonText: this.translate.language.confirmDialog.saveBeforeLoad.cancelButton,
        okButtonText: this.translate.language.confirmDialog.saveBeforeLoad.okButton,
      })
      .pipe(
        filter((confirmed: ConfirmDialogEnum) => confirmed !== ConfirmDialogEnum.cancel),
        switchMap(() => this.modelSaverService.saveModel()),
        finalize(() => this.fileHandlingService.loadNamespaceFile(absoluteFileName, file.aspectModelUrn)),
      )
      .subscribe();
  }

  public deleteFile() {
    const selection = this.menuSelection();
    if (!selection) return;

    const {namespace, file} = selection;
    const aspectModelFileName = `${namespace}:${file.name}`;

    this.confirmDialogService
      .open({
        phrases: [
          this.translate.translateService.translate('confirmDialog.deleteFile.phrase1', {fileName: file.name}),
          this.translate.language.confirmDialog.deleteFile.phrase2,
        ],
        title: this.translate.language.confirmDialog.deleteFile.title,
      })
      .subscribe(confirm => {
        if (confirm !== ConfirmDialogEnum.cancel) {
          this.sidebarService.namespacesState.removeFile(namespace, file.name);
          this.sidebarService.selection.reset();
          this.loadedFiles.removeFile(aspectModelFileName);
          this.modelApiService.deleteAspectModel(selection.file.aspectModelUrn).subscribe(() => {
            this.sidebarService.namespacesState.clear();
            this.sidebarService.workspace.refresh();
            this.electronSignalsService.call('requestRefreshWorkspaces');
          });
        }
      });
  }

  public copyNamespace() {
    const selection = this.menuSelection();
    if (!selection) return;

    navigator.clipboard.writeText(`${selection.namespace}/${selection.file.name}`);
  }

  public prepare(namespace: string, file: FileStatus) {
    this.menuSelection.set({namespace, file});
  }

  public sortNamespaces(namespaces: {key: string; value: any}[]) {
    return namespaces.sort((n1, n2) => (n1.key >= n2.key ? 1 : -1));
  }

  public toggleNamespaceFold(namespaceKey: string) {
    const currentFolded = this.folded();
    this.folded.set({
      ...currentFolded,
      [namespaceKey]: !currentFolded[namespaceKey],
    });
  }

  public getFileTooltip(namespaceKey: string, file: FileStatus): string {
    if (this.isCurrentFile(namespaceKey, file.name)) {
      const tooltip = this.translate.language.tooltips?.currentFile || 'Currently opened file';
      return `${file.name} (${tooltip})`;
    }
    if (file.outdated) {
      const sammVersion = file.sammVersion || '';
      const tooltip = this.translate.translateService.translate('tooltips.outdatedFile', {sammVersion: sammVersion || 'older'});
      return `${file.name} (${tooltip})`;
    }
    if (file.errored) {
      const tooltip = this.translate.language.tooltips?.erroredFile || 'File has errors';
      return `${file.name} (${tooltip})`;
    }
    return file.name;
  }
}
