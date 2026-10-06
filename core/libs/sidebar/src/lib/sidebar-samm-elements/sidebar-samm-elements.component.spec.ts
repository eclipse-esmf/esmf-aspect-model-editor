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

import {DraggablePort, GraphNavigatorPort, ModelSessionFacade} from '@ame/domain';
import {APP_CONFIG, BrowserService, IPC_RENDERER, config} from '@ame/shared';
import {signal} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {TranslocoTestingModule} from '@jsverse/transloco';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {SidebarStateService} from '../sidebar-state.service';
import {SidebarSAMMElementsComponent} from './sidebar-samm-elements.component';

describe('SidebarSAMMElementsComponent', () => {
  let component: SidebarSAMMElementsComponent;
  let fixture: ComponentFixture<SidebarSAMMElementsComponent>;
  let graphNavigatorMock: {
    hasElements: ReturnType<typeof vi.fn>;
  };
  let hasAspectSignal = signal(false);
  let sidebarService: SidebarStateService;
  let isTauri: boolean;
  let ipcRendererMock: {openExternalLink: ReturnType<typeof vi.fn>};

  const docsLink = (): HTMLAnchorElement => fixture.nativeElement.querySelector('[data-testid="samm-elements-docs-link"]');

  beforeEach(() => {
    isTauri = false;
    ipcRendererMock = {openExternalLink: vi.fn().mockResolvedValue(undefined)};
    hasAspectSignal = signal(false);
    graphNavigatorMock = {
      hasElements: vi.fn(() => false),
    };

    TestBed.configureTestingModule({
      imports: [
        SidebarSAMMElementsComponent,
        TranslocoTestingModule.forRoot({langs: {en: {}}, translocoConfig: {availableLangs: ['en'], defaultLang: 'en'}}),
      ],
      providers: [
        SidebarStateService,
        {provide: GraphNavigatorPort, useValue: graphNavigatorMock},
        {provide: ModelSessionFacade, useValue: {hasAspect: hasAspectSignal}},
        {provide: DraggablePort, useValue: {makeDraggable: vi.fn()}},
        {provide: APP_CONFIG, useValue: {...config, currentSammVersion: '9.8.7'}},
        {provide: BrowserService, useValue: {isStartedAsTauriApp: () => isTauri}},
        {provide: IPC_RENDERER, useValue: ipcRendererMock},
      ],
    });

    sidebarService = TestBed.inject(SidebarStateService);
    fixture = TestBed.createComponent(SidebarSAMMElementsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should include aspect in available elements when model does not have an aspect', () => {
    hasAspectSignal.set(false);
    fixture.detectChanges();

    const elements = (component as any).availableElements();
    expect(elements).toContain('aspect');
    expect(elements).not.toContain('entityInstance');
  });

  it('should exclude aspect from available elements when model already has an aspect', () => {
    hasAspectSignal.set(true);
    fixture.detectChanges();

    const elements = (component as any).availableElements();
    expect(elements).not.toContain('aspect');
    expect(elements).not.toContain('entityInstance');
  });

  it('should correctly report isEmptyModel based on rendered graph elements', () => {
    graphNavigatorMock.hasElements.mockReturnValue(false);
    expect(component.isEmptyModel).toBe(true);

    graphNavigatorMock.hasElements.mockReturnValue(true);
    expect(component.isEmptyModel).toBe(false);
  });

  it('should close sammElements sidebar', () => {
    sidebarService.sammElements.open();
    expect(sidebarService.sammElements.isOpened()).toBe(true);

    sidebarService.sammElements.close();
    expect(sidebarService.sammElements.isOpened()).toBe(false);
  });

  it('should link to the SAMM meta model elements documentation of the configured SAMM version', () => {
    const link = docsLink();

    expect(link).toBeTruthy();
    expect(link.getAttribute('href')).toBe('https://eclipse-esmf.github.io/samm-specification/9.8.7/meta-model-elements.html');
    expect(link.getAttribute('target')).toBe('_blank');
    expect(link.getAttribute('rel')).toContain('noopener');
  });

  it('should make the whole header title the documentation link', () => {
    const link = docsLink();

    expect(link.textContent).toContain('sidebar.sammElements');
    expect(link.querySelector('h2')).toBeTruthy();
    expect(link.querySelector('mat-icon')?.textContent?.trim()).toBe('info_outline');
  });

  it('should let the browser open the documentation in a new tab when not started as Tauri app', () => {
    const event = new MouseEvent('click', {bubbles: true, cancelable: true});
    (docsLink().querySelector('h2') as HTMLElement).dispatchEvent(event);

    expect(event.defaultPrevented).toBe(false);
    expect(ipcRendererMock.openExternalLink).not.toHaveBeenCalled();
  });

  it('should open the documentation exactly once via IPC when started as Tauri app', () => {
    isTauri = true;
    const bodyListener = vi.fn();
    document.body.addEventListener('click', bodyListener);

    const event = new MouseEvent('click', {bubbles: true, cancelable: true});
    (docsLink().querySelector('mat-icon') as HTMLElement).dispatchEvent(event);
    document.body.removeEventListener('click', bodyListener);

    expect(event.defaultPrevented).toBe(true);
    expect(bodyListener).not.toHaveBeenCalled();
    expect(ipcRendererMock.openExternalLink).toHaveBeenCalledTimes(1);
    expect(ipcRendererMock.openExternalLink).toHaveBeenCalledWith(
      'https://eclipse-esmf.github.io/samm-specification/9.8.7/meta-model-elements.html',
    );
  });

  it('should not render element descriptions', () => {
    const elements = fixture.nativeElement.querySelectorAll('ame-element');

    expect(elements.length).toBeGreaterThan(0);
    expect(fixture.nativeElement.querySelector('.element-description')).toBeNull();
  });

  describe('resize gutter', () => {
    afterEach(() => localStorage.removeItem('ame.sidebar.sammElements.width'));

    it('renders the shared resize gutter on the end edge with the panel limits', () => {
      fixture.destroy();
      fixture = TestBed.createComponent(SidebarSAMMElementsComponent);
      fixture.detectChanges();
      const gutter = fixture.nativeElement.querySelector('[data-testid="samm-elements-resize-gutter"]') as HTMLElement;
      expect(gutter).not.toBeNull();
      expect(gutter.tagName.toLowerCase()).toBe('ame-resize-gutter');
      expect(gutter.classList).toContain('resize-gutter--end');
      expect(gutter.getAttribute('role')).toBe('separator');
      expect(gutter.getAttribute('aria-valuemin')).toBe('250');
      expect(gutter.getAttribute('aria-valuemax')).toBe('700');
      expect((fixture.nativeElement as HTMLElement).style.width).toBe('');
    });

    it('restores the persisted width onto the panel', () => {
      localStorage.setItem('ame.sidebar.sammElements.width', '400');
      fixture.destroy();
      fixture = TestBed.createComponent(SidebarSAMMElementsComponent);
      fixture.detectChanges();
      expect((fixture.nativeElement as HTMLElement).style.width).toBe('400px');
    });

    it('clamps a persisted width below the minimum', () => {
      localStorage.setItem('ame.sidebar.sammElements.width', '10');
      fixture.destroy();
      fixture = TestBed.createComponent(SidebarSAMMElementsComponent);
      fixture.detectChanges();
      expect((fixture.nativeElement as HTMLElement).style.width).toBe('250px');
    });
  });
});
