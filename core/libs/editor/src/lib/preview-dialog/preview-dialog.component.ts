/*
 * Copyright (c) 2024 Robert Bosch Manufacturing Solutions GmbH
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
import {LanguageTranslateModule} from '@ame/translation';
import {CdkTextareaAutosize} from '@angular/cdk/text-field';
import {Component, Inject, ViewChild} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MAT_DIALOG_DATA, MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {saveAs} from 'file-saver';

interface PreviewDialogOptions {
  title?: string;
  content?: string;
  fileName?: string;
}

@Component({
  standalone: true,
  selector: 'ame-preview--dialog',
  templateUrl: './preview-dialog.component.html',
  styleUrls: ['./preview-dialog.component.scss'],
  imports: [MatDialogModule, MatIconModule, MatFormFieldModule, FormsModule, MatInputModule, MatButtonModule, LanguageTranslateModule],
})
export class PreviewDialogComponent {
  @ViewChild('autosize') autosize: CdkTextareaAutosize;

  public initialContent: string;
  public content: string;
  public title: string;
  public fileName: string;

  constructor(
    @Inject(MAT_DIALOG_DATA) private data: PreviewDialogOptions,
    private dialogRef: MatDialogRef<PreviewDialogComponent>,
  ) {
    this.title = data.title;
    this.content = data.content;
    this.initialContent = data.content;
    this.fileName = data.fileName;
  }

  onClose(): void {
    this.dialogRef.close();
  }

  onDownload() {
    saveAs(
      new Blob([this.content], {
        type: 'application/json;charset=utf-8',
      }),
      this.fileName,
    );
  }

  onCopyToClipboard() {
    navigator.clipboard.writeText(this.content);
  }

  reset() {
    this.content = this.initialContent;
  }
}
