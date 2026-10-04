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

import {WorkspaceFacade} from '@ame/domain';
import {NotificationsService, TauriSignals, TauriSignalsService, WindowSession} from '@ame/shared';
import {NgOptimizedImage} from '@angular/common';
import {Component, DestroyRef, OnInit, inject, signal} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {Router} from '@angular/router';
import {TranslocoDirective} from '@jsverse/transloco';
import {Observable, catchError, forkJoin, of, switchMap, take} from 'rxjs';
import {map} from 'rxjs/operators';
import {TauriTunnelService} from './tauri-tunnel.service';

@Component({
  selector: 'ame-loading',
  templateUrl: './loading.component.html',
  styleUrls: ['./loading.component.scss'],
  imports: [NgOptimizedImage, TranslocoDirective],
})
export class LoadingComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);
  private readonly tauriTunnelService = inject(TauriTunnelService);
  private readonly modelApiService = inject(WorkspaceFacade);
  private readonly notificationsService = inject(NotificationsService);
  private readonly tauriSignalsService: TauriSignals = inject(TauriSignalsService);

  /** Whether startup data could not be loaded, used by the template to show an error state instead of the spinner. */
  readonly hasError = signal(false);

  ngOnInit(): void {
    this.tauriSignalsService.call('requestMaximizeWindow');

    forkJoin([this.tauriSignalsService.call('isFirstWindow'), this.loadStartupData()])
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

        const [isFirstWindow, {model, session, windowId}] = result;
        this.tauriTunnelService.startUpData$.next(session ? {isFirstWindow, model, session, windowId} : {isFirstWindow, model});

        const queryParams = Object.fromEntries(new URLSearchParams(window.location.search));
        this.router.navigate(['/editor'], {queryParams});
      });
  }

  loadModelText(): Observable<string | null> {
    return this.loadStartupData().pipe(map(data => data.model));
  }

  /**
   * Fetches the model of this window. Windows reopened from the last session are restored by the editor,
   * which also handles models that no longer exist.
   */
  loadStartupData(): Observable<{model: string | null; session?: WindowSession; windowId?: string}> {
    return this.tauriSignalsService.call('requestWindowData').pipe(
      switchMap(data => {
        if (data?.options?.session?.models?.length) {
          return of({model: null, session: data.options.session, windowId: data.id});
        }

        // An empty session or a window without a model starts with an empty model.
        if (!data?.options?.aspectModelUrn) {
          return of({model: null});
        }

        return this.modelApiService.fetchAspectMetaModel(data.options.aspectModelUrn).pipe(map(model => ({model: model.content})));
      }),
    );
  }
}
