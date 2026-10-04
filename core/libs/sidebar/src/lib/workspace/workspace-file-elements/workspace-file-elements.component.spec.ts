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

import {DraggablePort, GraphNavigatorPort, ModelLoaderPort, ModelSessionFacade, WorkspaceFacade} from '@ame/domain';
import {provideZonelessChangeDetection, signal, WritableSignal} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {DefaultCharacteristic, DefaultProperty, DefaultTrait} from '@esmf/aspect-model-loader';
import {TranslocoTestingModule} from '@jsverse/transloco';
import {of} from 'rxjs';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {FileStatus, SidebarStateService} from '../../sidebar-state.service';
import {WorkspaceFileElementsComponent} from './workspace-file-elements.component';

describe('WorkspaceFileElementsComponent', () => {
  let component: WorkspaceFileElementsComponent;
  let fixture: ComponentFixture<WorkspaceFileElementsComponent>;
  let sidebarService: SidebarStateService;
  let maxgraphMock: {
    isElementRendered: ReturnType<typeof vi.fn>;
    graphVersion: WritableSignal<number>;
  };
  let modelApiMock: {fetchAspectMetaModel: ReturnType<typeof vi.fn>};
  let modelLoaderMock: {loadSingleModel: ReturnType<typeof vi.fn>};
  let loadedFilesMock: {getFile: ReturnType<typeof vi.fn>};

  beforeEach(() => {
    vi.useFakeTimers();

    maxgraphMock = {
      isElementRendered: vi.fn(),
      graphVersion: signal(0),
    };
    modelApiMock = {
      fetchAspectMetaModel: vi.fn(() =>
        of({
          sourceLocation: '/models/Aspect.ttl',
          content: 'turtle-content',
        }),
      ),
    };

    const mockProperty = new DefaultProperty({
      name: 'prop1',
      aspectModelUrn: 'urn:samm:org.eclipse.esmf:1.0.0#prop1',
      metaModelVersion: '2.1.0',
    });
    const mockCachedFile = {
      cachedFile: {
        getAllElements: () => [mockProperty],
      },
    };

    modelLoaderMock = {
      loadSingleModel: vi.fn(() => of(mockCachedFile)),
    };

    loadedFilesMock = {
      getFile: vi.fn((key: string) => {
        if (key === 'org.eclipse.esmf:1.0.0:Cached.ttl') {
          return mockCachedFile;
        }
        return null;
      }),
    };

    TestBed.configureTestingModule({
      imports: [
        WorkspaceFileElementsComponent,
        NoopAnimationsModule,
        TranslocoTestingModule.forRoot({langs: {en: {}}, translocoConfig: {availableLangs: ['en'], defaultLang: 'en'}}),
      ],
      providers: [
        provideZonelessChangeDetection(),
        SidebarStateService,
        {provide: GraphNavigatorPort, useValue: maxgraphMock},
        {provide: WorkspaceFacade, useValue: modelApiMock},
        {provide: ModelLoaderPort, useValue: modelLoaderMock},
        {provide: ModelSessionFacade, useValue: loadedFilesMock},
        {provide: DraggablePort, useValue: {makeDraggable: vi.fn()}},
      ],
    });

    sidebarService = TestBed.inject(SidebarStateService);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should create the component', () => {
    fixture = TestBed.createComponent(WorkspaceFileElementsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should load elements from cached file when selection changes to cached file', () => {
    fixture = TestBed.createComponent(WorkspaceFileElementsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    const file = new FileStatus('Cached.ttl');
    file.aspectModelUrn = 'urn:samm:org.eclipse.esmf:1.0.0#Cached';
    sidebarService.selection.select('org.eclipse.esmf:1.0.0', file);
    TestBed.flushEffects();

    expect(component.elements()['property']?.elements?.length).toBe(1);
    expect(component.elements()['property']?.elements[0].name).toBe('prop1');
  });

  it('should fetch and load elements via API when file is not yet cached', () => {
    fixture = TestBed.createComponent(WorkspaceFileElementsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    const file = new FileStatus('Remote.ttl');
    file.aspectModelUrn = 'urn:samm:org.eclipse.esmf:1.0.0#Remote';
    sidebarService.selection.select('org.eclipse.esmf:1.0.0', file);
    TestBed.flushEffects();

    expect(modelApiMock.fetchAspectMetaModel).toHaveBeenCalledWith('urn:samm:org.eclipse.esmf:1.0.0#Remote');
    expect(modelLoaderMock.loadSingleModel).toHaveBeenCalled();
    expect(component.elements()['property']?.elements?.length).toBe(1);
  });

  it('should determine if an element is imported into canvas', () => {
    fixture = TestBed.createComponent(WorkspaceFileElementsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    const element = new DefaultProperty({
      name: 'prop1',
      aspectModelUrn: 'urn:samm:org.eclipse.esmf:1.0.0#prop1',
      metaModelVersion: '2.1.0',
    });
    maxgraphMock.isElementRendered.mockReturnValue(true);
    expect(component.elementImported(element)).toBe(true);

    maxgraphMock.isElementRendered.mockReturnValue(false);
    expect(component.elementImported(element)).toBe(false);

    expect(component.elementImported(null as any)).toBe(false);
  });

  it('should toggle element filter visibility', () => {
    fixture = TestBed.createComponent(WorkspaceFileElementsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    const file = new FileStatus('Cached.ttl');
    file.aspectModelUrn = 'urn:samm:org.eclipse.esmf:1.0.0#Cached';
    sidebarService.selection.select('org.eclipse.esmf:1.0.0', file);
    TestBed.flushEffects();

    expect(component.elements()['property'].displayed).toBe(true);
    component.toggleFilter({stopPropagation: vi.fn()} as any, 'property');
    expect(component.elements()['property'].displayed).toBe(false);
  });

  it('should filter elements on search input', () => {
    fixture = TestBed.createComponent(WorkspaceFileElementsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    const file = new FileStatus('Cached.ttl');
    file.aspectModelUrn = 'urn:samm:org.eclipse.esmf:1.0.0#Cached';
    sidebarService.selection.select('org.eclipse.esmf:1.0.0', file);
    TestBed.flushEffects();

    component.search({target: {value: 'prop1'}} as any);
    vi.advanceTimersByTime(150);
    expect(component.searched()['property']).toHaveLength(1);

    component.search({target: {value: 'nonexistent'}} as any);
    vi.advanceTimersByTime(150);
    expect(component.searched()['property']).toHaveLength(0);
  });

  it('should include anonymous elements in the sidebar list', () => {
    fixture = TestBed.createComponent(WorkspaceFileElementsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    const mockNamedProperty = new DefaultProperty({
      name: 'namedProp',
      aspectModelUrn: 'urn:samm:org.eclipse.esmf:1.0.0#namedProp',
      metaModelVersion: '2.1.0',
    });
    const mockAnonCharacteristic = new DefaultCharacteristic({
      name: '[Characteristic]',
      aspectModelUrn: 'urn:samm:org.eclipse.esmf:1.0.0#anonChar',
      metaModelVersion: '2.1.0',
      isAnonymous: true,
    });

    const mockFileWithAnon = {
      cachedFile: {
        getAllElements: () => [mockNamedProperty, mockAnonCharacteristic],
      },
    };

    loadedFilesMock.getFile.mockImplementation((key: string) => {
      if (key === 'org.eclipse.esmf:1.0.0:WithAnon.ttl') {
        return mockFileWithAnon;
      }
      return null;
    });

    const file = new FileStatus('WithAnon.ttl');
    file.aspectModelUrn = 'urn:samm:org.eclipse.esmf:1.0.0#WithAnon';
    sidebarService.selection.select('org.eclipse.esmf:1.0.0', file);
    TestBed.flushEffects();

    expect(component.elements()['property']?.elements?.length).toBe(1);
    expect(component.elements()['characteristic']?.elements?.length).toBe(1);
  });

  it('should resolve parent names for elements and handle nested anonymous parents', () => {
    fixture = TestBed.createComponent(WorkspaceFileElementsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    const parentProp = new DefaultProperty({
      name: 'rootProperty',
      aspectModelUrn: 'urn:samm:org.eclipse.esmf:1.0.0#rootProperty',
      metaModelVersion: '2.1.0',
    });

    const anonChar = new DefaultCharacteristic({
      name: '[Characteristic]',
      aspectModelUrn: 'urn:samm:org.eclipse.esmf:1.0.0#anonChar',
      metaModelVersion: '2.1.0',
      isAnonymous: true,
    });
    anonChar.addParent(parentProp);

    const childConstraint = new DefaultCharacteristic({
      name: '[Constraint]',
      aspectModelUrn: 'urn:samm:org.eclipse.esmf:1.0.0#childConstraint',
      metaModelVersion: '2.1.0',
      isAnonymous: true,
    });
    childConstraint.addParent(anonChar);

    expect(component.getElementParentNames(anonChar)).toEqual(['rootProperty']);
    expect(component.getElementParentNames(childConstraint)).toEqual(['rootProperty']);
    expect(component.getElementDescription(anonChar)).toBe('In: rootProperty');
    expect(component.getElementDescription(childConstraint)).toBe('In: rootProperty');
  });

  it('should match search query against parent information in anonymous elements', () => {
    fixture = TestBed.createComponent(WorkspaceFileElementsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    const parentProp = new DefaultProperty({
      name: 'voltageProperty',
      aspectModelUrn: 'urn:samm:org.eclipse.esmf:1.0.0#voltageProperty',
      metaModelVersion: '2.1.0',
    });

    const anonChar = new DefaultCharacteristic({
      name: '[SingleEntity]',
      aspectModelUrn: 'urn:samm:org.eclipse.esmf:1.0.0#anonChar',
      metaModelVersion: '2.1.0',
      isAnonymous: true,
    });
    anonChar.addParent(parentProp);

    const mockFileWithAnon = {
      cachedFile: {
        getAllElements: () => [parentProp, anonChar],
      },
    };

    loadedFilesMock.getFile.mockReturnValue(mockFileWithAnon);

    const file = new FileStatus('Test.ttl');
    file.aspectModelUrn = 'urn:samm:org.eclipse.esmf:1.0.0#Test';
    sidebarService.selection.select('org.eclipse.esmf:1.0.0', file);
    TestBed.flushEffects();

    component.search({target: {value: 'voltage'}} as any);
    vi.advanceTimersByTime(150);

    expect(component.searched()['property']).toHaveLength(1);
    expect(component.searched()['characteristic']).toHaveLength(1);
  });

  it('should categorize DefaultTrait under trait instead of characteristic', () => {
    fixture = TestBed.createComponent(WorkspaceFileElementsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    const mockTrait = new DefaultTrait({
      name: 'testTrait',
      aspectModelUrn: 'urn:samm:org.eclipse.esmf:1.0.0#testTrait',
      metaModelVersion: '2.1.0',
    });

    const mockFileWithTrait = {
      cachedFile: {
        getAllElements: () => [mockTrait],
      },
    };

    loadedFilesMock.getFile.mockImplementation((key: string) => {
      if (key === 'org.eclipse.esmf:1.0.0:WithTrait.ttl') {
        return mockFileWithTrait;
      }
      return null;
    });

    const file = new FileStatus('WithTrait.ttl');
    file.aspectModelUrn = 'urn:samm:org.eclipse.esmf:1.0.0#WithTrait';
    sidebarService.selection.select('org.eclipse.esmf:1.0.0', file);
    TestBed.flushEffects();

    expect(component.elements()['trait']?.elements?.length).toBe(1);
    expect(component.elements()['characteristic']?.elements?.length).toBe(0);
  });

  it('should update elementImported reactively when graphVersion changes', () => {
    fixture = TestBed.createComponent(WorkspaceFileElementsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    const mockProperty = new DefaultProperty({
      name: 'prop1',
      aspectModelUrn: 'urn:samm:org.eclipse.esmf:1.0.0#prop1',
      metaModelVersion: '2.1.0',
    });

    maxgraphMock.isElementRendered.mockReturnValue(true);
    expect(component.elementImported(mockProperty)).toBe(true);

    maxgraphMock.isElementRendered.mockReturnValue(false);
    maxgraphMock.graphVersion.update(v => v + 1);
    TestBed.flushEffects();

    expect(component.elementImported(mockProperty)).toBe(false);
  });

  describe('resize gutter', () => {
    afterEach(() => localStorage.removeItem('ame.sidebar.fileElements.width'));

    it('renders the shared resize gutter on the end edge with the panel limits', () => {
      fixture = TestBed.createComponent(WorkspaceFileElementsComponent);
      fixture.detectChanges();
      const gutter = fixture.nativeElement.querySelector('[data-testid="file-elements-resize-gutter"]') as HTMLElement;
      expect(gutter).not.toBeNull();
      expect(gutter.tagName.toLowerCase()).toBe('ame-resize-gutter');
      expect(gutter.classList).toContain('resize-gutter--end');
      expect(gutter.getAttribute('role')).toBe('separator');
      expect(gutter.getAttribute('aria-valuemin')).toBe('250');
      expect(gutter.getAttribute('aria-valuemax')).toBe('800');
      expect((fixture.nativeElement as HTMLElement).style.width).toBe('350px');
    });

    it('restores the persisted width onto the panel', () => {
      localStorage.setItem('ame.sidebar.fileElements.width', '480');
      fixture = TestBed.createComponent(WorkspaceFileElementsComponent);
      fixture.detectChanges();
      expect((fixture.nativeElement as HTMLElement).style.width).toBe('480px');
    });

    it('clamps a persisted width below the minimum', () => {
      localStorage.setItem('ame.sidebar.fileElements.width', '10');
      fixture = TestBed.createComponent(WorkspaceFileElementsComponent);
      fixture.detectChanges();
      expect((fixture.nativeElement as HTMLElement).style.width).toBe('250px');
    });
  });
  describe('header', () => {
    beforeEach(() => {
      fixture = TestBed.createComponent(WorkspaceFileElementsComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      const file = new FileStatus('Cached.ttl');
      file.aspectModelUrn = 'urn:samm:org.eclipse.esmf:1.0.0#Cached';
      sidebarService.selection.select('org.eclipse.esmf:1.0.0', file);
      sidebarService.fileElements.open();
      TestBed.flushEffects();
      fixture.detectChanges();
    });

    function byTestId(testId: string): HTMLElement {
      return fixture.nativeElement.querySelector(`[data-testid="${testId}"]`);
    }

    it('should name the panel, the selected file and its namespace', () => {
      const header = byTestId('file-elements-header');
      expect(header.querySelector('.header__overline')?.textContent).toContain('sidebar.elementList.title');
      expect(header.querySelector('h2')?.textContent?.trim()).toBe('Cached.ttl');
      expect(byTestId('file-elements-namespace').textContent?.trim()).toBe('org.eclipse.esmf:1.0.0');
    });

    it('should close the element list with the labelled close button', () => {
      const close = byTestId('file-elements-close');
      expect(close.getAttribute('aria-label')).toBe('sidebar.elementList.close');

      close.click();

      expect(sidebarService.fileElements.isOpened()).toBe(false);
    });

    it('should not render a header without selection', () => {
      sidebarService.selection.reset();
      TestBed.flushEffects();
      fixture.detectChanges();
      expect(byTestId('file-elements-header')).toBeNull();
    });
  });
});
