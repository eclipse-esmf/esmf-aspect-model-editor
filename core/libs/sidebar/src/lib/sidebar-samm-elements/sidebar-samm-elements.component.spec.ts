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

import {LoadedFilesService} from '@ame/cache';
import {EditorService} from '@ame/editor';
import {MaxGraphService} from '@ame/max-graph';
import {signal} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {TranslocoTestingModule} from '@jsverse/transloco';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {SidebarStateService} from '../sidebar-state.service';
import {SidebarSAMMElementsComponent} from './sidebar-samm-elements.component';

describe('SidebarSAMMElementsComponent', () => {
  let component: SidebarSAMMElementsComponent;
  let fixture: ComponentFixture<SidebarSAMMElementsComponent>;
  let maxgraphServiceMock: {
    getAllCells: ReturnType<typeof vi.fn>;
  };
  let hasAspectSignal = signal(false);
  let sidebarService: SidebarStateService;

  beforeEach(() => {
    hasAspectSignal = signal(false);
    maxgraphServiceMock = {
      getAllCells: vi.fn(() => []),
    };

    TestBed.configureTestingModule({
      imports: [
        SidebarSAMMElementsComponent,
        TranslocoTestingModule.forRoot({langs: {en: {}}, translocoConfig: {availableLangs: ['en'], defaultLang: 'en'}}),
      ],
      providers: [
        SidebarStateService,
        {provide: MaxGraphService, useValue: maxgraphServiceMock},
        {provide: LoadedFilesService, useValue: {hasAspect: hasAspectSignal}},
        {provide: EditorService, useValue: {makeDraggable: vi.fn()}},
      ],
    });

    sidebarService = TestBed.inject(SidebarStateService);
    fixture = TestBed.createComponent(SidebarSAMMElementsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should include aspect in available elements when model does not have an aspect', () => {
    hasAspectSignal.set(false);
    fixture.detectChanges();

    const elements = (component as any).availableElements();
    expect(elements).toContain('aspect');
    expect(elements).not.toContain('entityInstance');
  });

  it('should exclude aspect from available elements when model already has an aspect', () => {
    hasAspectSignal.set(true);
    fixture.detectChanges();

    const elements = (component as any).availableElements();
    expect(elements).not.toContain('aspect');
    expect(elements).not.toContain('entityInstance');
  });

  it('should correctly report isEmptyModel based on maxgraph cells', () => {
    maxgraphServiceMock.getAllCells.mockReturnValue([]);
    expect(component.isEmptyModel).toBe(true);

    maxgraphServiceMock.getAllCells.mockReturnValue([{id: '1'}] as any);
    expect(component.isEmptyModel).toBe(false);

    maxgraphServiceMock.getAllCells.mockReturnValue(null as any);
    expect(component.isEmptyModel).toBe(true);
  });

  it('should close sammElements sidebar', () => {
    sidebarService.sammElements.open();
    expect(sidebarService.sammElements.isOpened()).toBe(true);

    sidebarService.sammElements.close();
    expect(sidebarService.sammElements.isOpened()).toBe(false);
  });
});
