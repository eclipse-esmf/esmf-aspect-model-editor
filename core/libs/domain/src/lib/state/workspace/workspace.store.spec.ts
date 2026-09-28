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
import {WorkspaceStore} from './workspace.store';

describe('WorkspaceStore', () => {
  let store: InstanceType<typeof WorkspaceStore>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [WorkspaceStore],
    });
    store = TestBed.inject(WorkspaceStore);
  });

  it('should initialize empty', () => {
    expect(store.entities().length).toBe(0);
    expect(store.namespaceKeys().length).toBe(0);
    expect(store.hasOutdatedFiles()).toBe(false);
    expect(store.selectedFile()).toBeNull();
  });

  it('should set files and group by namespace', () => {
    store.setFiles([
      {
        id: 'ns1:ModelA.ttl',
        name: 'ModelA.ttl',
        namespace: 'ns1',
        aspectModelUrn: 'urn:ns1#ModelA',
        loaded: true,
        outdated: false,
        errored: false,
        isLoadedInWorkspace: true,
      },
      {
        id: 'ns1:ModelB.ttl',
        name: 'ModelB.ttl',
        namespace: 'ns1',
        aspectModelUrn: 'urn:ns1#ModelB',
        loaded: false,
        outdated: true,
        errored: false,
        isLoadedInWorkspace: true,
      },
      {
        id: 'ns2:ModelC.ttl',
        name: 'ModelC.ttl',
        namespace: 'ns2',
        aspectModelUrn: 'urn:ns2#ModelC',
        loaded: false,
        outdated: false,
        errored: true,
        isLoadedInWorkspace: true,
      },
    ]);

    expect(store.entities().length).toBe(3);
    expect(store.namespaceKeys()).toEqual(['ns1', 'ns2']);
    expect(store.namespaces()['ns1'].length).toBe(2);
    expect(store.namespaces()['ns2'].length).toBe(1);
    expect(store.hasOutdatedFiles()).toBe(true);
    expect(store.hasErroredFiles()).toBe(true);
  });

  it('should select file and trigger refresh', () => {
    store.selectFile({
      namespace: 'ns1',
      file: 'ModelA.ttl',
      aspectModelUrn: 'urn:ns1#ModelA',
    });

    expect(store.selectedFile()?.file).toBe('ModelA.ttl');

    const tickBefore = store.refreshTick();
    store.triggerRefresh();
    expect(store.refreshTick()).toBe(tickBefore + 1);
  });

  it('should support rxMethod loadFiles with request status', () => {
    expect(store.isIdle()).toBe(true);
    store.loadFiles([
      {
        id: 'ns1:ModelA.ttl',
        name: 'ModelA.ttl',
        namespace: 'ns1',
        aspectModelUrn: 'urn:ns1#ModelA',
        loaded: true,
        outdated: false,
        errored: false,
        isLoadedInWorkspace: true,
      },
    ]);
    expect(store.isSuccess()).toBe(true);
    expect(store.entities().length).toBe(1);
  });
});
