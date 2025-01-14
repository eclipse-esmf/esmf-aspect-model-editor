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
import {LoadedFilesService} from '@ame/cache';
import {ConfirmDialogService, FileHandlingService, ModelCheckerService, ModelSaverService} from '@ame/editor';
import {ElectronSignals, ElectronSignalsService, NotificationsService} from '@ame/shared';
import {FileStatus, SidebarStateService} from '@ame/sidebar';
import {LanguageTranslationService} from '@ame/translation';
import {ChangeDetectorRef, Component, NgZone, OnDestroy, OnInit, inject} from '@angular/core';
import {Subscription, catchError, map, switchMap, throwError} from 'rxjs';
import {ConfirmDialogEnum} from '../../../../../editor/src/lib/models/confirm-dialog.enum';

@Component({
  selector: 'ame-workspace-file-list',
  templateUrl: './workspace-file-list.component.html',
  styleUrls: ['./workspace-file-list.component.scss'],
})
export class WorkspaceFileListComponent implements OnInit, OnDestroy {
  private electronSignalsService: ElectronSignals = inject(ElectronSignalsService);
  private modelSaverService = inject(ModelSaverService);
  public sidebarService = inject(SidebarStateService);

  public menuSelection: {namespace: string; file: FileStatus} = null;
  public foldedStatus = false;
  public searched: Record<string, FileStatus[]> = {};
  public folded: Record<string, boolean> = {};
  public searchString = '';

  public get namespaces() {
    return this.sidebarService.namespacesState.namespaces;
  }

  public get selection() {
    return this.sidebarService.selection;
  }

  private searchThrottle: NodeJS.Timeout;
  private subscription = new Subscription();

  constructor(
    private notificationService: NotificationsService,
    private confirmDialogService: ConfirmDialogService,
    private modelApiService: ModelApiService,
    private fileHandlingService: FileHandlingService,
    private changeDetector: ChangeDetectorRef,
    private translate: LanguageTranslationService,
    private loadedFiles: LoadedFilesService,
    private modelChecker: ModelCheckerService,
    private ngZone: NgZone,
  ) {}

