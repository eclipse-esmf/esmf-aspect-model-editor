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

import {StructuredValuePropertyFieldComponent} from './structured-value-property-field.component';

describe('StructuredValuePropertyFieldComponent', () => {
  let component: StructuredValuePropertyFieldComponent;
  let fixture: ComponentFixture<StructuredValuePropertyFieldComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [StructuredValuePropertyFieldComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StructuredValuePropertyFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
