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
import {RouterTestingModule} from '@angular/router/testing';

import {MigratorComponent} from './migrator.component';

describe('MigratorComponent', () => {
  let component: MigratorComponent;
  let fixture: ComponentFixture<MigratorComponent>;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      declarations: [MigratorComponent],
      imports: [RouterTestingModule],
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MigratorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