  ngOnInit(): void {
    const sub = this.sidebarService.workspace.refreshSignal$
      .pipe(
        switchMap(() => this.modelChecker.detectWorkspaceErrors()),
        map(files => this.sidebarService.updateWorkspace(files)),
        catchError(error => {
          console.log(error);
          return throwError(() => error);
        }),
      )
      .subscribe(() => {
        for (const namespace in this.namespaces) {
          this.searched[namespace] = this.namespaces[namespace];
          this.folded[namespace] = this.foldedStatus;
        }
      });

    this.subscription.add(sub);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  public toggleFold() {
    this.foldedStatus = !this.foldedStatus;
    for (const namespace in this.folded) {
      this.folded[namespace] = this.foldedStatus;
    }
  }

  public search($event: KeyboardEvent) {
    const target = $event.target as HTMLInputElement;
    this.searchString = target.value.toLowerCase();

    if (this.searchThrottle) {
      clearInterval(this.searchThrottle);
    }

    this.searchThrottle = setTimeout(() => {
      for (const namespace in this.namespaces) {
        if (namespace.toLowerCase().includes(this.searchString)) {
          this.searched[namespace] = this.namespaces[namespace];
          continue;
        }

        this.searched[namespace] = this.searchString
          ? this.namespaces[namespace].filter(file => file.name.toLowerCase().includes(this.searchString))
          : this.namespaces[namespace];
      }
    }, 100);
  }

  public selectFile(namespace: string, file: FileStatus) {
    if (file.outdated || file.errored) {
      return;
    }

    if (!this.sidebarService.isCurrentFileLoaded()) {
      this.notificationService.info({
        title: this.translate.language.NOTIFICATION_SERVICE.LOAD_MODEL_INFO_TITLE,
        message: this.translate.language.NOTIFICATION_SERVICE.LOAD_MODEL_INFO_MESSAGE,
      });
      return;
    }

    if (this.sidebarService.isCurrentFile(namespace, file.name)) {
      return;
    }

    this.sidebarService.selection.select(namespace, file);
    this.changeDetector.detectChanges();
  }

  public isOpenable() {
    const {namespace, file} = this.menuSelection;
    return !(this.sidebarService.isCurrentFile(namespace, file.name) || file.outdated || file.errored);
  }

  public loadInNewWindow() {
    const {namespace, file} = this.menuSelection;
    if (file.outdated || file.errored || file.locked) {
      return;
    }

    this.electronSignalsService.call('openWindow', {
      namespace,
      file: file.name,
      fromWorkspace: true,
      aspectModelUrn: file.aspectModelUrn,
    });

    this.menuSelection = null;
  }

  public isLoadDisabled() {
    return this.menuSelection.file.locked || !this.isOpenable();
  }

  public isDeleteDisabled() {
    const {namespace, file} = this.menuSelection;
    return file.locked || this.sidebarService.isCurrentFile(namespace, file.name);
  }

  public openFile() {
    const {namespace, file} = this.menuSelection;
    const absoluteFileName = `${namespace}:${file.name}`;

    if (file.outdated || file.errored || file.locked) {
      return;
    }

    this.confirmDialogService
      .open({
        phrases: [
          this.translate.translateService.instant('CONFIRM_DIALOG.SAVE_BEFORE_LOAD.PHRASE1', {fileName: file.name}),
          this.translate.language.CONFIRM_DIALOG.SAVE_BEFORE_LOAD.PHRASE2,
        ],
        title: this.translate.language.CONFIRM_DIALOG.SAVE_BEFORE_LOAD.TITLE,
        closeButtonText: this.translate.language.CONFIRM_DIALOG.SAVE_BEFORE_LOAD.CANCEL_BUTTON,
        okButtonText: this.translate.language.CONFIRM_DIALOG.SAVE_BEFORE_LOAD.OK_BUTTON,
      })
      .subscribe(confirmed => {
        if (confirmed !== ConfirmDialogEnum.cancel) {
          this.modelSaverService.saveModel().subscribe();
        }
        // TODO improve this functionality
        this.fileHandlingService.loadNamespaceFile(absoluteFileName, file.aspectModelUrn);
      });
  }

  public deleteFile() {
    const {namespace, file} = this.menuSelection;
    const aspectModelFileName = `${namespace}:${file.name}`;
    this.confirmDialogService
      .open({
        phrases: [
          this.translate.translateService.instant('CONFIRM_DIALOG.DELETE_FILE.PHRASE1', {fileName: file.name}),
          this.translate.language.CONFIRM_DIALOG.DELETE_FILE.PHRASE2,
        ],
        title: this.translate.language.CONFIRM_DIALOG.DELETE_FILE.TITLE,
      })
      .subscribe(confirm => {
        if (confirm !== ConfirmDialogEnum.cancel) {
          this.modelApiService.deleteFile(aspectModelFileName, this.menuSelection.file.aspectModelUrn).subscribe(() => {
            this.sidebarService.workspace.refresh();
            this.electronSignalsService.call('requestRefreshWorkspaces');
          });
          this.sidebarService.selection.reset();
          this.loadedFiles.removeFile(aspectModelFileName);
        }
      });
  }

  public copyNamespace() {
    navigator.clipboard.writeText(`${this.menuSelection.namespace}/${this.menuSelection.file.name}`);
  }

  public prepare(namespace: string, file: FileStatus) {
    this.menuSelection = {namespace, file};
  }

  public sortNamespaces(namespaces: {key: string; value: any}[]) {
    return namespaces.sort((n1, n2) => (n1.key >= n2.key ? 1 : -1));
  }

  public isCurrentFile(key: string, file: FileStatus): string {
    return this.ngZone.run(() => {
      if (file.outdated) {
        return this.translate.translateService.instant('TOOLTIPS.OUTDATED_FILE', {sammVersion: file.sammVersion});
      }

      if (file.errored) {
        return file.unknownSammVersion
          ? 'Detected unknown SAMM version'
          : file.missingDependencies.length
            ? 'Missing dependencies ' + file.missingDependencies.join('\n')
            : this.translate.language.TOOLTIPS.ERRORED_FILE;
      }

      if (file.loaded) {
        return this.translate.language.TOOLTIPS.CURRENT_FILE;
      }

      if (file.locked) {
        return this.translate.language.TOOLTIPS.LOCKED_FILE;
      }

      return '';
    });
  }
}
