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
import {TestBed} from '@angular/core/testing';
import {beforeEach, describe, expect, it} from 'vitest';
import {FileStatus, Selection, SidebarStateService} from './sidebar-state.service';

describe('SidebarStateService and models', () => {
  describe('FileStatus', () => {
    it('should initialize with default values', () => {
      const status = new FileStatus('test-file.ttl');
      expect(status.name).toBe('test-file.ttl');
      expect(status.loaded).toBe(false);
      expect(status.outdated).toBe(false);
      expect(status.errored).toBe(false);
      expect(status.isLoadedInWorkspace).toBe(false);
      expect(status.sammVersion).toBe('');
      expect(status.dependencies).toEqual([]);
      expect(status.missingDependencies).toEqual([]);
      expect(status.aspectModelUrn).toBe('');
    });
  });

  describe('Selection', () => {
    it('should initialize with null values if not provided', () => {
      const selection = new Selection();
      expect(selection.namespace).toBeNull();
      expect(selection.file).toBeNull();
      expect(selection.selection()).toBeNull();
    });

    it('should initialize with constructor arguments', () => {
      const selection = new Selection('org.eclipse.esmf:1.0.0', 'Aspect.ttl');
      expect(selection.namespace).toBe('org.eclipse.esmf:1.0.0');
      expect(selection.file).toBe('Aspect.ttl');
    });

    it('should update state on select', () => {
      const selection = new Selection();
      const file = new FileStatus('Aspect.ttl');
      file.aspectModelUrn = 'urn:samm:org.eclipse.esmf:1.0.0#Aspect';

      selection.select('org.eclipse.esmf:1.0.0', file);

      expect(selection.namespace).toBe('org.eclipse.esmf:1.0.0');
      expect(selection.file).toBe('Aspect.ttl');
      expect(selection.selection()).toEqual({
        namespace: 'org.eclipse.esmf:1.0.0',
        file: 'Aspect.ttl',
        aspectModelUrn: 'urn:samm:org.eclipse.esmf:1.0.0#Aspect',
      });
    });

    it('should reset selection', () => {
      const selection = new Selection('org.eclipse.esmf:1.0.0', 'Aspect.ttl');
      selection.reset();
      expect(selection.namespace).toBeNull();
      expect(selection.file).toBeNull();
      expect(selection.selection()).toBeNull();
    });

    it('should correctly determine isSelected', () => {
      const selection = new Selection('org.eclipse.esmf:1.0.0', 'Aspect.ttl');
      expect(selection.isSelected('org.eclipse.esmf:1.0.0', 'Aspect.ttl')).toBe(true);
      expect(selection.isSelected('org.eclipse.esmf:1.0.0', 'Other.ttl')).toBe(false);
      expect(selection.isSelected('other.ns:1.0.0', 'Aspect.ttl')).toBe(false);
      expect(selection.isSelected(undefined, undefined)).toBe(false);
    });
  });

  describe('SidebarStateService', () => {
    let service: SidebarStateService;
    let mockLoadedFilesService: {
      currentLoadedFile: {namespace: string; name: string} | null;
    };

    beforeEach(() => {
      mockLoadedFilesService = {
        currentLoadedFile: null,
      };

      TestBed.configureTestingModule({
        providers: [SidebarStateService, {provide: LoadedFilesService, useValue: mockLoadedFilesService}],
      });

      service = TestBed.inject(SidebarStateService);
    });

    it('should create and have default states', () => {
      expect(service).toBeTruthy();
      expect(service.sammElements.isOpened()).toBe(false);
      expect(service.workspace.isOpened()).toBe(false);
      expect(service.fileElements.isOpened()).toBe(false);
    });

    it('should open, close, and toggle sidebar states', () => {
      service.sammElements.open();
      expect(service.sammElements.isOpened()).toBe(true);

      service.sammElements.close();
      expect(service.sammElements.isOpened()).toBe(false);

      service.sammElements.toggle();
      expect(service.sammElements.isOpened()).toBe(true);
    });

    it('should increment refresh tick on workspace refresh', () => {
      expect(service.workspace.refreshTick()).toBe(0);
      service.workspace.refresh();
      expect(service.workspace.refreshTick()).toBe(1);
    });

    it('should manage NamespacesManager files', () => {
      const file1 = new FileStatus('File1.ttl');
      service.namespacesState.setFile('ns1', file1);

      expect(service.namespacesState.getFile('ns1', 'File1.ttl')).toBe(file1);
      expect(service.namespacesState.getFile('ns1', 'NonExistent.ttl')).toBeUndefined();
      expect(service.namespacesState.namespacesKeys()).toContain('ns1');

      service.namespacesState.clear();
      expect(service.namespacesState.namespaces()).toEqual({});
    });

    it('should check isCurrentFileLoaded and isCurrentFile', () => {
      expect(service.isCurrentFileLoaded()).toBe(false);
      expect(service.isCurrentFile('ns1', 'File1.ttl')).toBe(false);

      mockLoadedFilesService.currentLoadedFile = {namespace: 'ns1', name: 'File1.ttl'};
      expect(service.isCurrentFileLoaded()).toBe(true);
      expect(service.isCurrentFile('ns1', 'File1.ttl')).toBe(true);
      expect(service.isCurrentFile('ns2', 'File1.ttl')).toBe(false);
      expect(service.isCurrentFile('ns1', 'File2.ttl')).toBe(false);
    });

    it('should update workspace files and identify outdated models', () => {
      const file1 = new FileStatus('Model1.ttl');
      file1.aspectModelUrn = 'urn:samm:org.eclipse.esmf:1.0.0#Model1';
      file1.outdated = false;

      const file2 = new FileStatus('Model2.ttl');
      file2.aspectModelUrn = 'urn:samm:org.eclipse.esmf:1.0.0#Model2';
      file2.outdated = true;

      const result = service.updateWorkspace([file1, file2]);

      expect(file1.isLoadedInWorkspace).toBe(true);
      expect(file2.isLoadedInWorkspace).toBe(true);
      expect(result['org.eclipse.esmf:1.0.0']).toHaveLength(2);
      expect(service.namespacesState.hasOutdatedFiles()).toBe(true);

      // Subsequent update with empty list should retain hasOutdatedFiles = true
      service.updateWorkspace([]);
      expect(service.namespacesState.hasOutdatedFiles()).toBe(true);
    });

    it('should close workspace and fileElements when sammElements opens', () => {
      service.workspace.open();
      service.fileElements.open();
      TestBed.flushEffects();

      service.sammElements.open();
      TestBed.flushEffects();

      expect(service.workspace.isOpened()).toBe(false);
      expect(service.fileElements.isOpened()).toBe(false);
    });

    it('should close sammElements when workspace opens', () => {
      service.sammElements.open();
      TestBed.flushEffects();

      service.workspace.open();
      TestBed.flushEffects();

      expect(service.sammElements.isOpened()).toBe(false);
    });

    it('should reset selection when fileElements closes', () => {
      const file = new FileStatus('Aspect.ttl');
      service.selection.select('ns1', file);
      service.fileElements.open();
      TestBed.flushEffects();

      service.fileElements.close();
      TestBed.flushEffects();

      expect(service.selection.selection()).toBeNull();
    });

    it('should open fileElements when selection is made within opened workspace', () => {
      service.workspace.open();
      TestBed.flushEffects();

      const file = new FileStatus('Aspect.ttl');
      file.aspectModelUrn = 'urn:samm:ns:1.0.0#Aspect';
      service.selection.select('ns:1.0.0', file);
      TestBed.flushEffects();

      expect(service.fileElements.isOpened()).toBe(true);
    });
  });
});
