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

import {DIALOG_DATA} from '@angular/cdk/dialog';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MatButtonModule} from '@angular/material/button';
import {MatDialogModule} from '@angular/material/dialog';
import {TranslocoService} from '@jsverse/transloco';
import {MockProvider} from 'ng-mocks';
import {BehaviorSubject, of, Subject} from 'rxjs';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {OpenFileDialogComponent} from './open-file-dialog.component';

describe('OpenFileDialogComponent', () => {
  let component: OpenFileDialogComponent;
  let fixture: ComponentFixture<OpenFileDialogComponent>;

  const mockData = {
    file: 'AspectDefault.ttl',
    namespace: 'org.eclipse.examples:1.0.0',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OpenFileDialogComponent, MatDialogModule, MatButtonModule],
      providers: [
        {provide: DIALOG_DATA, useValue: mockData},
        MockProvider(TranslocoService, {
          langChanges$: new BehaviorSubject('en'),
          events$: new Subject(),
          translate: vi.fn((key: string) => key),
          selectTranslate: vi.fn(() => of('')),
          _loadDependencies: vi.fn(() => of(undefined)),
          config: {reRenderOnLangChange: false} as any,
        } as Partial<TranslocoService>),
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OpenFileDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and receive dialog data', () => {
    expect(component).toBeTruthy();
    expect(component.fileData).toEqual(mockData);
  });
});
