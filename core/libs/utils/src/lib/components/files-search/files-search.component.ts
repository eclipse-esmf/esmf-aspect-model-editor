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

import {Component, inject} from '@angular/core';

import {FormControl, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatInputModule} from '@angular/material/input';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {
  ElectronSignals,
  ElectronSignalsService,
  ModelSavingTrackerService,
  NotificationsService,
  SearchService,
  filesSearchOption,
} from '@ame/shared';
import {FileHandlingService, SaveModelDialogService} from '@ame/editor';
import {SearchesStateService} from '../../search-state.service';
import {FileStatus, SidebarStateService} from '@ame/sidebar';
import {Observable, filter, first, of, startWith, switchMap, tap, throttleTime} from 'rxjs';
import {OpenFileDialogComponent} from '../open-file-dialog/open-file-dialog.component';
import {MatDialog, MatDialogModule} from '@angular/material/dialog';
import {LanguageTranslateModule, LanguageTranslationService} from '@ame/translation';

@Component({
  selector: 'ame-files-search',
  standalone: true,
  templateUrl: './files-search.component.html',
  styleUrls: ['./files-search.component.scss'],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatInputModule,
    MatAutocompleteModule,
    MatFormFieldModule,
    MatIconModule,
    OpenFileDialogComponent,
    MatDialogModule,
    LanguageTranslateModule,
  ],
})
export class FilesSearchComponent {
  private electronSignalsService: ElectronSignals = inject(ElectronSignalsService);
  public searchControl = new FormControl('');
  public files: {file: string; namespace: string}[] = [];
  public loading = false;
  public searchableFiles = [];
  public get namespaces() {
    return this.sidebarStateService.namespacesState.namespaces;
  }

  constructor(
    private searchesStateService: SearchesStateService,
    private sidebarStateService: SidebarStateService,
    private matDialog: MatDialog,
    private notificationService: NotificationsService,
    private modelSavingTracker: ModelSavingTrackerService,
    private saveModelDialog: SaveModelDialogService,
    private fileHandlingService: FileHandlingService,
    private searchService: SearchService,
    private translate: LanguageTranslationService,
  ) {
    this.loading = true;
    this.parseFiles(this.namespaces);
    this.sidebarStateService.requestGetNamespaces().subscribe(namespaces => {
      this.parseFiles(namespaces);
      this.loading = false;
    });

    this.searchControl.valueChanges.pipe(startWith(''), throttleTime(150)).subscribe(value => {
      this.searchableFiles = value === '' ? this.files : this.searchService.search(value, this.files, filesSearchOption);
      console.log(this.searchableFiles);
    });
  }

  openFile({file, namespace}) {
    this.matDialog
      .open(OpenFileDialogComponent, {data: {file, namespace}})
      .afterClosed()
      .pipe(
        filter(result => result),
        switchMap(result => (result === 'open-in' ? this.loadModel(file, namespace) : this.openWindow(file, namespace))),
      )

      .subscribe(console.log);
    this.searchControl.patchValue('');
    this.closeSearch();
  }

  closeSearch() {
    this.searchesStateService.filesSearch.close();
  }

  parseFiles(namespaces: Record<string, FileStatus[]>) {
    this.files = Object.entries(namespaces).reduce((acc: any, [namespace, files]) => {
      acc.push(...files.map(({name: file}) => ({file, namespace})));
      return acc;
    }, []);
    this.searchableFiles = this.files;
  }

  private checkUnsavedChanges(): Observable<boolean> {
    return this.modelSavingTracker.isSaved$.pipe(
      first(),
      switchMap(isSaved => (isSaved ? of(true) : this.saveModelDialog.openDialog())),
    );
  }

  private loadModel(file: string, namespace: string) {
    const status = this.checkFile(file, namespace);
    if (status) {
      return of(status);
    }

    return this.checkUnsavedChanges().pipe(switchMap(() => of(this.fileHandlingService.loadNamespaceFile(`${namespace}:${file}`))));
  }

  private openWindow(file: string, namespace: string) {
    const status = this.checkFile(file, namespace);
    if (status) {
      return of(status);
    }

    return this.checkUnsavedChanges().pipe(
      tap(() =>
        this.electronSignalsService.call('openWindow', {
          namespace,
          file,
          fromWorkspace: true,
        }),
      ),
    );
  }

  private checkFile(file: string, namespace: string) {
    const fileStatus = this.sidebarStateService.namespacesState.getFile(namespace, file);
    if (fileStatus && (fileStatus.errored || fileStatus.loaded || fileStatus.locked)) {
      this.notificationService.warning({
        title: this.translate.language.SEARCHES.FILES.NOTIFICATIONS.TITLE,
        message: fileStatus.errored
          ? this.translate.language.SEARCHES.FILES.NOTIFICATIONS.ERROR_MESSAGE
          : fileStatus.loaded
            ? this.translate.language.SEARCHES.FILES.NOTIFICATIONS.ALREADY_LOADED_FILE_MESSAGE
            : this.translate.language.SEARCHES.FILES.NOTIFICATIONS.LOCKED_FILE_MESSAGE,
      });
      return 'invalid-file';
    }

    return null;
  }
}
