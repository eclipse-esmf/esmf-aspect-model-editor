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

import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {environment} from '../../../../environments/environment';

class SearchState {
  private _opened$ = new BehaviorSubject(false);
  public opened$ = this._opened$.asObservable();

  open() {
    this._opened$.next(true);
  }

  close() {
    this._opened$.next(false);
  }

  toggle() {
    this._opened$.next(!this._opened$.value);
  }
}

@Injectable({providedIn: 'root'})
export class SearchesStateService {
  public elementsSearch = new SearchState();
  public filesSearch = new SearchState();

  constructor() {
    this.elementsSearch.opened$.subscribe(opened => {
      if (opened) this.filesSearch.close();
    });

    this.filesSearch.opened$.subscribe(opened => {
      if (opened) this.elementsSearch.close();
    });

    if (!environment.production) {
      window['angular.searchesStateService'] = this;
    }
  }
}
