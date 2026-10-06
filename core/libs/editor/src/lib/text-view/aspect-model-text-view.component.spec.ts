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

import {
  ConfigurationService,
  GraphNavigatorPort,
  LoadedFilesService,
  ModelDocumentService,
  ModelValidationStore,
  TabsStore,
  ViolationError,
} from '@ame/domain';
import {MaxGraphHelper, MaxGraphShapeSelectorService} from '@ame/graph';
import {LanguageTranslationService, NotificationsService} from '@ame/shared';
import {signal} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {TranslocoTestingModule} from '@jsverse/transloco';
import {BehaviorSubject, of, Subject, throwError} from 'rxjs';
import {afterEach, beforeAll, beforeEach, describe, expect, it, vi} from 'vitest';
import {FileHandlingService} from '../editor-toolbar/services/file-handling.service';
import {ModelSavingTrackerService} from '../model-saving-tracker.service';
import {PrefixManagementService} from '../prefixes/prefix-management.service';
import {TabStateService} from '../tabs/tab-state.service';
import {AspectModelTextViewComponent} from './aspect-model-text-view.component';
import {AspectModelText, AspectModelTextService} from './aspect-model-text.service';
import {EditorViewModeService, TextViewRevealRequest} from './editor-view-mode.service';

const NS = 'urn:samm:org.example:1.0.0#';
const MODEL = [
  `@prefix : <${NS}> .`,
  '',
  ':Movement a samm:Aspect ;',
  '   samm:properties ( :speed ) .',
  '',
  ':speed a samm:Property .',
].join('\n');

