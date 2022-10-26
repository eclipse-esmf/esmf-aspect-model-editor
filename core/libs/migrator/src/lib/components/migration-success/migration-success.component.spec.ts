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
import {MatButtonModule} from '@angular/material/button';
import {MatDialogModule} from '@angular/material/dialog';
import {MatIconModule} from '@angular/material/icon';
import {MigratorService} from '../../migrator.service';

import {MigrationSuccessComponent} from './migration-success.component';

describe('MigrationSuccessComponent', () => {
  let component: MigrationSuccessComponent;
  let fixture: ComponentFixture<MigrationSuccessComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [MatDialogModule, MatButtonModule, MatIconModule],
      declarations: [MigrationSuccessComponent],
      providers: [
        {
          provide: MigratorService,
          useValue: {
            dialogRef: {},
          },
        },
      ],
    });

    fixture = TestBed.createComponent(MigrationSuccessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
