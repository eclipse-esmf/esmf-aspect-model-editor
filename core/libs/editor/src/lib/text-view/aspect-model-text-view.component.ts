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
} from '@ame/domain';
import {MaxGraphHelper, MaxGraphShapeSelectorService} from '@ame/graph';
import {createDebouncedLoading, LanguageTranslationService, NotificationsService} from '@ame/shared';
import {afterNextRender, Component, computed, DestroyRef, effect, ElementRef, inject, signal, untracked, viewChild} from '@angular/core';
import {takeUntilDestroyed, toSignal} from '@angular/core/rxjs-interop';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatTooltipModule} from '@angular/material/tooltip';
import {TranslocoDirective} from '@jsverse/transloco';
import {catchError, debounceTime, map, of, Subject, switchMap, take, tap} from 'rxjs';
import {FileHandlingService} from '../editor-toolbar/services/file-handling.service';
import {ModelSavingTrackerService} from '../model-saving-tracker.service';
import {PrefixManagementService} from '../prefixes/prefix-management.service';
import {TabStateService} from '../tabs/tab-state.service';
import {AspectModelText, AspectModelTextService} from './aspect-model-text.service';
import {EditorViewModeService} from './editor-view-mode.service';
import type {TurtleEditor} from './turtle-editor';
import {findElementLine, findElementOccurrences, findElementRange, lineAt, TextProblem} from './turtle-text.utils';

export type TextViewState = 'loading' | 'ready' | 'empty' | 'error';

/** Graph changes often come in bursts (e.g. moving several elements); the text is created once they are done. */
const RELOAD_DEBOUNCE_MS = 250;

@Component({
  selector: 'ame-aspect-model-text-view',
  templateUrl: './aspect-model-text-view.component.html',
  styleUrls: ['./aspect-model-text-view.component.scss'],
  imports: [TranslocoDirective, MatButtonModule, MatIconModule, MatProgressSpinnerModule, MatTooltipModule],
})
export class AspectModelTextViewComponent {
  private readonly host = viewChild.required<ElementRef<HTMLElement>>('host');

  private readonly destroyRef = inject(DestroyRef);
  private readonly textService = inject(AspectModelTextService);
  private readonly viewMode = inject(EditorViewModeService);
  private readonly validationStore = inject(ModelValidationStore);
  private readonly shapeSelector = inject(MaxGraphShapeSelectorService);
  private readonly graphNavigator = inject(GraphNavigatorPort);
  private readonly tabsStore = inject(TabsStore);
  private readonly fileHandlingService = inject(FileHandlingService);
  private readonly notificationsService = inject(NotificationsService);
  private readonly translate = inject(LanguageTranslationService);
  private readonly modelDocumentService = inject(ModelDocumentService);
  private readonly loadedFilesService = inject(LoadedFilesService);
  private readonly modelSavingTracker = inject(ModelSavingTrackerService);
  private readonly tabStateService = inject(TabStateService);
  private readonly prefixManagementService = inject(PrefixManagementService);
  private readonly settings = toSignal(inject(ConfigurationService).settings$);

  private readonly reload$ = new Subject<void>();
  private editor: TurtleEditor | null = null;
  private destroyed = false;
  private revealSelectionOnLoad = true;
  private problemCursor = -1;

  protected readonly loading = createDebouncedLoading();
  public readonly state = signal<TextViewState>('loading');
  public readonly content = signal('');
  public readonly formatted = signal(true);
  public readonly targetLine = signal<number | null>(null);
  public readonly canSortElements = computed(() => this.settings()?.elementOrderStrategy !== 'formatterDefault');
  public readonly lineCount = computed(() => (this.content() ? this.content().split('\n').length : 0));

  /** Referenced elements that are missing in the workspace; read from the loaded files whenever the text is created. */
  public readonly unresolvedUrns = signal<string[]>([]);

  /** Validation issues and missing references, located in the text. */
  public readonly problems = computed<TextProblem[]>(() => {
    const text = this.content();
    if (!text) {
      return [];
    }

    const problems: TextProblem[] = [];
    for (const violation of this.validationStore.violations()) {
      const range = findElementRange(text, violation.focusNode);
      if (range) {
        problems.push({...range, kind: 'violation', message: violation.message});
      }
    }
    for (const urn of this.unresolvedUrns()) {
      const message = this.translateText('textView.unresolvedReference', {urn});
      problems.push(...findElementOccurrences(text, urn).map(range => ({...range, kind: 'unresolved' as const, message})));
    }
    return problems.sort((a, b) => a.from - b.from);
  });

  /** Missing elements that are not written in this text, e.g. because only a referenced file uses them. */
  public readonly indirectUnresolvedUrns = computed(() => {
    const text = this.content();
    return this.unresolvedUrns().filter(urn => !findElementOccurrences(text, urn).length);
  });

  public readonly problemCount = computed(() => this.problems().length + this.indirectUnresolvedUrns().length);

  public readonly problemsTooltip = computed(() => {
    const next = this.problems().length ? this.translateText('textView.nextProblem') : '';
    const indirect = this.indirectUnresolvedUrns();
    const missing = indirect.length ? this.translateText('textView.indirectUnresolved', {elements: indirect.join(', ')}) : '';
    return [next, missing].filter(Boolean).join(' ');
  });