describe('AspectModelTextViewComponent', () => {
  beforeAll(() => {
    // jsdom has no layout for ranges; CodeMirror measures text in animation frames.
    const emptyRect = () => new DOMRect();
    Range.prototype.getClientRects ??= () => [] as unknown as DOMRectList;
    Range.prototype.getBoundingClientRect ??= emptyRect;
  });

  let fixture: ComponentFixture<AspectModelTextViewComponent>;
  let component: AspectModelTextViewComponent;
  let textService: {load: ReturnType<typeof vi.fn>};
  let violations: ReturnType<typeof signal<ViolationError[]>>;
  let graphVersion: ReturnType<typeof signal<number>>;
  let selectedCells: ReturnType<typeof signal<any[]>>;
  let revealRequest: ReturnType<typeof signal<TextViewRevealRequest | null>>;
  let viewMode: {
    revealRequest: typeof revealRequest;
    searchRequest: ReturnType<typeof signal<number>>;
    clearRevealRequest: ReturnType<typeof vi.fn>;
  };
  let fileHandling: {copyToClipboardSync: ReturnType<typeof vi.fn>};
  let notifications: {info: ReturnType<typeof vi.fn>};
  let modelDocument: {sortAlphabetically: ReturnType<typeof vi.fn>};
  let tabState: {setTabDirty: ReturnType<typeof vi.fn>; activeTabId: ReturnType<typeof signal<string>>};
  let settings$: BehaviorSubject<any>;
  const rdfModel = {};
  let unresolvedUrns: string[];
  const translateText = (key: string, params?: Record<string, string>) => `${key}${params ? ' ' + JSON.stringify(params) : ''}`;
  let prefixManagement: {openManagement: ReturnType<typeof vi.fn>; prefixesChanged$: Subject<void>};

  const query = (testId: string): HTMLElement => fixture.nativeElement.querySelector(`[data-testid="${testId}"]`);

  async function render(text: AspectModelText | Error = {content: MODEL, formatted: true}) {
    textService.load.mockReturnValue(text instanceof Error ? throwError(() => text) : of(text));
    fixture = TestBed.createComponent(AspectModelTextViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
    // CodeMirror is loaded lazily.
    await vi.waitFor(() => expect(fixture.nativeElement.querySelector('.cm-editor')).toBeTruthy());
    // the text is created debounced
    await vi.waitFor(() => expect(component.state()).not.toBe('loading'));
    fixture.detectChanges();
  }

  beforeEach(() => {
    textService = {load: vi.fn()};
    violations = signal<ViolationError[]>([]);
    graphVersion = signal(0);
    selectedCells = signal<any[]>([]);
    revealRequest = signal<TextViewRevealRequest | null>(null);
    viewMode = {
      revealRequest,
      searchRequest: signal(0),
      clearRevealRequest: vi.fn(() => revealRequest.set(null)),
    };
    fileHandling = {copyToClipboardSync: vi.fn()};
    notifications = {info: vi.fn()};
    modelDocument = {sortAlphabetically: vi.fn()};
    prefixManagement = {openManagement: vi.fn(), prefixesChanged$: new Subject<void>()};
    tabState = {setTabDirty: vi.fn(), activeTabId: signal('tab-1')};
    settings$ = new BehaviorSubject({elementOrderStrategy: 'keepOrderAfterParent'});
    unresolvedUrns = [];

    TestBed.configureTestingModule({
      imports: [AspectModelTextViewComponent, TranslocoTestingModule.forRoot({langs: {en: {}}})],
      providers: [
        {provide: AspectModelTextService, useValue: textService},
        {provide: EditorViewModeService, useValue: viewMode},
        {provide: ModelValidationStore, useValue: {violations}},
        {provide: MaxGraphShapeSelectorService, useValue: {selectedCells}},
        {provide: GraphNavigatorPort, useValue: {graphVersion}},
        {provide: TabsStore, useValue: {activeTabId: signal('tab-1')}},
        {provide: FileHandlingService, useValue: fileHandling},
        {provide: NotificationsService, useValue: notifications},
        {
          provide: LanguageTranslationService,
          useValue: {language: {textView: {copied: 'Copied', sorted: 'Sorted'}}, translateService: {translate: translateText}},
        },
        {provide: ModelDocumentService, useValue: modelDocument},
        {provide: LoadedFilesService, useValue: {currentLoadedFile: {rdfModel}, unresolvedElementUrns: () => unresolvedUrns}},
        {provide: ModelSavingTrackerService, useValue: {isSaved$: of(false)}},
        {provide: TabStateService, useValue: tabState},
        {provide: PrefixManagementService, useValue: prefixManagement},
        {provide: ConfigurationService, useValue: {settings$}},
      ],
    });
  });

  afterEach(() => vi.restoreAllMocks());

  it('shows the model read-only with line numbers', async () => {
    await render();

    const content = query('text-view-content');
    expect(content.textContent).toContain(':Movement a samm:Aspect');
    expect(content.getAttribute('aria-readonly')).toBe('true');
    expect(fixture.nativeElement.querySelectorAll('.cm-lineNumbers .cm-gutterElement').length).toBeGreaterThan(0);
    expect(query('text-view-line-count')).toBeTruthy();
    expect(query('text-view-readonly')).toBeTruthy();
    expect(query('text-view-unformatted')).toBeNull();
    expect(component.state()).toBe('ready');
  });

  it('highlights the Turtle syntax', async () => {
    await render();
    expect(fixture.nativeElement.querySelectorAll('.cm-line span').length).toBeGreaterThan(0);
  });

  it('marks unformatted content', async () => {
    await render({content: MODEL, formatted: false});
    expect(query('text-view-unformatted')).toBeTruthy();
  });

  it('shows a placeholder for empty models', async () => {
    await render({content: '', formatted: false});
    expect(query('text-view-empty')).toBeTruthy();
    expect(component.state()).toBe('empty');
  });

  it('shows an error with retry when the text cannot be created', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    await render(new Error('sync failed'));
    expect(query('text-view-error')).toBeTruthy();

    textService.load.mockReturnValue(of({content: MODEL, formatted: true}));
    (query('text-view-error').querySelector('button') as HTMLButtonElement).click();
    fixture.detectChanges();

    await vi.waitFor(() => expect(component.state()).toBe('ready'));
  });

  it('reloads the text when the graph changes', async () => {
    await render();
    expect(textService.load).toHaveBeenCalledTimes(1);

    graphVersion.set(1);
    fixture.detectChanges();
    graphVersion.set(2);
    fixture.detectChanges();
    await fixture.whenStable();

    // bursts of graph changes only create the text once
    await vi.waitFor(() => expect(textService.load).toHaveBeenCalledTimes(2));
    await new Promise(resolve => setTimeout(resolve, 300));
    expect(textService.load).toHaveBeenCalledTimes(2);
  });

  it('sorts the elements alphabetically and marks the tab as changed', async () => {
    await render();

    query('text-view-sort').click();

    expect(modelDocument.sortAlphabetically).toHaveBeenCalledWith(rdfModel);
    expect(tabState.setTabDirty).toHaveBeenCalledWith('tab-1', true);
    expect(notifications.info).toHaveBeenCalledWith(expect.objectContaining({title: 'Sorted'}));
    await vi.waitFor(() => expect(textService.load).toHaveBeenCalledTimes(2));
  });

  it('opens the prefix management and shows changed prefixes', async () => {
    await render();

    query('text-view-prefixes').click();
    expect(prefixManagement.openManagement).toHaveBeenCalled();

    prefixManagement.prefixesChanged$.next();
    await vi.waitFor(() => expect(textService.load).toHaveBeenCalledTimes(2));
  });

  it('disables sorting when the formatter defines the element order', async () => {
    settings$.next({elementOrderStrategy: 'formatterDefault'});
    await render();

    expect((query('text-view-sort') as HTMLButtonElement).disabled).toBe(true);
    component.sortAlphabetically();
    expect(modelDocument.sortAlphabetically).not.toHaveBeenCalled();
  });

  it('scrolls to the element selected in the graph', async () => {
    selectedCells.set([{id: 'speed'}]);
    vi.spyOn(MaxGraphHelper, 'getModelElement').mockReturnValue({aspectModelUrn: `${NS}speed`} as any);

    await render();

    expect(component.targetLine()).toBe(6);
    expect(fixture.nativeElement.querySelector('.cm-ame-target-line')?.textContent).toContain(':speed a samm:Property');
  });

  it('reveals requested elements and clears the request', async () => {
    await render();

    revealRequest.set({urn: `${NS}Movement`, id: 1});
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.targetLine()).toBe(3);
    expect(viewMode.clearRevealRequest).toHaveBeenCalledWith(1);
  });

  describe('problems', () => {
    const marks = (): HTMLElement[] => [...fixture.nativeElement.querySelectorAll('.cm-lintRange-error')];

    it('underlines validation issues at the element and jumps to them', async () => {
      violations.set([
        {message: 'Speed has no characteristic', focusNode: `${NS}speed`, fix: []},
        {message: 'Unknown element', focusNode: `${NS}Unknown`, fix: []},
      ]);
      await render();

      const definition = MODEL.indexOf(':speed a');
      expect(component.problems()).toEqual([
        {from: definition, to: definition + ':speed'.length, kind: 'violation', message: 'Speed has no characteristic'},
      ]);
      await vi.waitFor(() => expect(marks().map(mark => mark.textContent)).toEqual([':speed']));
      expect(fixture.nativeElement.querySelector('.cm-gutter-lint .cm-lint-marker-error')).toBeTruthy();
      expect(query('text-view-problems').textContent).toContain('textView.problems');

      query('text-view-problems').click();
      expect(component.targetLine()).toBe(6);
    });

    it('underlines every reference to an element missing in the workspace', async () => {
      unresolvedUrns = [`${NS}speed`];
      await render();

      const message = translateText('textView.unresolvedReference', {urn: `${NS}speed`});
      expect(component.problems().map(({kind, message}) => ({kind, message}))).toEqual([
        {kind: 'unresolved', message},
        {kind: 'unresolved', message},
      ]);
      await vi.waitFor(() => expect(marks().length).toBe(2));
      expect(marks().every(mark => mark.textContent === ':speed')).toBe(true);
      expect(component.problemCount()).toBe(2);
    });

    it('counts validation issues and missing references together and visits every line once', async () => {
      violations.set([{message: 'Movement is invalid', focusNode: `${NS}Movement`, fix: []}]);
      unresolvedUrns = [`${NS}speed`];
      await render();

      expect(component.problems().map(({kind}) => kind)).toEqual(['violation', 'unresolved', 'unresolved']);
      expect(component.problemCount()).toBe(3);

      const visited = [1, 2, 3, 4].map(() => {
        component.goToNextProblem();
        return component.targetLine();
      });
      expect(visited).toEqual([3, 4, 6, 3]);
    });

    it('lists missing elements that are not written in the text in the tooltip', async () => {
      unresolvedUrns = ['urn:samm:org.other:1.0.0#indirect'];
      await render();

      expect(component.problems()).toEqual([]);
      expect(component.indirectUnresolvedUrns()).toEqual(['urn:samm:org.other:1.0.0#indirect']);
      expect(component.problemCount()).toBe(1);
      expect(component.problemsTooltip()).toBe(
        translateText('textView.indirectUnresolved', {elements: 'urn:samm:org.other:1.0.0#indirect'}),
      );
      expect(marks().length).toBe(0);

      // nothing to jump to in the text
      query('text-view-problems').click();
      expect(component.targetLine()).toBeNull();
    });

    it('hides the counter without problems', async () => {
      await render();

      expect(component.problemCount()).toBe(0);
      expect(query('text-view-problems')).toBeNull();
      expect(marks().length).toBe(0);
    });

    it('reads the missing elements again when the text is reloaded', async () => {
      unresolvedUrns = [`${NS}speed`];
      await render();
      expect(component.problemCount()).toBe(2);

      unresolvedUrns = [];
      component.reload();
      await vi.waitFor(() => expect(textService.load).toHaveBeenCalledTimes(2));
      await vi.waitFor(() => expect(component.problemCount()).toBe(0));
      fixture.detectChanges();
      await vi.waitFor(() => expect(marks().length).toBe(0));
    });
  });

  it('copies the text to the clipboard', async () => {
    await render();

    query('text-view-copy').click();

    expect(fileHandling.copyToClipboardSync).toHaveBeenCalledWith(MODEL);
    expect(notifications.info).toHaveBeenCalledWith(expect.objectContaining({title: 'Copied'}));
  });

  it('opens the search panel', async () => {
    await render();

    query('text-view-search').click();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.cm-search')).toBeTruthy();
  });
});
