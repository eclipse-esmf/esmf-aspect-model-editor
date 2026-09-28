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

import {TestBed} from '@angular/core/testing';
import {describe, expect, it, beforeEach} from 'vitest';
import {UiShellStore} from './ui-shell.store';

describe('UiShellStore', () => {
  let store: InstanceType<typeof UiShellStore>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [UiShellStore],
    });
    store = TestBed.inject(UiShellStore);
  });

  it('should initialize with default states', () => {
    expect(store.sidebarOpen()).toBe(false);
    expect(store.activeSidebarTab()).toBeNull();
    expect(store.toolbarVisible()).toBe(true);
    expect(store.minimapVisible()).toBe(true);
    expect(store.isSidebarExpanded()).toBe(false);
  });

  it('should open and close sidebar with tabs', () => {
    store.openSidebar('workspace');
    expect(store.sidebarOpen()).toBe(true);
    expect(store.activeSidebarTab()).toBe('workspace');
    expect(store.isWorkspaceOpen()).toBe(true);

    store.closeSidebar();
    expect(store.sidebarOpen()).toBe(false);
    expect(store.activeSidebarTab()).toBeNull();
    expect(store.isWorkspaceOpen()).toBe(false);
  });

  it('should toggle sidebar tabs', () => {
    store.toggleSidebar('sammElements');
    expect(store.isSammElementsOpen()).toBe(true);

    // Toggling the same tab closes it
    store.toggleSidebar('sammElements');
    expect(store.sidebarOpen()).toBe(false);

    // Opening another tab switches to it
    store.toggleSidebar('fileElements');
    expect(store.isFileElementsOpen()).toBe(true);
  });

  it('should toggle toolbar and minimap visibility', () => {
    store.toggleToolbar();
    expect(store.toolbarVisible()).toBe(false);

    store.toggleToolbar();
    expect(store.toolbarVisible()).toBe(true);

    store.toggleMinimap();
    expect(store.minimapVisible()).toBe(false);

    store.toggleMinimap();
    expect(store.minimapVisible()).toBe(true);
  });
});
