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

import {Observable} from 'rxjs';

/**
 * Reads file via FileReader
 *
 * @param file specific file retrieved from a FileList object
 * @returns Observable with file content represented as a string
 * (completes automatically after receiving file's content)
 */
export const readFile = (file: File): Observable<string> => {
  return new Observable(observer => {
    const reader = new FileReader();
    try {
      reader.onload = () => {
        observer.next(reader.result.toString());
        observer.complete();
      };
      reader.readAsText(file);
    } catch (error) {
      console.error(`An error occurred while attempting to read "${file.name}" file:`, error);
      reader.onerror = () => observer.error(error);
    }
  });
};

/**
 * Creates a new File instance with the given file content
 *
 * @param content a content to be used in the file
 * @param fileName a name of the file
 * @param mimeType MIME type to be used (default is 'text/plain')
 * @returns new File instance
 */
export const createFile = (content: string | BufferSource | number[], fileName: string, mimeType = 'text/plain'): File => {
  const data = Array.isArray(content) ? new Uint8Array(content) : (content as any);
  const blob = new Blob([data], {type: mimeType});
  return new File([blob], fileName, {type: mimeType});
};

/**
 * Decodes Buffer-like content back to its string representation
 *
 * @param content data to decode
 * @param encoding is an encoding type to be used while decoding (default is 'utf-8')
 * @returns decoded string
 */
export const decodeText = (content: BufferSource | number[] | string, encoding = 'utf-8'): string => {
  if (typeof content === 'string') return content;
  const data = Array.isArray(content) ? new Uint8Array(content) : (content as BufferSource);
  const decoder = new TextDecoder(encoding);
  return decoder.decode(data);
};
