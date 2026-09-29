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
import {NotificationsService, TauriSignalsService} from '@ame/shared';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {Router} from '@angular/router';
import {TranslocoTestingModule} from '@jsverse/transloco';
import {BehaviorSubject, Observable, of, throwError} from 'rxjs';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {LoadingComponent} from './loading.component';
import {TauriTunnelService} from './tauri-tunnel.service';

describe('LoadingComponent', () => {
  let component: LoadingComponent;
  let fixture: ComponentFixture<LoadingComponent>;

  let router: {navigate: ReturnType<typeof vi.fn>};
  let tauriSignalsService: {call: ReturnType<typeof vi.fn>};
  let tauriTunnelService: {startUpData$: BehaviorSubject<any>};
  let modelApiService: {fetchAspectMetaModel: ReturnType<typeof vi.fn>};
  let notificationsService: {error: ReturnType<typeof vi.fn>};

  const createComponent = () => {
    fixture = TestBed.createComponent(LoadingComponent);
    component = fixture.componentInstance;
  };

  beforeEach(() => {
    router = {navigate: vi.fn(() => Promise.resolve(true))};
    tauriSignalsService = {
      call: vi.fn((action: string) => {
        if (action === 'isFirstWindow') {
          return of(true);
        }
        if (action === 'requestWindowData') {
          return of({options: null});
        }
        return of(undefined);
      }),
    };
    tauriTunnelService = {startUpData$: new BehaviorSubject<any>(null)};
    modelApiService = {fetchAspectMetaModel: vi.fn(() => of({content: '<ttl content>', sourceLocation: null}))};
    notificationsService = {error: vi.fn()};

    TestBed.configureTestingModule({
      imports: [LoadingComponent, TranslocoTestingModule.forRoot({langs: {en: {}}})],
      providers: [
        {provide: Router, useValue: router},
        {provide: TauriSignalsService, useValue: tauriSignalsService},
        {provide: TauriTunnelService, useValue: tauriTunnelService},
        {provide: WorkspaceFacade, useValue: modelApiService},
        {provide: NotificationsService, useValue: notificationsService},
      ],
    });
  });

  it('should be created', () => {
    createComponent();
    expect(component).toBeTruthy();
  });

  it('should request window maximization on init', () => {
    createComponent();
    fixture.detectChanges();

    expect(tauriSignalsService.call).toHaveBeenCalledWith('requestMaximizeWindow');
  });

  it('should push startup data and navigate to the editor when no model is provided', () => {
    createComponent();
    fixture.detectChanges();

    expect(tauriTunnelService.startUpData$.value).toEqual({isFirstWindow: true, model: null});
    expect(router.navigate).toHaveBeenCalledWith(['/editor'], {queryParams: {}});
    expect(component.hasError()).toBe(false);
  });

  it('should fetch and forward the model content when startup options contain an aspect model urn', () => {
    tauriSignalsService.call = vi.fn((action: string) => {
      if (action === 'isFirstWindow') {
        return of(false);
      }
      if (action === 'requestWindowData') {
        return of({options: {aspectModelUrn: 'urn:samm:example#Aspect'}});
      }
      return of(undefined);
    });

    createComponent();
    fixture.detectChanges();

    expect(modelApiService.fetchAspectMetaModel).toHaveBeenCalledWith('urn:samm:example#Aspect');
    expect(tauriTunnelService.startUpData$.value).toEqual({isFirstWindow: false, model: '<ttl content>'});
    expect(router.navigate).toHaveBeenCalledWith(['/editor'], {queryParams: {}});
  });

  it('should set hasError and notify when loading the startup data fails', () => {
    tauriSignalsService.call = vi.fn((action: string) => {
      if (action === 'isFirstWindow') {
        return throwError(() => new Error('boom'));
      }
      if (action === 'requestWindowData') {
        return of({options: null});
      }
      return of(undefined);
    });

    createComponent();
    fixture.detectChanges();

    expect(component.hasError()).toBe(true);
    expect(notificationsService.error).toHaveBeenCalledWith(
      expect.objectContaining({title: 'Unable to load the application', message: 'boom'}),
    );
    expect(router.navigate).not.toHaveBeenCalled();
    expect(tauriTunnelService.startUpData$.value).toBeNull();
  });

  it('loadModelText should return null when no options are provided', () => {
    createComponent();

    let result: string | null;
    (component.loadModelText() as Observable<string | null>).subscribe(value => (result = value));

    expect(result).toBeNull();
    expect(modelApiService.fetchAspectMetaModel).not.toHaveBeenCalled();
  });

  it('loadModelText should return the fetched model content when options are provided', () => {
    tauriSignalsService.call = vi.fn((action: string) => {
      if (action === 'requestWindowData') {
        return of({options: {aspectModelUrn: 'urn:samm:example#Aspect'}});
      }
      return of(undefined);
    });

    createComponent();

    let result: string | null;
    (component.loadModelText() as Observable<string | null>).subscribe(value => (result = value));

    expect(result).toBe('<ttl content>');
    expect(modelApiService.fetchAspectMetaModel).toHaveBeenCalledWith('urn:samm:example#Aspect');
  });
});
