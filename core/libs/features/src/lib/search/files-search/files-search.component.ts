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

import {
  filesSearchOption,
  IModelCheckerService,
  IModelOpenerService,
  ISidebarStateService,
  LanguageTranslationService,
  MODEL_CHECKER_SERVICE,
  MODEL_OPENER_SERVICE,
  NotificationsService,
  SearchService,
  SIDEBAR_STATE_SERVICE,
} from '@ame/shared';
import {AfterViewInit, Component, ElementRef, inject, signal, viewChild} from '@angular/core';
import {toObservable} from '@angular/core/rxjs-interop';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {TranslocoDirective} from '@jsverse/transloco';
import {map, throttleTime} from 'rxjs';
import {SearchesStateService} from '../search-state.service';

@Component({
  selector: 'ame-files-search',
  templateUrl: './files-search.component.html',
  styleUrls: ['./files-search.component.scss'],
  imports: [MatInputModule, MatAutocompleteModule, MatFormFieldModule, MatIconModule, TranslocoDirective],
})
export class FilesSearchComponent implements AfterViewInit {
  private readonly searchesStateService = inject(SearchesStateService);
  private readonly sidebarStateService: ISidebarStateService = inject(SIDEBAR_STATE_SERVICE);
  private readonly notificationService = inject(NotificationsService);
  private readonly modelOpener: IModelOpenerService = inject(MODEL_OPENER_SERVICE);
  private readonly searchService = inject(SearchService);
  private readonly translate = inject(LanguageTranslationService);
  private readonly modelChecker: IModelCheckerService = inject(MODEL_CHECKER_SERVICE);

  private readonly searchInput = viewChild<ElementRef<HTMLInputElement>>('searchInput');

  private files: {file: string; namespace: string; aspectModelUrn?: string}[] = [];

  public readonly searchQuery = signal('');
  public readonly loading = signal(false);
  public readonly searchableFiles = signal<{file: string; namespace: string; aspectModelUrn?: string}[]>([]);

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

  ngAfterViewInit() {
    // Focus the input as soon as the search overlay is opened so the user can start typing immediately.
    this.searchInput()?.nativeElement.focus();
  }

  openFile({file, namespace, aspectModelUrn}: {file: string; namespace: string; aspectModelUrn?: string}) {
    const fileStatus = this.checkFile(file, namespace);
    if (!fileStatus) {
      return;
    }

    this.modelOpener.promptAndOpen({file, namespace, aspectModelUrn}).subscribe();
    this.searchQuery.set('');
    this.closeSearch();
  }

  closeSearch() {
    this.searchesStateService.filesSearch.close();
  }

  parseFiles(namespaces: Record<string, any[]>) {
    this.files = Object.entries(namespaces).reduce((acc: any, [namespace, files]) => {
      acc.push(...files.map(file => ({file: file.name, namespace, aspectModelUrn: file.aspectModelUrn})));
      return acc;
    }, []);

    this.searchableFiles.set(this.files);
  }

  private checkFile(file: string, namespace: string): boolean {
    const fileStatus = this.sidebarStateService.namespacesState.getFile(namespace, file);
    if (fileStatus && (fileStatus.errored || fileStatus.loaded)) {
      this.notificationService.warning({
        title: this.translate.language.searches.files.notifications.title,
        message: fileStatus.errored
          ? this.translate.language.searches.files.notifications.errorMessage
          : this.translate.language.searches.files.notifications.alreadyLoadedFileMessage,
      });
      return false;
    }

    return true;
  }
}
