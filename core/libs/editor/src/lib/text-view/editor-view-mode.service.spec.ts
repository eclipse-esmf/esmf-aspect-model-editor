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

import {SearchStore, TabsStore, UiShellStore} from '@ame/domain';
import {signal} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {ShapeSettingsStateService} from '../editor-dialog/services/shape-settings-state.service';
import {EditorViewModeService} from './editor-view-mode.service';

describe('EditorViewModeService', () => {
  let service: EditorViewModeService;
  let activeTabId: ReturnType<typeof signal<string | null>>;
  let shapeSettingsState: {closeShapeSettings: ReturnType<typeof vi.fn>; setSelectedShapeForUpdate: ReturnType<typeof vi.fn>};
  let searchStore: {closeElementsSearch: ReturnType<typeof vi.fn>};
  let uiShellStore: {closeSidebar: ReturnType<typeof vi.fn>};

  beforeEach(() => {
    activeTabId = signal<string | null>('tab-1');
    shapeSettingsState = {closeShapeSettings: vi.fn(), setSelectedShapeForUpdate: vi.fn()};
    searchStore = {closeElementsSearch: vi.fn()};
    uiShellStore = {closeSidebar: vi.fn()};

    TestBed.configureTestingModule({
      providers: [
        EditorViewModeService,
        {provide: TabsStore, useValue: {activeTabId}},
        {provide: ShapeSettingsStateService, useValue: shapeSettingsState},
        {provide: SearchStore, useValue: searchStore},
        {provide: UiShellStore, useValue: uiShellStore},
      ],
    });
    service = TestBed.inject(EditorViewModeService);
  });

  it('starts in the graph view', () => {
    expect(service.mode()).toBe('graph');
    expect(service.isTextView()).toBe(false);
  });

  it('switches to the text view and closes graph-only overlays and the sidebar', () => {
    service.setMode('text');

    expect(service.isTextView()).toBe(true);
    expect(shapeSettingsState.closeShapeSettings).toHaveBeenCalled();
    expect(shapeSettingsState.setSelectedShapeForUpdate).toHaveBeenCalledWith(null);
    expect(searchStore.closeElementsSearch).toHaveBeenCalled();
    expect(uiShellStore.closeSidebar).toHaveBeenCalled();
  });

  it('toggles between both views', () => {
    service.toggle();
    expect(service.mode()).toBe('text');
    service.toggle();
    expect(service.mode()).toBe('graph');
  });

  it('remembers the view per tab', () => {
    service.setMode('text');

    activeTabId.set('tab-2');
    expect(service.mode()).toBe('graph');

    activeTabId.set('tab-1');
    expect(service.mode()).toBe('text');
  });

  it('does nothing when the requested view is already active', () => {
    service.setMode('graph');
    expect(shapeSettingsState.closeShapeSettings).not.toHaveBeenCalled();
    expect(uiShellStore.closeSidebar).not.toHaveBeenCalled();
  });

  it('switches to the text view when an element should be revealed', () => {
    service.revealElement('urn:samm:org.example:1.0.0#A');

    expect(service.isTextView()).toBe(true);
    const request = service.revealRequest();
    expect(request.urn).toBe('urn:samm:org.example:1.0.0#A');

    service.clearRevealRequest(request.id + 1);
    expect(service.revealRequest()).toBe(request);

    service.clearRevealRequest(request.id);
    expect(service.revealRequest()).toBeNull();
  });

  it('ignores empty reveal requests', () => {
    service.revealElement('');
    expect(service.revealRequest()).toBeNull();
    expect(service.isTextView()).toBe(false);
  });

  it('counts search requests', () => {
    const initial = service.searchRequest();
    service.requestSearch();
    expect(service.searchRequest()).toBe(initial + 1);
  });
});
