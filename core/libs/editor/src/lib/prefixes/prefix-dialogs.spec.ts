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
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {RdfModel} from '@esmf/aspect-model-loader';
import {TranslocoTestingModule} from '@jsverse/transloco';
import {DataFactory, Store} from 'n3';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {NamespacePrefixDialogComponent} from './namespace-prefix-dialog.component';
import {PrefixManagementDialogComponent, PrefixRow} from './prefix-management-dialog.component';

const EX = 'http://example.com#';
const BATTERY = 'https://example.org/battery#';

function createModel(): RdfModel {
  const rdfModel = new RdfModel(new Store(), '2.2.0', 'urn:samm:org.example:1.0.0');
  rdfModel.definePrefix('ex', EX);
  rdfModel.store.addQuad(DataFactory.namedNode(`${EX}MyProperty`), rdfModel.samm.SeeProperty(), DataFactory.namedNode(`${EX}Other`));
  return rdfModel;
}

const rowOf = (rows: PrefixRow[], alias: string): PrefixRow => rows.find(row => row.alias === alias) as PrefixRow;

function setup<T>(component: new (...args: any[]) => T, data: unknown) {
  const dialogRef = {close: vi.fn()};
  TestBed.configureTestingModule({
    imports: [component, NoopAnimationsModule, TranslocoTestingModule.forRoot({langs: {en: {}}})],
    providers: [
      {provide: MAT_DIALOG_DATA, useValue: data},
      {provide: MatDialogRef, useValue: dialogRef},
    ],
  });
  const fixture: ComponentFixture<T> = TestBed.createComponent(component);
  fixture.detectChanges();
  const query = (testId: string): HTMLElement => fixture.nativeElement.querySelector(`[data-testid="${testId}"]`);
  const type = (testId: string, value: string) => {
    const input = query(testId) as HTMLInputElement;
    input.value = value;
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
  };
  return {fixture, component: fixture.componentInstance, dialogRef, query, type};
}

describe('NamespacePrefixDialogComponent', () => {
  let rdfModel: RdfModel;

  beforeEach(() => (rdfModel = createModel()));

  it('should propose the suggestion and close with the chosen prefix', () => {
    const {dialogRef, query, type} = setup(NamespacePrefixDialogComponent, {
      rdfModel,
      namespace: BATTERY,
      suggestion: 'battery',
      sourceAlias: null,
    });

    expect((query('reference-prefix-input') as HTMLInputElement).value).toBe('battery');
    expect(query('reference-example').textContent).toContain('battery:MyElement');
    expect(query('reference-prefix-error')).toBeNull();

    type('reference-prefix-input', 'bp');
    query('reference-prefix-confirm').click();

    expect(dialogRef.close).toHaveBeenCalledWith('bp');
  });

  it('should not allow a prefix which stands for another namespace', () => {
    const {component, dialogRef, query, type} = setup(NamespacePrefixDialogComponent, {
      rdfModel,
      namespace: 'http://another-example.com#',
      suggestion: 'ex2',
      sourceAlias: 'ex',
    });

    expect(query('reference-conflict')).toBeTruthy();
    type('reference-prefix-input', 'ex');

    expect(component.error()).toBe('aliasInUse');
    expect(component.usedBy()).toBe(EX);
    expect(query('reference-prefix-error')).toBeTruthy();
    expect(query('reference-example')).toBeNull();
    expect((query('reference-prefix-confirm') as HTMLButtonElement).disabled).toBe(true);
    component.confirm();
    expect(dialogRef.close).not.toHaveBeenCalled();

    type('reference-prefix-input', 'samm');
    expect(component.error()).toBe('invalidAlias');
    expect(query('reference-prefix-error')).toBeTruthy();
  });

  it('should show the referenced element in the example', () => {
    const {query, type} = setup(NamespacePrefixDialogComponent, {
      rdfModel,
      namespace: BATTERY,
      suggestion: 'battery',
      sourceAlias: null,
      elementName: 'CellVoltage',
    });

    expect(query('reference-example').textContent).toContain('battery:CellVoltage');
    type('reference-prefix-input', 'bp');
    expect(query('reference-example').textContent).toContain('bp:CellVoltage');
  });

  it('should close without prefix when the automatic prefix is used', () => {
    const {dialogRef, query} = setup(NamespacePrefixDialogComponent, {
      rdfModel,
      namespace: BATTERY,
      suggestion: 'battery',
      sourceAlias: null,
    });

    query('reference-prefix-skip').click();

    expect(dialogRef.close).toHaveBeenCalledWith();
  });
});

