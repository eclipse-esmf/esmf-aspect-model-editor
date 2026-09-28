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
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {TranslocoTestingModule} from '@jsverse/transloco';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {EntityInstanceSearchBarComponent} from './entity-instance-search-bar.component';

describe('EntityInstanceSearchBarComponent', () => {
  let component: EntityInstanceSearchBarComponent;
  let fixture: ComponentFixture<EntityInstanceSearchBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        EntityInstanceSearchBarComponent,
        BrowserAnimationsModule,
        TranslocoTestingModule.forRoot({langs: {en: {}}, translocoConfig: {availableLangs: ['en'], defaultLang: 'en'}}),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(EntityInstanceSearchBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit search value', () => {
    const searchSpy = vi.fn();
    component.newSearch.subscribe(searchSpy);

    component.sendNewSearchValue({target: {value: 'test'}} as any);
    expect(searchSpy).toHaveBeenCalledWith('test');
  });
});
