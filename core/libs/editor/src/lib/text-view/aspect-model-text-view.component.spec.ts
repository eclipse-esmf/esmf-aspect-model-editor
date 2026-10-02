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

import {GraphNavigatorPort, ModelValidationStore, TabsStore, ViolationError} from '@ame/domain';
import {MaxGraphHelper, MaxGraphShapeSelectorService} from '@ame/graph';
import {LanguageTranslationService, NotificationsService} from '@ame/shared';
import {signal} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {TranslocoTestingModule} from '@jsverse/transloco';
import {of, throwError} from 'rxjs';
import {afterEach, beforeAll, beforeEach, describe, expect, it, vi} from 'vitest';
import {FileHandlingService} from '../editor-toolbar/services/file-handling.service';
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

  const query = (testId: string): HTMLElement => fixture.nativeElement.querySelector(`[data-testid="${testId}"]`);

  async function render(text: AspectModelText | Error = {content: MODEL, formatted: true}) {
    textService.load.mockReturnValue(text instanceof Error ? throwError(() => text) : of(text));
    fixture = TestBed.createComponent(AspectModelTextViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
    // CodeMirror is loaded lazily.
    await vi.waitFor(() => expect(fixture.nativeElement.querySelector('.cm-editor')).toBeTruthy());
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
        {provide: LanguageTranslationService, useValue: {language: {textView: {copied: 'Copied'}}}},
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

    expect(component.state()).toBe('ready');
  });

  it('reloads the text when the graph changes', async () => {
    await render();
    expect(textService.load).toHaveBeenCalledTimes(1);

    graphVersion.set(1);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(textService.load).toHaveBeenCalledTimes(2);
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

  it('marks lines with validation errors and jumps between them', async () => {
    violations.set([
      {message: 'Speed has no characteristic', focusNode: `${NS}speed`, fix: []},
      {message: 'Unknown element', focusNode: `${NS}Unknown`, fix: []},
    ]);
    await render();

    expect(component.violationLines()).toEqual([{line: 6, messages: ['Speed has no characteristic']}]);
    const violationLine = fixture.nativeElement.querySelector('.cm-ame-violation-line') as HTMLElement;
    expect(violationLine.textContent).toContain(':speed');
    expect(violationLine.getAttribute('title')).toBe('Speed has no characteristic');

    query('text-view-violations').click();
    expect(component.targetLine()).toBe(6);
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
