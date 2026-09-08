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

import {describe, expect, it} from 'vitest';
import {AssetsPath, ELECTRON_EVENTS, NotificationType, SaveValidateErrorsCodes, ValidateStatus} from './index';

describe('Shared Enums', () => {
  it('should define AssetsPath values', () => {
    expect(AssetsPath.Copy).toBe('config/editor/img/copy.svg');
    expect(AssetsPath.DeleteIcon).toBe('config/editor/img/delete.svg');
    expect(AssetsPath.FormatIcon).toBe('config/editor/img/schema.svg');
    expect(AssetsPath.OpenIcon).toBe('config/editor/img/jump-to-element.svg');
  });

  it('should define ELECTRON_EVENTS request, response, and signal events', () => {
    expect(ELECTRON_EVENTS.REQUEST.CREATE_WINDOW).toBe('CREATE_WINDOW');
    expect(ELECTRON_EVENTS.REQUEST.CLOSE_WINDOW).toBe('CLOSE_WINDOW');
    expect(ELECTRON_EVENTS.RESPONSE.IS_FIRST_WINDOW).toBe('IS_FIRST_WINDOW');
    expect(ELECTRON_EVENTS.SIGNAL.LOAD_FILE).toBe('LOAD_FILE');
    expect(ELECTRON_EVENTS.SIGNAL.SAVE_TO_WORKSPACE).toBe('SAVE_TO_WORKSPACE');
    expect(ELECTRON_EVENTS.SIGNAL.ZOOM_IN).toBe('ZOOM_IN');
  });

  it('should define NotificationType values', () => {
    expect(NotificationType.Warning).toBe('WARNING');
    expect(NotificationType.Info).toBe('INFO');
    expect(NotificationType.Error).toBe('ERROR');
    expect(NotificationType.Success).toBe('SUCCESS');
  });

  it('should define SaveValidateErrorsCodes and ValidateStatus', () => {
    expect(SaveValidateErrorsCodes.emptyModel).toBe('empty_model');
    expect(SaveValidateErrorsCodes.desynchronized).toBe('desynchronized');
    expect(ValidateStatus.validating).toBe('validating');
  });
});
