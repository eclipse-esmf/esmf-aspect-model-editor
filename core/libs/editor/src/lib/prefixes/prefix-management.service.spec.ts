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

import {LoadedFilesService, ModelService} from '@ame/domain';
import {signal} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {MatDialog} from '@angular/material/dialog';
import {RdfModel} from '@esmf/aspect-model-loader';
import {DataFactory, Store} from 'n3';
import {firstValueFrom, of, throwError} from 'rxjs';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {ModelHistoryService} from '../history/model-history.service';
import {ModelSavingTrackerService} from '../model-saving-tracker.service';
import {TabStateService} from '../tabs/tab-state.service';
import {namespaceOf, PrefixManagementService} from './prefix-management.service';

const BATTERY = 'https://example.org/battery#';

describe('PrefixManagementService', () => {
  let service: PrefixManagementService;
  let rdfModel: RdfModel;
  let externalModel: RdfModel;
  let dialogResult: string | boolean | undefined;
  let matDialog: {open: ReturnType<typeof vi.fn>};
  let dialogInstance: {hasChanges: boolean} | null;
  let modelService: {synchronizeModelToRdf: ReturnType<typeof vi.fn>};
  let history: {reset: ReturnType<typeof vi.fn>};
  let tabState: {setTabDirty: ReturnType<typeof vi.fn>; activeTabId: ReturnType<typeof signal<string>>};

  beforeEach(() => {
    rdfModel = new RdfModel(new Store(), '2.2.0', 'urn:samm:org.example:1.0.0');
    externalModel = new RdfModel(new Store(), '2.2.0', 'urn:samm:org.other:1.0.0');
    externalModel.addPrefix('bp', BATTERY);
    externalModel.store.addQuad(
      DataFactory.namedNode(`${BATTERY}Cell`),
      externalModel.samm.PreferredNameProperty(),
      DataFactory.literal('Cell', 'en'),
    );
    dialogResult = undefined;
    dialogInstance = null;
    matDialog = {open: vi.fn(() => ({afterClosed: () => of(dialogResult), componentInstance: dialogInstance}))};
    modelService = {synchronizeModelToRdf: vi.fn(() => of(undefined))};
    tabState = {setTabDirty: vi.fn(), activeTabId: signal('tab-1')};
    history = {reset: vi.fn()};

    TestBed.configureTestingModule({
      providers: [
        {provide: MatDialog, useValue: matDialog},
        {provide: LoadedFilesService, useValue: {currentLoadedFile: {rdfModel}, externalFiles: [{rdfModel: externalModel}]}},
        {provide: ModelSavingTrackerService, useValue: {isSaved$: of(false)}},
        {provide: TabStateService, useValue: tabState},
        {provide: ModelService, useValue: modelService},
        {provide: ModelHistoryService, useValue: history},
      ],
    });
    service = TestBed.inject(PrefixManagementService);
  });

  it('should resolve the namespace of an IRI', () => {
    expect(namespaceOf('urn:samm:org.example:1.0.0#Aspect')).toBe('urn:samm:org.example:1.0.0#');
    expect(namespaceOf('https://example.org/battery/Cell')).toBe('https://example.org/battery/');
  });

  it('should reuse an existing prefix without asking', async () => {
    rdfModel.definePrefix('battery', BATTERY);

    expect(await firstValueFrom(service.ensurePrefixForReference(`${BATTERY}Cell`))).toBe('battery');
    expect(matDialog.open).not.toHaveBeenCalled();
  });

  it('should not ask for elements of the own namespace', async () => {
    expect(await firstValueFrom(service.ensurePrefixForReference('urn:samm:org.example:1.0.0#Local'))).toBe('');
    expect(matDialog.open).not.toHaveBeenCalled();
  });

  it('should ask for the prefix of a new namespace and suggest the alias of the referenced file', async () => {
    dialogResult = 'bat';
    const changed = vi.fn();
    service.prefixesChanged$.subscribe(changed);

    expect(await firstValueFrom(service.ensurePrefixForReference(`${BATTERY}Cell`))).toBe('bat');

    const data = matDialog.open.mock.calls[0][1].data;
    expect(data).toEqual(expect.objectContaining({namespace: BATTERY, suggestion: 'bp', sourceAlias: 'bp', elementName: 'Cell'}));
    expect(rdfModel.getPrefixes()['bat']).toBe(BATTERY);
    expect(rdfModel.serializationMetadata.isExplicitPrefix('bat')).toBe(true);
    expect(tabState.setTabDirty).toHaveBeenCalledWith('tab-1', true);
    expect(changed).toHaveBeenCalled();
  });

  it('should leave the prefix to the automatic handling when the user skips the dialog', async () => {
    expect(await firstValueFrom(service.ensurePrefixForReference(`${BATTERY}Cell`))).toBeNull();
    expect(rdfModel.getAliasByNamespace(BATTERY)).toBeUndefined();
  });

  it('should rename a prefix which was created automatically while the dialog was open', () => {
    rdfModel.addPrefix('', BATTERY);
    expect(rdfModel.getAliasByNamespace(BATTERY)).toBe('ext-battery');

    expect(service.applyReferencePrefix(rdfModel, 'battery', BATTERY)).toBeNull();
    expect(rdfModel.getAliasByNamespace(BATTERY)).toBe('battery');
    expect(rdfModel.getPrefixes()['ext-battery']).toBeUndefined();
  });

  it('should open the prefix management and inform about changes', () => {
    dialogResult = true;
    const changed = vi.fn();
    service.prefixesChanged$.subscribe(changed);

    service.openManagement();

    expect(matDialog.open.mock.calls[0][1].data).toEqual({rdfModel});
    expect(changed).toHaveBeenCalled();
    // undo would revert the prefixes together with an earlier version of the model
    expect(history.reset).toHaveBeenCalled();
  });

  it('should keep the undo history when the prefix management is closed without changes', () => {
    dialogResult = false;
    service.openManagement();
    expect(history.reset).not.toHaveBeenCalled();
  });

  it('should keep the undo history when a prefix is added for a reference', async () => {
    dialogResult = 'bat';
    await firstValueFrom(service.ensurePrefixForReference(`${BATTERY}Cell`));
    expect(history.reset).not.toHaveBeenCalled();
  });

  it('should synchronize the graph before the usage of the prefixes is shown', () => {
    service.openManagement();

    expect(modelService.synchronizeModelToRdf).toHaveBeenCalled();
    expect(modelService.synchronizeModelToRdf.mock.invocationCallOrder[0]).toBeLessThan(matDialog.open.mock.invocationCallOrder[0]);
  });

  it('should still open the prefix management when the synchronization fails', () => {
    modelService.synchronizeModelToRdf.mockReturnValue(throwError(() => new Error('sync failed')));

    service.openManagement();

    expect(matDialog.open).toHaveBeenCalled();
  });

  it('should inform about changes when the dialog is closed with escape or the backdrop', () => {
    dialogResult = undefined;
    dialogInstance = {hasChanges: true};
    const changed = vi.fn();
    service.prefixesChanged$.subscribe(changed);

    service.openManagement();

    expect(changed).toHaveBeenCalled();
    expect(tabState.setTabDirty).toHaveBeenCalledWith('tab-1', true);
  });

  it('should not inform when the dialog is closed without changes', () => {
    dialogInstance = {hasChanges: false};
    const changed = vi.fn();
    service.prefixesChanged$.subscribe(changed);

    service.openManagement();

    expect(changed).not.toHaveBeenCalled();
  });
});
