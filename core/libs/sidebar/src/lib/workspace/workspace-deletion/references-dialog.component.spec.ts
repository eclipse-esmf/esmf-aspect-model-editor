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

import {provideZonelessChangeDetection} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {TranslocoTestingModule} from '@jsverse/transloco';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {ReferencesDialogComponent, ReferencesDialogData} from './references-dialog.component';

describe('ReferencesDialogComponent', () => {
  const create = (data: ReferencesDialogData) => {
    TestBed.configureTestingModule({
      imports: [
        ReferencesDialogComponent,
        TranslocoTestingModule.forRoot({langs: {en: {}}, translocoConfig: {availableLangs: ['en'], defaultLang: 'en'}}),
      ],
      providers: [
        provideZonelessChangeDetection(),
        {provide: MAT_DIALOG_DATA, useValue: data},
        {provide: MatDialogRef, useValue: {close: vi.fn()}},
      ],
    });
    const fixture = TestBed.createComponent(ReferencesDialogComponent);
    fixture.detectChanges();
    return fixture;
  };

  beforeEach(() => TestBed.resetTestingModule());

  it('lists the referencing files with their elements', () => {
    const fixture = create({
      kind: 'namespace',
      name: 'org.a:1.0.0',
      report: {
        deletable: false,
        references: [
          {
            namespace: 'org.b',
            version: '1.0.0',
            fileName: 'B1.ttl',
            referencedElements: ['urn:samm:org.a:1.0.0#p', 'urn:samm:org.a:1.0.0#C'],
          },
          {namespace: 'org.c', version: '2.0.0', fileName: 'C1.ttl', referencedElements: ['urn:samm:org.a:1.0.0#p']},
        ],
        unreadableFiles: [],
      },
    });
    const element: HTMLElement = fixture.nativeElement;

    const items = element.querySelectorAll('[data-testid="references-item"]');
    expect(items).toHaveLength(2);
    expect(items[0].textContent).toContain('B1.ttl');
    expect(items[0].textContent).toContain('org.b:1.0.0');
    expect(items[0].querySelectorAll('code')[0].textContent).toBe('org.a:1.0.0#p');
    expect(items[0].querySelectorAll('code')[0].getAttribute('title')).toBe('urn:samm:org.a:1.0.0#p');
    expect(element.querySelector('[data-testid="unreadable-list"]')).toBeNull();
  });

  it('lists the files that could not be checked', () => {
    const fixture = create({
      kind: 'file',
      name: 'A1.ttl',
      report: {
        deletable: false,
        references: [],
        unreadableFiles: [{namespace: 'org.c', version: '1.0.0', fileName: 'Broken.ttl', message: 'Out of place'}],
      },
    });
    const element: HTMLElement = fixture.nativeElement;

    expect(element.querySelector('[data-testid="references-list"]')).toBeNull();
    expect(element.querySelector('[data-testid="unreadable-item"]')?.textContent).toContain('Out of place');
  });

  it('has the shared (x) and only a close action', () => {
    const fixture = create({kind: 'file', name: 'A1.ttl', report: {deletable: false, references: [], unreadableFiles: []}});
    const element: HTMLElement = fixture.nativeElement;

    expect(element.querySelector('ame-dialog-close-button')).toBeTruthy();
    expect(element.querySelectorAll('mat-dialog-actions button')).toHaveLength(1);
  });
});
