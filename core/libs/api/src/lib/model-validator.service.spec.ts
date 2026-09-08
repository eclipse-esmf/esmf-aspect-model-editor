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

import {MaxGraphService} from '@ame/max-graph';
import {NotificationsService} from '@ame/shared';
import {TestBed} from '@angular/core/testing';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {ModelValidatorService} from './model-validator.service';
import {ViolationError} from './models';

describe('ModelValidatorService', () => {
  let service: ModelValidatorService;
  let maxgraphService: {showValidationErrorOnShape: ReturnType<typeof vi.fn>};
  let notificationsService: {
    clearNotifications: ReturnType<typeof vi.fn>;
    info: ReturnType<typeof vi.fn>;
    warning: ReturnType<typeof vi.fn>;
    validationError: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    maxgraphService = {showValidationErrorOnShape: vi.fn()};
    notificationsService = {
      clearNotifications: vi.fn(),
      info: vi.fn(),
      warning: vi.fn(),
      validationError: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        ModelValidatorService,
        {provide: MaxGraphService, useValue: maxgraphService},
        {provide: NotificationsService, useValue: notificationsService},
      ],
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should be created and clear notifications on instantiation', () => {
    service = TestBed.inject(ModelValidatorService);

    expect(service).toBeTruthy();
    expect(notificationsService.clearNotifications).toHaveBeenCalledTimes(1);
  });

  describe('notifyCorrectableErrors', () => {
    beforeEach(() => {
      service = TestBed.inject(ModelValidatorService);
    });

    it('should do nothing when there are no violation errors and validInfo is not set', () => {
      service.notifyCorrectableErrors([]);

      expect(notificationsService.info).not.toHaveBeenCalled();
      expect(notificationsService.warning).not.toHaveBeenCalled();
      expect(maxgraphService.showValidationErrorOnShape).not.toHaveBeenCalled();
    });

    it('should notify success when there are no violation errors and validInfo is true', () => {
      const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => undefined);

      service.notifyCorrectableErrors([], true);

      expect(notificationsService.info).toHaveBeenCalledWith({
        title: 'Validation completed successfully',
        message: 'The model is valid',
      });
      expect(infoSpy).toHaveBeenCalled();
    });

    it('should notify a warning and each violation error, and highlight the shape', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
      const violationErrors: ViolationError[] = [
        {message: 'Error 1', focusNode: 'urn:samm:node1', fix: ['fix 1a', 'fix 1b']},
        {message: 'Error 2', focusNode: 'urn:samm:node2', fix: ['fix 2']},
      ];

      service.notifyCorrectableErrors(violationErrors);

      expect(notificationsService.warning).toHaveBeenCalledWith({
        title: 'Validation completed with errors',
        message: 'The model is not valid',
      });
      expect(warnSpy).toHaveBeenCalled();

      expect(notificationsService.validationError).toHaveBeenCalledTimes(2);
      expect(notificationsService.validationError).toHaveBeenNthCalledWith(1, {
        title: 'Error 1',
        message: 'fix 1a; fix 1b',
        link: 'urn:samm:node1',
        timeout: 5000,
      });
      expect(notificationsService.validationError).toHaveBeenNthCalledWith(2, {
        title: 'Error 2',
        message: 'fix 2',
        link: 'urn:samm:node2',
        timeout: 5000,
      });

      expect(maxgraphService.showValidationErrorOnShape).toHaveBeenCalledTimes(2);
      expect(maxgraphService.showValidationErrorOnShape).toHaveBeenNthCalledWith(1, 'urn:samm:node1');
      expect(maxgraphService.showValidationErrorOnShape).toHaveBeenNthCalledWith(2, 'urn:samm:node2');
    });

    it('should not notify success when validInfo is true but there are violation errors', () => {
      service.notifyCorrectableErrors([{message: 'Error', focusNode: 'urn:samm:node', fix: ['fix']}], true);

      expect(notificationsService.info).not.toHaveBeenCalled();
      expect(notificationsService.warning).toHaveBeenCalled();
    });
  });
});
