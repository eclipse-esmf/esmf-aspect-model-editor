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
import {ElectronSignals, ElectronSignalsService, ElectronTunnelService} from '@ame/shared';
import {AfterViewInit, Component, NgZone, OnDestroy, inject, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {Observable, Subscription, forkJoin, switchMap, take} from 'rxjs';
import {LanguageTranslationService} from '@ame/translation';

@Component({
  templateUrl: 'loading.component.html',
  styleUrls: ['loading.component.scss'],
})
export class LoadingComponent implements OnInit, AfterViewInit, OnDestroy {
  private subscription = new Subscription();
  private language = 'en';
  private electronSignalsService: ElectronSignals = inject(ElectronSignalsService);

  constructor(
    private router: Router,
    private electronTunnel: ElectronTunnelService,
    private modelApiService: ModelApiService,
    private translate: LanguageTranslationService,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    this.language = this.getApplicationLanguage();
    this.translate.initTranslationService(this.language);
  }

  ngAfterViewInit(): void {
    this.initializeLanguage();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  private initializeLanguage(): void {
    this.translate.getTranslation(this.language).subscribe({
      next: () => this.handleLanguageInitialization(),
      error: error => console.error('Error during translation initialization:', error),
    });
  }

  private getApplicationLanguage(): string {
    return localStorage.getItem('applicationLanguage') || this.translate.translateService.defaultLang;
  }

  private handleLanguageInitialization(): void {
    if (!this.electronTunnel.ipcRenderer) {
      this.loadDefaultModel();
      return;
    }

    this.requestWindowMaximization();
    this.handleElectronEnvironment();
  }

  private loadDefaultModel(): void {
    const modelSub = this.modelApiService.getDefaultAspectModel().subscribe(model => {
      this.electronTunnel.startUpData$.next({isFirstWindow: true, model});
      this.navigateToEditor();
    });

    this.subscription.add(modelSub);
  }

  private requestWindowMaximization(): void {
    this.electronSignalsService.call('requestMaximizeWindow');
  }

  private handleElectronEnvironment(): void {
    const electronEnvSub = forkJoin([this.electronSignalsService.call('isFirstWindow'), this.loadModelText()])
      .pipe(take(1))
      .subscribe({
        next: ([isFirstWindow, model]) => this.electronTunnel.startUpData$.next({isFirstWindow, model}),
        error: error => console.error('Error in electron environment:', error),
        complete: () => this.ngZone.run(() => this.navigateToEditor()),
      });

    this.subscription.add(electronEnvSub);
  }

  private navigateToEditor(): void {
    this.router.navigate(['/editor']);
  }

  loadModelText(): Observable<string> {
    return this.electronSignalsService.call('requestWindowData').pipe(
      switchMap(data => {
        if (!data?.options) {
          return this.modelApiService.getDefaultAspectModel();
        }

        const {namespace, file} = data.options;
        return this.modelApiService.getAspectMetaModel(`${namespace}:${file}`);
      })
    );
  }
}
