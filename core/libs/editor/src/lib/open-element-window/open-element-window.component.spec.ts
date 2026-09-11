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
import {ElectronSignalsService, NotificationsService} from '@ame/shared';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {RdfModel} from '@esmf/aspect-model-loader';
import {TranslocoTestingModule} from '@jsverse/transloco';
import {NamedNode, Quad, Store} from 'n3';
import {MockProvider} from 'ng-mocks';
import {of, throwError} from 'rxjs';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {ModelLoaderService} from '../model-loader.service';
import {OpenElementWindowComponent} from './open-element-window.component';

describe('OpenElementWindowComponent', () => {
  let component: OpenElementWindowComponent;
  let fixture: ComponentFixture<OpenElementWindowComponent>;
  let modelApiService: ModelApiService;
  let modelLoaderService: ModelLoaderService;
  let electronSignalsService: ElectronSignalsService;
  let notificationService: NotificationsService;
  let dialogRef: MatDialogRef<OpenElementWindowComponent>;

  const urn = 'urn:samm:com.test:1.0.0#TestElement';
  const file = 'test.ttl';

  beforeEach(async () => {
    dialogRef = {
      close: vi.fn(),
    } as unknown as MatDialogRef<OpenElementWindowComponent>;

    await TestBed.configureTestingModule({
      imports: [
        OpenElementWindowComponent,
        TranslocoTestingModule.forRoot({langs: {en: {}}, translocoConfig: {availableLangs: ['en'], defaultLang: 'en'}}),
      ],
      providers: [
        {provide: MatDialogRef, useValue: dialogRef},
        {provide: MAT_DIALOG_DATA, useValue: {urn, file}},
        MockProvider(ModelApiService, {
          fetchAspectMetaModel: vi.fn(() => of({content: 'model ttl content', sourceLocation: ''} as any)),
        }),
        MockProvider(ModelLoaderService),
        MockProvider(ElectronSignalsService, {
          call: vi.fn(),
        }),
        MockProvider(NotificationsService, {
          error: vi.fn(),
        }),
      ],
    }).compileComponents();

    modelApiService = TestBed.inject(ModelApiService);
    modelLoaderService = TestBed.inject(ModelLoaderService);
    electronSignalsService = TestBed.inject(ElectronSignalsService);
    notificationService = TestBed.inject(NotificationsService);
  });

  it('should call electron openWindow when element is found in RDF', () => {
    const store = new Store();
    store.addQuad(new Quad(new NamedNode(urn), new NamedNode('http://test#pred'), new NamedNode('http://test#obj')));
    const rdfModel = new RdfModel(store, '2.0.0', 'urn:samm:com.test:1.0.0#');

    vi.spyOn(modelLoaderService, 'parseRdfModel').mockReturnValue(of(rdfModel));

    fixture = TestBed.createComponent(OpenElementWindowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component).toBeTruthy();
    expect(electronSignalsService.call).toHaveBeenCalledWith('openWindow', {
      namespace: 'com.test:1.0.0',
      file: 'test.ttl',
      editElement: urn,
      fromWorkspace: true,
      aspectModelUrn: urn,
    });
    expect(dialogRef.close).toHaveBeenCalled();
  });

  it('should notify error if element quads not found', () => {
    const store = new Store();
    const rdfModel = new RdfModel(store, '2.0.0', 'urn:samm:com.test:1.0.0#');

    vi.spyOn(modelLoaderService, 'parseRdfModel').mockReturnValue(of(rdfModel));

    fixture = TestBed.createComponent(OpenElementWindowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(notificationService.error).toHaveBeenCalled();
    expect(dialogRef.close).toHaveBeenCalled();
  });

  it('should handle fetch errors gracefully', () => {
    vi.spyOn(modelApiService, 'fetchAspectMetaModel').mockReturnValue(throwError(() => new Error('Fetch failed')));

    fixture = TestBed.createComponent(OpenElementWindowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(notificationService.error).toHaveBeenCalled();
    expect(dialogRef.close).toHaveBeenCalled();
  });
});
