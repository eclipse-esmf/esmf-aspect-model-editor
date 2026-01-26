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

import {readFile} from '@ame/utils';
import {lastValueFrom} from 'rxjs';

jest.mock('@ame/editor', () => ({
  ModelElementEditorComponent: class {},
}));

describe('utils', () => {
  it('should return parsed file content', async () => {
    const fileContent = 'foo';
    const file = new File([fileContent], 'test.txt');
    const result = await lastValueFrom(readFile(file));
    expect(result).toEqual(fileContent);
  });

  it('should complete the stream after first emit', done => {
    const fileContent = 'foo';
    const file = new File([fileContent], 'test.txt');
    const nextMock = jest.fn();
    const errorMock = jest.fn();

    readFile(file).subscribe({
      next: nextMock,
      error: errorMock,
      complete: () => {
        expect(nextMock).toHaveBeenCalledTimes(1);
        expect(nextMock).toHaveBeenCalledWith(fileContent);
        expect(errorMock).not.toHaveBeenCalled();
        done();
      },
    });
  });

  it('should emit error', done => {
    const invalidFile = null;
    const nextMock = jest.fn();
    const completeMock = jest.fn();

    readFile(invalidFile).subscribe({
      next: nextMock,
      error: err => {
        expect(nextMock).not.toHaveBeenCalled();
        expect(completeMock).not.toHaveBeenCalled();
        expect(err).toBeInstanceOf(Error);
        expect(err.message).toBeTruthy();
        done();
      },
      complete: () => completeMock,
    });
  });
});
