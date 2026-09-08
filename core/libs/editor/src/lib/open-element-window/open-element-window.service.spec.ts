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

import {LoadedFilesService} from '@ame/cache';
import {TestBed} from '@angular/core/testing';
import {MatDialog} from '@angular/material/dialog';
import {DefaultEntity} from '@esmf/aspect-model-loader';
import {MockProvider} from 'ng-mocks';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {OpenElementWindowComponent} from './open-element-window.component';
import {OpenReferencedElementService} from './open-element-window.service';

describe('OpenReferencedElementService', () => {
  let service: OpenReferencedElementService;
  let dialog: MatDialog;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        OpenReferencedElementService,
        {
          provide: MatDialog,
          useValue: {
            open: vi.fn(),
          },
        },
        MockProvider(LoadedFilesService, {
          getFileFromElement: vi.fn(() => 'test.ttl'),
        }),
      ],
    });

    service = TestBed.inject(OpenReferencedElementService);
    dialog = TestBed.inject(MatDialog);
  });

  it('should do nothing if element is null', () => {
    service.openReferencedElement(null);
    expect(dialog.open).not.toHaveBeenCalled();
  });

  it('should open dialog with correct file and urn for valid element', () => {
    const element = new DefaultEntity({
      aspectModelUrn: 'urn:test:1.0.0#MyEntity',
      name: 'MyEntity',
      metaModelVersion: '2.0.0',
    });

    service.openReferencedElement(element);

    expect(dialog.open).toHaveBeenCalledWith(OpenElementWindowComponent, {
      data: {
        file: 'test.ttl',
        urn: 'urn:test:1.0.0#MyEntity',
      },
    });
  });
});
