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
import {MatRipple} from '@angular/material/core';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {BarItemComponent} from './bar-item.component';

describe('BarItemComponent', () => {
  let component: BarItemComponent;
  let fixture: ComponentFixture<BarItemComponent>;
  let rippleLaunchSpy: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BarItemComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BarItemComponent);
    component = fixture.componentInstance;
    const ripple = fixture.debugElement.injector.get(MatRipple);
    rippleLaunchSpy = vi.spyOn(ripple, 'launch').mockImplementation(() => ({}) as any);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not have disabled class by default', () => {
    expect(fixture.nativeElement.classList.contains('disabled')).toBe(false);
  });

  it('should reflect disabled input in host class', () => {
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    expect(fixture.nativeElement.classList.contains('disabled')).toBe(true);
  });

  it('onmousedown should launch ripple with event coordinates', () => {
    const mouseEvent = {x: 100, y: 200} as MouseEvent;
    component.onmousedown(mouseEvent);
    expect(rippleLaunchSpy).toHaveBeenCalledWith(100, 200);
  });
});
