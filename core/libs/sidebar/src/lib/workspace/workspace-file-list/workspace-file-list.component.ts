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

import {ConfirmDialogEnum, ConfirmDialogPort, ModelOpenerPort, ModelSessionFacade, WorkspaceFacade, WorkspaceStore} from '@ame/domain';
import {ClipboardService, LanguageTranslationService, NotificationsService, TauriSignals, TauriSignalsService} from '@ame/shared';
import {KeyValuePipe} from '@angular/common';
import {Component, DestroyRef, effect, inject, signal} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {MatMiniFabButton} from '@angular/material/button';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatInput} from '@angular/material/input';
import {MatMenu, MatMenuItem, MatMenuTrigger} from '@angular/material/menu';
import {MatTooltip} from '@angular/material/tooltip';
import {TranslocoDirective} from '@jsverse/transloco';
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
  private readonly tauriSignalsService: TauriSignals = inject(TauriSignalsService);
  private readonly notificationService = inject(NotificationsService);
  private readonly confirmDialogService = inject(ConfirmDialogPort, {optional: true});
  private readonly modelApiService = inject(WorkspaceFacade);
  private readonly modelOpener = inject(ModelOpenerPort, {optional: true});
  private readonly translate = inject(LanguageTranslationService);
  private readonly loadedFiles = inject(ModelSessionFacade);
  private readonly destroyRef = inject(DestroyRef);
  private readonly clipboard = inject(ClipboardService);

  public readonly sidebarService = inject(SidebarStateService);
  public readonly workspaceStore = inject(WorkspaceStore);

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

    const {file} = selection;
    return !(file.outdated || file.errored);
  }

  public openContextMenu($event: MouseEvent, namespace: string, file: FileStatus, trigger: MatMenuTrigger) {
    $event.preventDefault();
    $event.stopPropagation();
    this.prepare(namespace, file);
    trigger.openMenu();
  }

  public loadInNewTab() {
    const selection = this.menuSelection();
    if (!selection || selection.file.outdated || selection.file.errored) return;

    this.modelOpener
      ?.openInNewTab({
        file: selection.file.name,
        namespace: selection.namespace,
        aspectModelUrn: selection.file.aspectModelUrn,
      })
      .subscribe();

    this.menuSelection.set(null);
  }

  public loadInNewWindow() {
    const selection = this.menuSelection();
    if (!selection || selection.file.outdated || selection.file.errored) return;

    this.modelOpener?.openInNewWindow({
      namespace: selection.namespace,
      file: selection.file.name,
      aspectModelUrn: selection.file.aspectModelUrn,
    });

    this.menuSelection.set(null);
  }

  public isLoadDisabled() {
    const selection = this.menuSelection();
    if (!selection) return true;

    const {namespace, file} = selection;
    return this.sidebarService.isCurrentFile(namespace, file.name) || !this.isOpenable();
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

  public promptOpenFile(namespace: string, file: FileStatus) {
    if (file.outdated || file.errored || this.isCurrentFile(namespace, file.name)) {
      return;
    }

    this.modelOpener
      ?.promptAndOpen({
        file: file.name,
        namespace,
        aspectModelUrn: file.aspectModelUrn,
      })
      .subscribe();
  }

  public openFile() {
    const selection = this.menuSelection();
    if (!selection || selection.file.outdated || selection.file.errored) return;

    this.modelOpener
      ?.openInCurrentWindow({
        file: selection.file.name,
        namespace: selection.namespace,
        aspectModelUrn: selection.file.aspectModelUrn,
      })
      .subscribe();

    this.menuSelection.set(null);
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
        if (confirm === ConfirmDialogEnum.ok) {
          this.sidebarService.namespacesState.removeFile(namespace, file.name);
          this.sidebarService.selection.reset();
          this.loadedFiles.removeFile(aspectModelFileName);
          this.modelApiService.deleteAspectModel(selection.file.aspectModelUrn).subscribe(() => {
            this.sidebarService.namespacesState.clear();
            this.sidebarService.workspace.refresh();
            this.tauriSignalsService.call('requestRefreshWorkspaces');
          });
        }
      });
  }

  public copyNamespace() {
    this.copyFilePath();
  }

  public copyFilePath() {
    const selection = this.menuSelection();
    if (!selection) return;

    this.modelApiService
      .getStoragePath()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: response => {
          const rootPath = response?.storagePath || response?.path || '';
          const osFilePath = this.buildOsFilePath(rootPath, selection.namespace, selection.file.name);
          this.copyToClipboard(osFilePath);
        },
        error: () => {
          const fallback = `${selection.namespace.replace(':', '/')}/${selection.file.name}`;
          this.copyToClipboard(fallback);
        },
      });
  }

  private buildOsFilePath(storagePath: string, namespaceKey: string, fileName: string): string {
    if (!storagePath) {
      return `${namespaceKey.replace(':', '/')}/${fileName}`;
    }

    const isWindows = storagePath.includes('\\');
    const sep = isWindows ? '\\' : '/';
    const cleanStoragePath = storagePath.replace(/[/\\]+$/, '');

    const [namespace, version] = namespaceKey.split(':');
    const segments = version ? [namespace, version, fileName] : [namespace, fileName];

    return `${cleanStoragePath}${sep}${segments.join(sep)}`;
  }

  private copyToClipboard(text: string) {
    this.clipboard.copy(text);

    const title = this.translate.translateService.translate('sidebar.fileMenu.copiedFilePath') || 'File path copied to clipboard';
    this.notificationService.success({title, message: text});
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
