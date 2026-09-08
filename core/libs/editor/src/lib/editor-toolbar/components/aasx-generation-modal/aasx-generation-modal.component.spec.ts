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
import {LoadedFilesService, NamespaceFile} from '@ame/cache';
import {RdfService} from '@ame/rdf/services';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MatDialogRef} from '@angular/material/dialog';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {DefaultAspect, ModelElementCache, RdfModel} from '@esmf/aspect-model-loader';
import {TranslocoTestingModule} from '@jsverse/transloco';
import {Store} from 'n3';
import {MockProvider} from 'ng-mocks';
import {of} from 'rxjs';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {AASXGenerationModalComponent} from './aasx-generation-modal.component';

describe('AASXGenerationModalComponent', () => {
  let component: AASXGenerationModalComponent;
  let fixture: ComponentFixture<AASXGenerationModalComponent>;
  let dialogRef: MatDialogRef<AASXGenerationModalComponent>;
  let modelApiService: ModelApiService;

  const aspect = new DefaultAspect({
    aspectModelUrn: 'urn:test:1.0.0#Aspect',
    name: 'Aspect',
    metaModelVersion: '2.0.0',
  });

  beforeEach(async () => {
    dialogRef = {
      close: vi.fn(),
    } as unknown as MatDialogRef<AASXGenerationModalComponent>;

    await TestBed.configureTestingModule({
      imports: [
        AASXGenerationModalComponent,
        BrowserAnimationsModule,
        TranslocoTestingModule.forRoot({langs: {en: {}}, translocoConfig: {availableLangs: ['en'], defaultLang: 'en'}}),
      ],
      providers: [
        {provide: MatDialogRef, useValue: dialogRef},
        MockProvider(ModelApiService, {
          generateAASX: vi.fn(() => of('aasx blob content')),
          generatetAASasXML: vi.fn(() => of('<xml></xml>')),
        }),
        MockProvider(RdfService, {
          serializeModel: vi.fn(() => 'turtle content'),
        }),
        MockProvider(LoadedFilesService, {
          currentLoadedFile: new NamespaceFile(new RdfModel(new Store(), '2.0.0', 'urn:test:1.0.0#'), new ModelElementCache(), aspect),
        }),
      ],
    }).compileComponents();

    modelApiService = TestBed.inject(ModelApiService);
    fixture = TestBed.createComponent(AASXGenerationModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create with aasx selected by default', () => {
    expect(component).toBeTruthy();
    expect(component.formatModel().format).toBe('aasx');
  });

  it('generate should call generateAASX and close dialog', () => {
    component.generate();

    expect(modelApiService.generateAASX).toHaveBeenCalled();
    expect(dialogRef.close).toHaveBeenCalled();
  });
});
