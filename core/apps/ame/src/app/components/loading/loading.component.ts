/*
 * Copyright (c) 2023 Robert Bosch Manufacturing Solutions GmbH
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
import {ElectronTunnelService, StartupData} from '@ame/shared';
import {AfterViewInit, Component, NgZone, OnDestroy} from '@angular/core';
import {Router} from '@angular/router';
import {Observable, Subscription, forkJoin, switchMap, take} from 'rxjs';

@Component({
  templateUrl: 'loading.component.html',
  styleUrls: ['loading.component.scss'],
})
export class LoadingComponent implements AfterViewInit, OnDestroy {
  private subscription = new Subscription();

  constructor(
    private router: Router,
    private electronTunnel: ElectronTunnelService,
    private modelApiService: ModelApiService,
    private ngZone: NgZone
  ) {}

  ngAfterViewInit(): void {
    if (!this.electronTunnel.ipcRenderer) {
      this.modelApiService.getDefaultAspectModel().subscribe(model => {
        this.electronTunnel.startUpData$.next({isFirstWindow: true, model});
        this.router.navigate(['/editor']);
      });
      return;
    }

    const sub = this.electronTunnel
      .requestStartupData()
      .pipe(
        switchMap((data: StartupData) => {
          this.electronTunnel.setWindowInfo(data.id, data.options);
          return forkJoin([this.electronTunnel.isFirstWindow(), this.loadModelText()]);
        }),
        take(1)
      )
      .subscribe({
        next: ([isFirstWindow, model]) => {
          this.electronTunnel.startUpData$.next({isFirstWindow, model});
        },
        error: error => console.log(error),
        complete: () => {
          // Because complete is called in electron callback,
          // router.navigate is called outside ngZone
          // and needs to be called in ngZone to function
          this.ngZone.run(() => {
            this.router.navigate(['/editor']);
          });
        },
      });

    this.subscription.add(sub);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  loadModelText(): Observable<string> {
    if (!this.electronTunnel.windowInfo.options) {
      return this.modelApiService.getDefaultAspectModel();
    }

    const {namespace, file} = this.electronTunnel.windowInfo.options;
    return this.modelApiService.getAspectMetaModel(`${namespace}:${file}`);
  }
}
