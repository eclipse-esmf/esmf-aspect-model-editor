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

import {TabsStore} from '@ame/domain';
import {provideZonelessChangeDetection, signal} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {TranslocoTestingModule} from '@jsverse/transloco';
import {MockProvider} from 'ng-mocks';
import {of} from 'rxjs';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {TabStateService} from '../tab-state.service';
import {EditorTabBarComponent} from './editor-tab-bar.component';

describe('EditorTabBarComponent', () => {
  let component: EditorTabBarComponent;
  let fixture: ComponentFixture<EditorTabBarComponent>;
  let tabStateService: TabStateService;

  const mockTabs = [
    {
      id: 'org.eclipse.examples:1.0.0:AspectDefault.ttl',
      file: 'AspectDefault.ttl',
      namespace: 'org.eclipse.examples:1.0.0',
      isDirty: false,
    },
    {
      id: 'org.eclipse.examples:1.0.0:OtherModel.ttl',
      file: 'OtherModel.ttl',
      namespace: 'org.eclipse.examples:1.0.0',
      isDirty: true,
    },
  ];

  beforeEach(async () => {
    const tabsSignal = signal(mockTabs);
    const activeTabIdSignal = signal('org.eclipse.examples:1.0.0:AspectDefault.ttl');

    await TestBed.configureTestingModule({
      imports: [
        EditorTabBarComponent,
        TranslocoTestingModule.forRoot({
          langs: {en: {}},
          translocoConfig: {availableLangs: ['en'], defaultLang: 'en'},
        }),
      ],
      providers: [
        provideZonelessChangeDetection(),
        MockProvider(TabsStore, {
          activeTabId: activeTabIdSignal as any,
          entities: tabsSignal as any,
        }),
        MockProvider(TabStateService, {
          tabs: tabsSignal as any,
          activeTabId: activeTabIdSignal as any,
          switchToTab: vi.fn(() => of(true)),
          closeTab: vi.fn(() => of(true)),
          createEmptyTab: vi.fn(),
        }),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(EditorTabBarComponent);
    component = fixture.componentInstance;
    tabStateService = TestBed.inject(TabStateService);
    fixture.detectChanges();
  });

  it('should render all tabs and mark active tab', () => {
    expect(component).toBeTruthy();
    const tabElements = fixture.debugElement.queryAll(By.css('[data-testid="editor-tab"]'));
    expect(tabElements.length).toBe(2);
    expect(tabElements[0].nativeElement.textContent).toContain('AspectDefault.ttl');
    expect(tabElements[0].classes['active']).toBe(true);
    expect(tabElements[1].classes['active']).toBeFalsy();
  });

  it('should call switchToTab on tab click', () => {
    const tabElements = fixture.debugElement.queryAll(By.css('[data-testid="editor-tab"]'));
    tabElements[1].nativeElement.click();

    expect(tabStateService.switchToTab).toHaveBeenCalledWith('org.eclipse.examples:1.0.0:OtherModel.ttl');
  });

  it('should call closeTab on close button click without triggering tab click', () => {
    const closeButtons = fixture.debugElement.queryAll(By.css('[data-testid="editor-tab-close"]'));
    closeButtons[0].nativeElement.click();

    expect(tabStateService.closeTab).toHaveBeenCalledWith('org.eclipse.examples:1.0.0:AspectDefault.ttl');
  });

  it('should call createEmptyTab on add button click', () => {
    const addBtn = fixture.debugElement.query(By.css('[data-testid="editor-tab-add"]'));
    addBtn.nativeElement.click();

    expect(tabStateService.createEmptyTab).toHaveBeenCalled();
  });

  it('should scroll left and right when scroll buttons are clicked', () => {
    const scrollContainer = fixture.nativeElement.querySelector('.tabs-scroll-area');
    scrollContainer.scrollBy = vi.fn();

    component.scrollLeft();
    expect(scrollContainer.scrollBy).toHaveBeenCalledWith({left: -150, behavior: 'smooth'});

    component.scrollRight();
    expect(scrollContainer.scrollBy).toHaveBeenCalledWith({left: 150, behavior: 'smooth'});
  });

  it('should scroll on wheel events', () => {
    const scrollContainer = fixture.nativeElement.querySelector('.tabs-scroll-area');
    scrollContainer.scrollLeft = 0;

    const event = new WheelEvent('wheel', {deltaY: 50, cancelable: true});
    component.onWheel(event);

    expect(scrollContainer.scrollLeft).toBe(50);
  });
});
