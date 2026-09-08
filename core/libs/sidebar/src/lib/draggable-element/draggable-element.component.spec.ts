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

import {EditorService} from '@ame/editor';
import {basicShapeGeometry, circleShapeGeometry} from '@ame/shared';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {DraggableElementComponent} from './draggable-element.component';

describe('DraggableElementComponent', () => {
  let component: DraggableElementComponent;
  let fixture: ComponentFixture<DraggableElementComponent>;
  let editorServiceMock: {
    makeDraggable: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    editorServiceMock = {
      makeDraggable: vi.fn(),
    };

    TestBed.configureTestingModule({
      imports: [DraggableElementComponent],
      providers: [{provide: EditorService, useValue: editorServiceMock}],
    });

    fixture = TestBed.createComponent(DraggableElementComponent);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should set dataset attributes and register draggable for standard element', () => {
    fixture.componentRef.setInput('type', 'aspect');
    fixture.componentRef.setInput('urn', 'urn:samm:org.eclipse.esmf:1.0.0#Aspect');
    fixture.detectChanges();

    expect(fixture.nativeElement.dataset.type).toBe('aspect');
    expect(fixture.nativeElement.dataset.urn).toBe('urn:samm:org.eclipse.esmf:1.0.0#Aspect');
    expect(editorServiceMock.makeDraggable).toHaveBeenCalledTimes(1);

    const [nativeEl, shadowEl] = editorServiceMock.makeDraggable.mock.calls[0];
    expect(nativeEl).toBe(fixture.nativeElement);
    expect(shadowEl.classList.contains('aspect')).toBe(true);
    expect(shadowEl.style.height).toBe(basicShapeGeometry.expandedHeight + 'px');
    expect(shadowEl.style.width).toBe(basicShapeGeometry.expandedWith + 'px');
    expect(shadowEl.style.borderRadius).toBe('');
  });

  it('should create rounded shadow element for trait type', () => {
    fixture.componentRef.setInput('type', 'trait');
    fixture.componentRef.setInput('urn', 'urn:samm:org.eclipse.esmf:1.0.0#Trait');
    fixture.detectChanges();

    expect(fixture.nativeElement.dataset.type).toBe('trait');
    expect(editorServiceMock.makeDraggable).toHaveBeenCalledTimes(1);

    const [, shadowEl] = editorServiceMock.makeDraggable.mock.calls[0];
    expect(shadowEl.classList.contains('trait')).toBe(true);
    expect(shadowEl.style.height).toBe(circleShapeGeometry.expandedHeight + 'px');
    expect(shadowEl.style.width).toBe(circleShapeGeometry.expandedWith + 'px');
    expect(shadowEl.style.borderRadius).toBe('50%');
  });

  it('should not register draggable when readonly is true', () => {
    fixture.componentRef.setInput('type', 'characteristic');
    fixture.componentRef.setInput('urn', 'urn:samm:org.eclipse.esmf:1.0.0#AnonChar');
    fixture.componentRef.setInput('readonly', true);
    fixture.detectChanges();

    expect(editorServiceMock.makeDraggable).not.toHaveBeenCalled();
  });
});
