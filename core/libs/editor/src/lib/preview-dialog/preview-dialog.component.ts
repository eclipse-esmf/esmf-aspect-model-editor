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
import {Component, inject, signal} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MAT_DIALOG_DATA, MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {TranslocoDirective} from '@jsverse/transloco';
import {saveAs} from 'file-saver';

interface PreviewDialogOptions {
  title?: string;
  content?: string;
  fileName?: string;
}

@Component({
  selector: 'ame-preview-dialog',
  templateUrl: './preview-dialog.component.html',
  styleUrls: ['./preview-dialog.component.scss'],
  imports: [MatDialogModule, MatIconModule, MatFormFieldModule, MatInputModule, MatButtonModule, TranslocoDirective],
})
export class PreviewDialogComponent {
  private data = inject<PreviewDialogOptions>(MAT_DIALOG_DATA);
  private dialogRef = inject(MatDialogRef<PreviewDialogComponent>);

  private initialContent: string;
  private fileName: string;

  public content = signal('');
  public title = signal('');

  constructor() {
    this.title.set(this.data.title);
    this.content.set(this.data.content);

    this.initialContent = this.data.content;
    this.fileName = this.data.fileName;
  }

  onClose(): void {
    this.dialogRef.close();
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
    navigator.clipboard.writeText(this.content());
  }

  reset() {
    this.content.set(this.initialContent);
  }
}