describe('PrefixManagementDialogComponent', () => {
  let rdfModel: RdfModel;

  beforeEach(() => (rdfModel = createModel()));

  it('should list all prefixes with their namespace and usage', () => {
    const {component, query} = setup(PrefixManagementDialogComponent, {rdfModel});

    expect(component.rows().find(row => row.alias === 'ex')).toEqual({alias: 'ex', namespace: EX, used: true, protected: false});
    expect(component.rows().find(row => row.alias === '')?.protected).toBe(true);
    expect(query('prefix-row-ex').textContent).toContain(EX);
    expect(query('prefix-row-default')).toBeTruthy();
  });

  it('should rename a prefix without touching the IRIs', () => {
    const {component, dialogRef, fixture, query, type} = setup(PrefixManagementDialogComponent, {rdfModel});

    (query('prefix-row-ex').querySelector('[data-testid="prefix-rename"]') as HTMLButtonElement).click();
    fixture.detectChanges();
    type('prefix-rename-input', 'example');
    query('prefix-rename-save').click();
    fixture.detectChanges();

    expect(rdfModel.getPrefixes()['example']).toBe(EX);
    expect(rdfModel.store.getQuads(`${EX}MyProperty`, null, null, null)).toHaveLength(1);
    expect(query('prefix-row-example')).toBeTruthy();

    component.close();
    expect(dialogRef.close).toHaveBeenCalledWith(true);
  });

  it('should show why a rename is not possible', () => {
    rdfModel.definePrefix('other', 'http://other.com#');
    const {component, fixture, query, type} = setup(PrefixManagementDialogComponent, {rdfModel});

    component.startRename(rowOf(component.rows(), 'ex'));
    fixture.detectChanges();
    type('prefix-rename-input', 'other');
    component.saveRename();
    fixture.detectChanges();

    expect(component.editError()).toBe('aliasInUse');
    expect(query('prefix-rename-error')).toBeTruthy();
    expect(rdfModel.getPrefixes()['ex']).toBe(EX);
    expect(query('prefix-row-ex')).toBeTruthy();
  });

  it('should only remove unused prefixes', () => {
    rdfModel.definePrefix('unused', 'http://unused.com#');
    const {component, dialogRef, fixture, query} = setup(PrefixManagementDialogComponent, {rdfModel});

    expect((query('prefix-row-ex').querySelector('[data-testid="prefix-remove"]') as HTMLButtonElement).disabled).toBe(true);
    component.remove(rowOf(component.rows(), 'ex'));
    expect(component.rowError()).toEqual({alias: 'ex', error: 'prefixInUse'});

    (query('prefix-row-unused').querySelector('[data-testid="prefix-remove"]') as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(rdfModel.getPrefixes()['unused']).toBeUndefined();
    expect(query('prefix-row-unused')).toBeNull();
    component.close();
    expect(dialogRef.close).toHaveBeenCalledWith(true);
  });

  it('should add prefixes and report errors', () => {
    const {component, dialogRef, fixture, query, type} = setup(PrefixManagementDialogComponent, {rdfModel});

    type('prefix-add-alias', 'battery');
    type('prefix-add-namespace', 'no namespace');
    query('prefix-add').click();
    fixture.detectChanges();
    expect(query('prefix-add-error')).toBeTruthy();
    expect(component.addError()).toBe('invalidNamespace');

    type('prefix-add-namespace', BATTERY);
    query('prefix-add').click();
    fixture.detectChanges();

    expect(rdfModel.getPrefixes()['battery']).toBe(BATTERY);
    expect(rdfModel.serializationMetadata.isExplicitPrefix('battery')).toBe(true);
    expect(query('prefix-row-battery')).toBeTruthy();
    expect(component.newAlias()).toBe('');

    query('prefix-management-close').click();
    expect(dialogRef.close).toHaveBeenCalledWith(true);
  });

  it('should cancel a rename with escape without closing the dialog', () => {
    const {component, fixture, query, type} = setup(PrefixManagementDialogComponent, {rdfModel});

    component.startRename(rowOf(component.rows(), 'ex'));
    fixture.detectChanges();
    type('prefix-rename-input', 'other');
    const escape = new KeyboardEvent('keydown', {key: 'Escape', bubbles: true});
    const propagation = vi.spyOn(escape, 'stopPropagation');
    query('prefix-rename-input').dispatchEvent(escape);
    fixture.detectChanges();

    expect(propagation).toHaveBeenCalled();
    expect(component.editingAlias()).toBeNull();
    expect(rdfModel.getPrefixes()['ex']).toBe(EX);
    expect(component.hasChanges).toBe(false);
  });

  it('should report changes also without the close button', () => {
    rdfModel.definePrefix('unused', 'http://unused.com#');
    const {component} = setup(PrefixManagementDialogComponent, {rdfModel});

    component.remove(rowOf(component.rows(), 'unused'));

    expect(component.hasChanges).toBe(true);
  });

  it('should report no changes when nothing was changed', () => {
    const {component, dialogRef} = setup(PrefixManagementDialogComponent, {rdfModel});
    component.close();
    expect(dialogRef.close).toHaveBeenCalledWith(false);
  });
  it('should report changes when closed via (x) or Escape (requestClose)', () => {
    rdfModel.definePrefix('unused', 'http://unused.com#');
    const {component, dialogRef} = setup(PrefixManagementDialogComponent, {rdfModel});

    component.remove(rowOf(component.rows(), 'unused'));
    component.requestClose();

    expect(dialogRef.close).toHaveBeenCalledWith(true);
  });

  it('should close without changes via requestClose', () => {
    const {component, dialogRef} = setup(PrefixManagementDialogComponent, {rdfModel});
    component.requestClose();
    expect(dialogRef.close).toHaveBeenCalledWith(false);
  });
});