  constructor() {
    afterNextRender(() => void this.createEditor());

    this.reload$
      .pipe(
        debounceTime(RELOAD_DEBOUNCE_MS),
        tap(() => this.loading.show()),
        switchMap(() =>
          this.textService.load().pipe(
            map(text => ({text})),
            catchError(error => of({error})),
          ),
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(result => {
        this.loading.hide();
        if ('error' in result) {
          console.error('Could not create the textual representation of the aspect model', result.error);
          this.state.set('error');
          return;
        }
        this.applyText(result.text);
      });

    this.prefixManagementService.prefixesChanged$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.reload());

    effect(() => {
      this.tabsStore.activeTabId();
      this.graphNavigator.graphVersion();
      untracked(() => this.reload());
    });

    effect(() => {
      const problems = this.problems();
      untracked(() => this.editor?.setProblems(problems));
    });

    effect(() => {
      const targetLine = this.targetLine();
      untracked(() => this.editor?.setTargetLine(targetLine));
    });

    effect(() => {
      const request = this.viewMode.revealRequest();
      if (request && this.state() === 'ready') {
        untracked(() => {
          this.revealElement(request.urn);
          this.viewMode.clearRevealRequest(request.id);
        });
      }
    });

    let lastSearchRequest = this.viewMode.searchRequest();
    effect(() => {
      const searchRequest = this.viewMode.searchRequest();
      if (searchRequest !== lastSearchRequest) {
        lastSearchRequest = searchRequest;
        untracked(() => this.openSearch());
      }
    });

    this.destroyRef.onDestroy(() => {
      this.destroyed = true;
      this.loading.destroy();
      this.editor?.destroy();
      this.editor = null;
    });
  }

  reload(): void {
    if (!this.content()) {
      this.state.set('loading');
    }
    this.reload$.next();
  }

  /** Sorts the elements of the file alphabetically; the order is written with the next save. */
  sortAlphabetically(): void {
    const rdfModel = this.loadedFilesService.currentLoadedFile?.rdfModel;
    if (!rdfModel || !this.canSortElements()) {
      return;
    }
    this.modelDocumentService.sortAlphabetically(rdfModel);
    this.modelSavingTracker.isSaved$.pipe(take(1)).subscribe(isSaved => {
      this.tabStateService.setTabDirty(this.tabStateService.activeTabId(), !isSaved);
    });
    this.notificationsService.info({title: this.translate.language?.textView?.sorted, timeout: 5000});
    this.reload();
  }

  openPrefixManagement(): void {
    this.prefixManagementService.openManagement();
  }

  copy(): void {
    if (!this.content()) {
      return;
    }
    this.fileHandlingService.copyToClipboardSync(this.content());
    this.notificationsService.info({title: this.translate.language?.textView?.copied, timeout: 3000});
  }

  openSearch(): void {
    this.editor?.openSearch();
  }

  /** Jumps to the next problem in the text; several problems on one line are visited once. */
  goToNextProblem(): void {
    const text = this.content();
    const lines = [...new Set(this.problems().map(({from}) => lineAt(text, from)))];
    if (!lines.length) {
      return;
    }
    this.problemCursor = (this.problemCursor + 1) % lines.length;
    this.goToLine(lines[this.problemCursor]);
  }

  revealElement(urn: string): boolean {
    const line = findElementLine(this.content(), urn);
    if (!line) {
      return false;
    }
    this.goToLine(line);
    return true;
  }

  private goToLine(lineNumber: number): void {
    this.targetLine.set(lineNumber);
    this.editor?.goToLine(lineNumber);
  }

  private applyText({content, formatted}: AspectModelText): void {
    this.formatted.set(formatted);
    this.content.set(content);
    this.state.set(content ? 'ready' : 'empty');
    this.unresolvedUrns.set(this.loadedFilesService.unresolvedElementUrns());
    this.problemCursor = -1;

    this.editor?.setContent(content);

    this.targetLine.set(null);
    if (!content) {
      return;
    }

    const request = this.viewMode.revealRequest();
    if (request) {
      this.revealElement(request.urn);
      this.viewMode.clearRevealRequest(request.id);
    } else if (this.revealSelectionOnLoad) {
      this.revealSelectedCell();
    }
    this.revealSelectionOnLoad = false;
  }

  private revealSelectedCell(): void {
    const selectedCells = this.shapeSelector.selectedCells() ?? [];
    if (selectedCells.length !== 1) {
      return;
    }
    const urn = MaxGraphHelper.getModelElement(selectedCells[0])?.aspectModelUrn;
    if (urn) {
      this.revealElement(urn);
    }
  }

  private async createEditor(): Promise<void> {
    // CodeMirror is only loaded once the text view is opened for the first time.
    const {createTurtleEditor} = await import('./turtle-editor');
    if (this.destroyed) {
      return;
    }
    this.editor = createTurtleEditor(this.host().nativeElement, this.content());
    this.editor.setProblems(this.problems());
    this.editor.setTargetLine(this.targetLine());
    const targetLine = this.targetLine();
    if (targetLine) {
      this.editor.goToLine(targetLine);
    }
  }

  private translateText(key: string, params?: Record<string, string>): string {
    return this.translate.translateService.translate(key, params);
  }
}
