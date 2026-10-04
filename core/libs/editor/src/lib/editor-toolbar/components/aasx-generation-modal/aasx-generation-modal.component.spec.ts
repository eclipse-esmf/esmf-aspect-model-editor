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

import {LoadedFilesService, ModelApiPort, NamespaceFile, RdfPort} from '@ame/domain';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MatDialogRef} from '@angular/material/dialog';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {DefaultAspect, ModelElementCache, RdfModel} from '@esmf/aspect-model-loader';
import {TranslocoTestingModule} from '@jsverse/transloco';
import {Store} from 'n3';
import {MockProvider} from 'ng-mocks';
import {of, Subject} from 'rxjs';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {AASXGenerationModalComponent} from './aasx-generation-modal.component';

describe('AASXGenerationModalComponent', () => {
  let component: AASXGenerationModalComponent;
  let fixture: ComponentFixture<AASXGenerationModalComponent>;
  let dialogRef: MatDialogRef<AASXGenerationModalComponent>;
  let modelApiService: ModelApiPort;

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
        MockProvider(ModelApiPort, {
          generateAASX: vi.fn(() => of('aasx blob content')),
          generatetAASasXML: vi.fn(() => of('<xml></xml>')),
        }),
        MockProvider(RdfPort, {
          serializeModel: vi.fn(() => 'turtle content'),
        }),
        MockProvider(LoadedFilesService, {
          currentLoadedFile: new NamespaceFile(new RdfModel(new Store(), '2.0.0', 'urn:test:1.0.0#'), new ModelElementCache(), aspect),
        }),
      ],
    }).compileComponents();

    modelApiService = TestBed.inject(ModelApiPort);
    fixture = TestBed.createComponent(AASXGenerationModalComponent);
    component = fixture.componentInstance;
    (dialogRef as unknown as {componentInstance: unknown}).componentInstance = component;
    fixture.detectChanges();
  });

  function closeButton(): HTMLButtonElement {
    return fixture.nativeElement.querySelector('[data-testid="dialog-close-button"]');
  }

  it('should close via the shared (x) button / Escape when idle', () => {
    closeButton().click();
    expect(dialogRef.close).toHaveBeenCalledTimes(1);
  });

  it('should not close via (x) / Escape while the file is generated', () => {
    const pending = new Subject<string>();
    (modelApiService.generateAASX as ReturnType<typeof vi.fn>).mockReturnValue(pending);

    component.generate();
    fixture.detectChanges();

    expect(closeButton().disabled).toBe(true);
    component.requestClose();
    expect(dialogRef.close).not.toHaveBeenCalled();

    pending.next('content');
    pending.complete();
    expect(dialogRef.close).toHaveBeenCalledTimes(1);
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
