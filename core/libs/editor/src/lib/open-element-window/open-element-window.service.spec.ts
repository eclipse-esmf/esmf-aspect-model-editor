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

import {LoadedFilesService} from '@ame/domain';
import {TestBed} from '@angular/core/testing';
import {DefaultEntity} from '@esmf/aspect-model-loader';
import {MockProvider} from 'ng-mocks';
import {of} from 'rxjs';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {ModelOpenerService} from '../model-opener/model-opener.service';
import {OpenReferencedElementService} from './open-element-window.service';

describe('OpenReferencedElementService', () => {
  let service: OpenReferencedElementService;
  let modelOpenerService: ModelOpenerService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        OpenReferencedElementService,
        MockProvider(LoadedFilesService, {
          getFileFromElement: vi.fn(() => 'test.ttl'),
          getNamespaceFileFromElement: vi.fn(() => ({name: 'test.ttl', namespace: 'org.eclipse.examples:1.0.0'}) as any),
        }),
        MockProvider(ModelOpenerService, {
          promptAndOpen: vi.fn(() => of(true)),
        }),
      ],
    });

    service = TestBed.inject(OpenReferencedElementService);
    modelOpenerService = TestBed.inject(ModelOpenerService);
  });

  it('should do nothing if element is null', () => {
    service.openReferencedElement(null);
    expect(modelOpenerService.promptAndOpen).not.toHaveBeenCalled();
  });

  it('should delegate to ModelOpenerService.promptAndOpen with correct parameters', () => {
    const element = new DefaultEntity({
      aspectModelUrn: 'urn:samm:org.eclipse.examples:1.0.0#MyEntity',
      name: 'MyEntity',
      metaModelVersion: '2.0.0',
    });

    service.openReferencedElement(element);

    expect(modelOpenerService.promptAndOpen).toHaveBeenCalledWith({
      file: 'test.ttl',
      namespace: 'org.eclipse.examples:1.0.0',
      aspectModelUrn: 'urn:samm:org.eclipse.examples:1.0.0#MyEntity',
      editElementUrn: 'urn:samm:org.eclipse.examples:1.0.0#MyEntity',
    });
  });
});
