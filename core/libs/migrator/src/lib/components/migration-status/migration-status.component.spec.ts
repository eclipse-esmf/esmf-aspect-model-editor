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
import {MigratorService} from '@ame/migrator';
import {ElectronTunnelService} from '@ame/shared';
import {LanguageTranslateModule, LanguageTranslationService} from '@ame/translation';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {provideRouter} from '@angular/router';
import {TranslateModule} from '@ngx-translate/core';
import {MockModule, MockProvider} from 'ng-mocks';
import {MigrationStatusComponent} from './migration-status.component';

describe('MigrationStatusComponent', () => {
  let component: MigrationStatusComponent;
  let fixture: ComponentFixture<MigrationStatusComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [MigrationStatusComponent, MockModule(TranslateModule), MockModule(LanguageTranslateModule)],
      providers: [
        provideRouter([]),
        MockProvider(MigratorService),
        MockProvider(ElectronTunnelService),
        MockProvider(EditorService, {settings: {}} as any),
        MockProvider(LanguageTranslationService),
      ],
    });

    history.pushState({data: null}, '');

    fixture = TestBed.createComponent(MigrationStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
