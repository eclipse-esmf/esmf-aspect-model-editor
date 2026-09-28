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

import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MatDialogRef} from '@angular/material/dialog';
import {TranslocoTestingModule} from '@jsverse/transloco';
import {MockProvider} from 'ng-mocks';
import {of} from 'rxjs';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {ModelSaverService} from '../model-saver.service';
import {SaveModelDialogComponent} from './save-model-dialog.component';

describe('SaveModelDialogComponent', () => {
  let component: SaveModelDialogComponent;
  let fixture: ComponentFixture<SaveModelDialogComponent>;
  let dialogRef: MatDialogRef<SaveModelDialogComponent>;
  let modelSaverService: ModelSaverService;

  beforeEach(async () => {
    dialogRef = {
      close: vi.fn(),
    } as unknown as MatDialogRef<SaveModelDialogComponent>;

    await TestBed.configureTestingModule({
      imports: [
        SaveModelDialogComponent,
        TranslocoTestingModule.forRoot({langs: {en: {}}, translocoConfig: {availableLangs: ['en'], defaultLang: 'en'}}),
      ],
      providers: [
        {provide: MatDialogRef, useValue: dialogRef},
        MockProvider(ModelSaverService, {
          saveModel: vi.fn(() => of(null as any)),
        }),
      ],
    }).compileComponents();

    modelSaverService = TestBed.inject(ModelSaverService);
    fixture = TestBed.createComponent(SaveModelDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('close should close dialog with passed boolean', () => {
    component.close(false);
    expect(dialogRef.close).toHaveBeenCalledWith(false);
  });

  it('saveModel should call modelSaverService.saveModel and close on completion', () => {
    component.saveModel();
    expect(modelSaverService.saveModel).toHaveBeenCalled();
    expect(dialogRef.close).toHaveBeenCalledWith(true);
  });
});
