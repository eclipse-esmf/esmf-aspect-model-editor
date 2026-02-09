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
import {ElectronSignals, ElectronSignalsService, ElectronTunnelService} from '@ame/shared';
import {NgOptimizedImage} from '@angular/common';
import {AfterViewInit, Component, DestroyRef, NgZone, inject} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {Router} from '@angular/router';
import {Observable, forkJoin, of, switchMap, take} from 'rxjs';
import {map} from 'rxjs/operators';

@Component({
  standalone: true,
  templateUrl: 'loading.component.html',
  styleUrls: ['loading.component.scss'],
  imports: [NgOptimizedImage],
})
export class LoadingComponent implements AfterViewInit {
  private destroyRef = inject(DestroyRef);
  private router = inject(Router);
  private electronTunnel = inject(ElectronTunnelService);
  private modelApiService = inject(ModelApiService);
  private ngZone = inject(NgZone);

  private electronSignalsService: ElectronSignals = inject(ElectronSignalsService);

  ngAfterViewInit(): void {
    this.electronSignalsService.call('requestMaximizeWindow');

    forkJoin([this.electronSignalsService.call('isFirstWindow'), this.loadModelText()])
      .pipe(takeUntilDestroyed(this.destroyRef), take(1))
      .subscribe({
        next: ([isFirstWindow, model]) => {
          this.electronTunnel.startUpData$.next({isFirstWindow, model});
        },
        error: error => console.log(error),
        complete: () => {
          // Because complete is called in electron callback,
          // router.navigate is called outside ngZone
          // and needs to be called in ngZone to function
          const queryParams = Object.fromEntries(new URLSearchParams(window.location.search));
          this.ngZone.run(() => this.router.navigate(['/editor'], {queryParams}));
        },
      });
  }

  loadModelText(): Observable<string> {
    return this.electronSignalsService.call('requestWindowData').pipe(
      switchMap(data => {
        if (!data?.options) {
          return of(null);
        }

        return this.modelApiService.fetchAspectMetaModel(data.options.aspectModelUrn).pipe(map(model => model.content));
      }),
    );
  }
}
