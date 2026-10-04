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
import {ClipboardService, DialogCloseButtonComponent, LanguageTranslationService, NotificationsService} from '@ame/shared';
import {Component, DestroyRef, inject, signal} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {MatButtonModule} from '@angular/material/button';
import {MAT_DIALOG_DATA, MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {MatSelectModule} from '@angular/material/select';
import {TranslocoDirective} from '@jsverse/transloco';
import {saveAs} from 'file-saver';
import * as locale from 'locale-codes';
import {Observable} from 'rxjs';
import {finalize, first} from 'rxjs/operators';

export interface PreviewDialogOptions {
  title?: string;
  content?: string;
  fileName?: string;
  /** Languages the content can be generated in. A language switch is shown for more than one language. */
  languages?: string[];
  /** Language of the initial content. */
  language?: string;
  /** Generates the content again in another language. */
  regenerate?: (language: string) => Observable<string>;
}

@Component({
  selector: 'ame-preview-dialog',
  templateUrl: './preview-dialog.component.html',
  styleUrls: ['./preview-dialog.component.scss'],
  imports: [
    DialogCloseButtonComponent,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressBarModule,
    MatSelectModule,
    TranslocoDirective,
  ],
})
export class PreviewDialogComponent {
  private data = inject<PreviewDialogOptions>(MAT_DIALOG_DATA);
  private dialogRef = inject(MatDialogRef<PreviewDialogComponent>);
  private destroyRef = inject(DestroyRef);
  private clipboard = inject(ClipboardService);
  private notificationsService = inject(NotificationsService);
  private translate = inject(LanguageTranslationService);

  private initialContent: string;
  private fileName: string;

  public content = signal('');
  public title = signal('');
  public language = signal('');
  public regenerating = signal(false);
  public readonly languages: {tag: string; name: string}[];

  constructor() {
    this.title.set(this.data.title);
    this.content.set(this.data.content);
    this.language.set(this.data.language ?? '');

    this.initialContent = this.data.content;
    this.fileName = this.data.fileName;
    this.languages = this.data.regenerate ? (this.data.languages ?? []).map(tag => ({tag, name: locale.getByTag(tag)?.name ?? tag})) : [];
  }

  get hasLanguageSwitch(): boolean {
    return this.languages.length > 1;
  }

  changeLanguage(language: string): void {
    if (!language || language === this.language() || !this.data.regenerate) return;

    const previous = this.language();
    this.language.set(language);
    this.regenerating.set(true);
    this.data
      .regenerate(language)
      .pipe(
        first(),
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.regenerating.set(false)),
      )
      .subscribe({
        next: content => {
          this.initialContent = content;
          this.content.set(content);
        },
        error: () => this.language.set(previous),
      });
  }

  onDownload() {
    saveAs(
      new Blob([this.content()], {
        type: 'application/json;charset=utf-8',
      }),
      this.fileName,
    );
  }

  onCopyToClipboard() {
    this.clipboard.copy(this.content());
    this.notificationsService.success({title: this.translate.translateService.translate('previewDialog.copied'), timeout: 3000});
  }

  reset() {
    this.content.set(this.initialContent);
  }
}
