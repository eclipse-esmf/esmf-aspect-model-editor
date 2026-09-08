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

import {TestBed} from '@angular/core/testing';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {FileTypes, FileUploadService} from './file-upload.service';

describe('FileUploadService', () => {
  let service: FileUploadService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [FileUploadService],
    });

    service = TestBed.inject(FileUploadService);
  });

  it('selectFile should create file input and listen for change', async () => {
    let createdInput: HTMLInputElement = null;
    const origCreateElement = document.createElement.bind(document);
    vi.spyOn(document, 'createElement').mockImplementation(tagName => {
      const el = origCreateElement(tagName);
      if (tagName === 'file' || tagName === 'input') {
        createdInput = el as HTMLInputElement;
      }
      return el;
    });

    const file = new File(['content'], 'test.ttl', {type: 'text/turtle'});

    const selectPromise = new Promise<File>(resolve => {
      service.selectFile([FileTypes.TTL]).subscribe(resolve);
    });

    if (createdInput) {
      Object.defineProperty(createdInput, 'files', {
        value: [file],
      });
      createdInput.dispatchEvent(new Event('change'));
    }

    const selectedFile = await selectPromise;
    expect(selectedFile).toBe(file);
  });
});
