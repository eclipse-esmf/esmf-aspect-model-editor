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
import {ElectronSignals, ElectronSignalsService, ElectronTunnelService, NotificationsService} from '@ame/shared';
import {NgOptimizedImage} from '@angular/common';
import {Component, DestroyRef, OnInit, inject, signal} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {Router} from '@angular/router';
import {TranslocoDirective} from '@jsverse/transloco';
import {Observable, catchError, forkJoin, of, switchMap, take} from 'rxjs';
import {map} from 'rxjs/operators';

@Component({
  templateUrl: 'loading.component.html',
  styleUrls: ['loading.component.scss'],
  imports: [NgOptimizedImage, TranslocoDirective],
})
export class LoadingComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);
  private readonly electronTunnel = inject(ElectronTunnelService);
  private readonly modelApiService = inject(ModelApiService);
  private readonly notificationsService = inject(NotificationsService);
  private readonly electronSignalsService: ElectronSignals = inject(ElectronSignalsService);

  /** Whether startup data could not be loaded, used by the template to show an error state instead of the spinner. */
  readonly hasError = signal(false);

  ngOnInit(): void {
    this.electronSignalsService.call('requestMaximizeWindow');

    forkJoin([this.electronSignalsService.call('isFirstWindow'), this.loadModelText()])
      .pipe(
        take(1),
        catchError(error => {
          console.error(error);
          this.notificationsService.error({
            title: 'Unable to load the application',
            message: error?.message || 'An unexpected error occurred while starting the editor.',
          });
          this.hasError.set(true);
          return of(null);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(result => {
        if (!result) {
          return;
        }

        const [isFirstWindow, model] = result;
        this.electronTunnel.startUpData$.next({isFirstWindow, model});

        const queryParams = Object.fromEntries(new URLSearchParams(window.location.search));
        this.router.navigate(['/editor'], {queryParams});
      });
  }

  loadModelText(): Observable<string | null> {
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
