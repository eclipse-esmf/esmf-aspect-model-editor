/*
 * Copyright (c) 2024 Robert Bosch Manufacturing Solutions GmbH
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

import {EditorService} from '@ame/editor';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MatButtonModule} from '@angular/material/button';
import {MatDialogModule} from '@angular/material/dialog';
import {MatIconModule} from '@angular/material/icon';
import {RouterTestingModule} from '@angular/router/testing';
import {provideMockObject} from 'jest-helpers';
import {of} from 'rxjs';
import {MigratorService} from '@ame/migrator';
import {ElectronTunnelService} from '@ame/shared';

import {MigrationStatusComponent} from './migration-status.component';
import {TranslateModule} from '@ngx-translate/core';
import {LanguageTranslateModule, LanguageTranslationService} from '@ame/translation';

describe('MigrationStatusComponent', () => {
  let component: MigrationStatusComponent;
  let fixture: ComponentFixture<MigrationStatusComponent>;
  let editorService: EditorService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule, MatDialogModule, MatIconModule, MatButtonModule, TranslateModule.forRoot(), LanguageTranslateModule],
      declarations: [MigrationStatusComponent],
      providers: [
        {
          provide: MigratorService,
          useValue: provideMockObject(MigratorService),
        },
        {
          provide: ElectronTunnelService,
          useValue: provideMockObject(ElectronTunnelService),
        },
        {
          provide: EditorService,
          useValue: {
            settings: {},
          },
        },
        {
          provide: LanguageTranslationService,
          useValue: provideMockObject(LanguageTranslationService),
        },
      ],
    });

    editorService = TestBed.inject(EditorService);
    editorService.loadExternalModels = jest.fn(() => of([]));
    history.pushState({data: null}, '');

    fixture = TestBed.createComponent(MigrationStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
