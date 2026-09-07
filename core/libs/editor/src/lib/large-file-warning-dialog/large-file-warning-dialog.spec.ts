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

import {LoadedFilesService, NamespaceFile} from '@ame/cache';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {ModelElementCache, RdfModel} from '@esmf/aspect-model-loader';
import {TranslocoTestingModule} from '@jsverse/transloco';
import {Store} from 'n3';
import {MockProvider} from 'ng-mocks';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {LargeFileWarningComponent} from './large-file-warning-dialog';

describe('LargeFileWarningComponent', () => {
  let component: LargeFileWarningComponent;
  let fixture: ComponentFixture<LargeFileWarningComponent>;
  let dialogRef: MatDialogRef<LargeFileWarningComponent>;
  let loadedFilesService: LoadedFilesService;

  beforeEach(async () => {
    dialogRef = {
      close: vi.fn(),
    } as unknown as MatDialogRef<LargeFileWarningComponent>;

    await TestBed.configureTestingModule({
      imports: [
        LargeFileWarningComponent,
        TranslocoTestingModule.forRoot({langs: {en: {}}, translocoConfig: {availableLangs: ['en'], defaultLang: 'en'}}),
      ],
      providers: [
        {provide: MatDialogRef, useValue: dialogRef},
        {provide: MAT_DIALOG_DATA, useValue: {elementsCount: 150}},
        MockProvider(LoadedFilesService, {
          currentLoadedFile: new NamespaceFile(new RdfModel(new Store(), '2.0.0', 'urn:test#'), new ModelElementCache(), null),
        }),
      ],
    }).compileComponents();

    loadedFilesService = TestBed.inject(LoadedFilesService);
    fixture = TestBed.createComponent(LargeFileWarningComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and set elementsCount', () => {
    expect(component).toBeTruthy();
    expect(component.elementsCount()).toBe(150);
  });

  it('should close with open response', () => {
    component.close('open');
    expect(dialogRef.close).toHaveBeenCalledWith('open');
  });

  it('should reset cache and close on cancel response', () => {
    const resetSpy = vi.spyOn(loadedFilesService.currentLoadedFile.cachedFile, 'reset');
    component.close('cancel');
    expect(resetSpy).toHaveBeenCalled();
    expect(dialogRef.close).toHaveBeenCalledWith('cancel');
  });
});
