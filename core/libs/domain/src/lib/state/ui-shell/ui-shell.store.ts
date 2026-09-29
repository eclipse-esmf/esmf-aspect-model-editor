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

import {computed} from '@angular/core';
import {patchState, signalStore, withComputed, withMethods, withState} from '@ngrx/signals';

export type EditorTheme = 'light' | 'dark';

export type SidebarTab = 'sammElements' | 'workspace' | 'fileElements' | null;

export interface UiShellState {
  sidebarOpen: boolean;
  activeSidebarTab: SidebarTab;
  toolbarVisible: boolean;
  minimapVisible: boolean;
  navigationVisible: boolean;
  theme: EditorTheme;
  activeDialog: string | null;
}

const initialState: UiShellState = {
  sidebarOpen: false,
  activeSidebarTab: null,
  toolbarVisible: true,
  minimapVisible: true,
  navigationVisible: true,
  theme: 'light',
  activeDialog: null,
};

export const UiShellStore = signalStore(
  {providedIn: 'root'},
  withState(initialState),
  withComputed(store => ({
    darkMode: computed(() => store.theme() === 'dark'),
    isSidebarExpanded: computed(() => store.sidebarOpen() && store.activeSidebarTab() !== null),
    isSammElementsOpen: computed(() => store.sidebarOpen() && store.activeSidebarTab() === 'sammElements'),
    isWorkspaceOpen: computed(() => store.sidebarOpen() && store.activeSidebarTab() === 'workspace'),
    isFileElementsOpen: computed(() => store.sidebarOpen() && store.activeSidebarTab() === 'fileElements'),
  })),
  withMethods(store => ({
    openSidebar(tab: SidebarTab) {
      patchState(store, {sidebarOpen: true, activeSidebarTab: tab});
    },
    closeSidebar() {
      patchState(store, {sidebarOpen: false, activeSidebarTab: null});
    },
    toggleSidebar(tab: SidebarTab) {
      if (store.sidebarOpen() && store.activeSidebarTab() === tab) {
        patchState(store, {sidebarOpen: false, activeSidebarTab: null});
      } else {
        patchState(store, {sidebarOpen: true, activeSidebarTab: tab});
      }
    },
    setToolbarVisibility(visible: boolean) {
      patchState(store, {toolbarVisible: visible});
    },
    toggleToolbar() {
      patchState(store, {toolbarVisible: !store.toolbarVisible()});
    },
    setMinimapVisibility(visible: boolean) {
      patchState(store, {minimapVisible: visible});
    },
    toggleMinimap() {
      patchState(store, {minimapVisible: !store.minimapVisible()});
    },
    setTheme(theme: EditorTheme) {
      patchState(store, {theme});
    },
    setDarkMode(darkMode: boolean) {
      patchState(store, {theme: darkMode ? 'dark' : 'light'});
    },
    openDialog(dialogName: string) {
      patchState(store, {activeDialog: dialogName});
    },
    closeDialog() {
      patchState(store, {activeDialog: null});
    },
  })),
);
