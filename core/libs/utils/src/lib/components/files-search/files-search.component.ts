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

import {FileHandlingService, ModelCheckerService, SaveModelDialogService} from '@ame/editor';
import {
  ElectronSignals,
  ElectronSignalsService,
  filesSearchOption,
  ModelSavingTrackerService,
  NotificationsService,
  SearchService,
} from '@ame/shared';
import {FileStatus, SidebarStateService} from '@ame/sidebar';
import {LanguageTranslationService} from '@ame/translation';
import {Component, inject, signal} from '@angular/core';
import {toObservable} from '@angular/core/rxjs-interop';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatDialog} from '@angular/material/dialog';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {TranslocoDirective} from '@jsverse/transloco';
import {filter, first, map, Observable, of, switchMap, tap, throttleTime} from 'rxjs';
import {SearchesStateService} from '../../search-state.service';
import {OpenFileDialogComponent} from '../open-file-dialog/open-file-dialog.component';

@Component({
  selector: 'ame-files-search',
  templateUrl: './files-search.component.html',
  styleUrls: ['./files-search.component.scss'],
  imports: [MatInputModule, MatAutocompleteModule, MatFormFieldModule, MatIconModule, TranslocoDirective],
})
export class FilesSearchComponent {
  private electronSignalsService: ElectronSignals = inject(ElectronSignalsService);
  private searchesStateService = inject(SearchesStateService);
  private sidebarStateService = inject(SidebarStateService);
  private matDialog = inject(MatDialog);
  private notificationService = inject(NotificationsService);
  private modelSavingTracker = inject(ModelSavingTrackerService);
  private saveModelDialog = inject(SaveModelDialogService);
  private fileHandlingService = inject(FileHandlingService);
  private searchService = inject(SearchService);
  private translate = inject(LanguageTranslationService);
  private modelChecker = inject(ModelCheckerService);

  private files: {file: string; namespace: string}[] = [];

  public searchQuery = signal('');
  public loading = signal(false);
  public searchableFiles = signal([]);

  public get namespaces() {
    return this.sidebarStateService.namespacesState.namespaces();
  }

  constructor() {
    this.parseFiles(this.namespaces);

    if (!Object.keys(this.namespaces).length) {
      this.loading.set(true);
      this.modelChecker
        .detectWorkspaceErrors()
        .pipe(map(files => this.sidebarStateService.updateWorkspace(files)))
        .subscribe(n => {
          this.parseFiles(n);
          this.loading.set(false);
        });
    }

    toObservable(this.searchQuery)
      .pipe(throttleTime(150))
      .subscribe(value => {
        if (value === '') {
          this.searchableFiles.set(this.files);
        } else {
          this.searchableFiles.set(this.searchService.search(value, this.files, filesSearchOption));
        }
      });
  }

  openFile({file, namespace, aspectModelUrn}) {
    this.matDialog
      .open(OpenFileDialogComponent, {data: {file, namespace}})
      .afterClosed()
      .pipe(
        filter(result => result),
        switchMap(result => (result === 'open-in' ? this.loadModel(file, namespace, aspectModelUrn) : this.openWindow(file, namespace))),
      )
      .subscribe();
    this.searchQuery.set('');
    this.closeSearch();
  }

  closeSearch() {
    this.searchesStateService.filesSearch.close();
  }

  parseFiles(namespaces: Record<string, FileStatus[]>) {
    this.files = Object.entries(namespaces).reduce((acc: any, [namespace, files]) => {
      acc.push(...files.map(file => ({file: file.name, namespace, aspectModelUrn: file.aspectModelUrn})));
      return acc;
    }, []);

    this.searchableFiles.set(this.files);
  }

  private checkUnsavedChanges(): Observable<boolean> {
    return this.modelSavingTracker.isSaved$.pipe(
      first(),
      switchMap(isSaved => (isSaved ? of(true) : this.saveModelDialog.openDialog())),
    );
  }

  private loadModel(file: string, namespace: string, aspectModelUrn: string) {
    return this.checkUnsavedChanges().pipe(
      switchMap(() => of(this.fileHandlingService.loadNamespaceFile(`${namespace}:${file}`, aspectModelUrn))),
    );
  }

  private openWindow(file: string, namespace: string) {
    const status = this.checkFile(file, namespace);
    if (!(status instanceof FileStatus)) {
      return of(status);
    }

    return this.checkUnsavedChanges().pipe(
      tap(() =>
        this.electronSignalsService.call('openWindow', {
          namespace,
          file,
          fromWorkspace: true,
          aspectModelUrn: status.aspectModelUrn,
        }),
      ),
    );
  }

  private checkFile(file: string, namespace: string) {
    const fileStatus = this.sidebarStateService.namespacesState.getFile(namespace, file);
    if (fileStatus && (fileStatus.errored || fileStatus.loaded)) {
      this.notificationService.warning({
        title: this.translate.language.searches.files.notifications.title,
        message: fileStatus.errored
          ? this.translate.language.searches.files.notifications.errorMessage
          : this.translate.language.searches.files.notifications.alreadyLoadedFileMessage,
      });
      return 'invalid-file';
    }

    return fileStatus;
  }
}
