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

import {SearchStore} from '@ame/domain';
import {inject, Injectable} from '@angular/core';
import {toObservable} from '@angular/core/rxjs-interop';
import {environment} from 'environments/environment';
import {Observable} from 'rxjs';

class SearchStateAdapter {
  constructor(
    public readonly opened$: Observable<boolean>,
    private readonly onOpen: () => void,
    private readonly onClose: () => void,
    private readonly onToggle: () => void,
  ) {}

  open() {
    this.onOpen();
  }

  close() {
    this.onClose();
  }

  toggle() {
    this.onToggle();
  }
}

@Injectable({providedIn: 'root'})
export class SearchesStateService {
  public readonly searchStore = inject(SearchStore);

  public readonly elementsSearch = new SearchStateAdapter(
    toObservable(this.searchStore.elementsSearchOpened),
    () => this.searchStore.openElementsSearch(),
    () => this.searchStore.closeElementsSearch(),
    () => this.searchStore.toggleElementsSearch(),
  );

  public readonly filesSearch = new SearchStateAdapter(
    toObservable(this.searchStore.filesSearchOpened),
    () => this.searchStore.openFilesSearch(),
    () => this.searchStore.closeFilesSearch(),
    () => this.searchStore.toggleFilesSearch(),
  );

  constructor() {
    if (!environment.production) {
      window['angular.searchesStateService'] = this;
    }
  }
}

