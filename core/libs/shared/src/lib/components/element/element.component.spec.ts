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
import {beforeEach, describe, expect, it} from 'vitest';
import {ElementIconComponent} from './element.component';

describe('ElementIconComponent', () => {
  let component: ElementIconComponent;
  let fixture: ComponentFixture<ElementIconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ElementIconComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ElementIconComponent);
    component = fixture.componentInstance;
  });

  it('should create and render aspect icon', () => {
    fixture.componentRef.setInput('type', {type: 'aspect', symbol: 'A'});
    fixture.componentRef.setInput('name', 'MyAspect');
    fixture.componentRef.setInput('description', 'An aspect model');
    fixture.detectChanges();

    expect(component).toBeTruthy();
    expect(component.className()).toBe('aspect ame-large');

    const iconElement = fixture.nativeElement.querySelector('.element-icon');
    expect(iconElement.textContent.trim()).toBe('A');

    const nameElement = fixture.nativeElement.querySelector('.element-name');
    expect(nameElement.textContent.trim()).toBe('MyAspect');

    const descElement = fixture.nativeElement.querySelector('.element-description');
    expect(descElement.textContent.trim()).toBe('An aspect model');
  });

  it('should set className with custom size', () => {
    fixture.componentRef.setInput('type', {type: 'characteristic', symbol: 'C'});
    fixture.componentRef.setInput('size', 'small');
    fixture.detectChanges();

    expect(component.className()).toBe('characteristic ame-small');
  });

  it('should handle isNewValue properly', () => {
    fixture.componentRef.setInput('type', {type: 'entity', symbol: 'E'});
    fixture.componentRef.setInput('isNewValue', true);
    fixture.detectChanges();

    expect(fixture.nativeElement.classList.contains('new-value')).toBe(true);
    const newIcon = fixture.nativeElement.querySelector('.new-element');
    expect(newIcon).toBeTruthy();
  });

  it('should handle text type', () => {
    fixture.componentRef.setInput('type', {type: 'text', symbol: 'T'});
    fixture.detectChanges();

    expect(component.className()).toBe('text ame-large');
  });
});
