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

import {Injectable} from '@angular/core';
import {fromEvent, Observable, switchMap} from 'rxjs';
import {finalize, first} from 'rxjs/operators';

export enum FileTypes {
  TTL = '.ttl',
  ZIP = '.zip',
}

@Injectable({
  providedIn: 'root',
})
export class FileUploadService {
  selectFile(acceptedTypes?: FileTypes[]): Observable<File> {
    const fileInput = this.createFileInput(acceptedTypes);
    const listener = this.createFileSelectListener(fileInput);
    fileInput.click();

    return listener;
  }

  private createFileInput(acceptedTypes?: FileTypes[]): HTMLInputElement {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.style.display = 'none';

    if (acceptedTypes?.length) {
      fileInput.accept = acceptedTypes.join(',');
    }

    return fileInput;
  }

  private createFileSelectListener(fileInput: HTMLInputElement): Observable<File> {
    return fromEvent(fileInput, 'change').pipe(
      switchMap(() => (fileInput?.files?.length ? [fileInput.files[0]] : [])),
      first(),
      finalize(() => this.removeFileInput(fileInput)),
    );
  }

  private removeFileInput(fileInput: HTMLInputElement) {
    if (!fileInput?.parentNode) return;

    fileInput.parentNode.removeChild(fileInput);
    fileInput = null;
  }
}
