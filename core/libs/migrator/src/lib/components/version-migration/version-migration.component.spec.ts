/*
 * Copyright (c) 2022 Robert Bosch Manufacturing Solutions GmbH
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

import {VersionMigrationComponent} from './version-migration.component';

describe('VersionMigrationComponent', () => {
  let component: VersionMigrationComponent;
  let fixture: ComponentFixture<VersionMigrationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [VersionMigrationComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VersionMigrationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
