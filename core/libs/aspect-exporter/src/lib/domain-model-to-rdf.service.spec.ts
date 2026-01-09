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

import {TestBed} from '@angular/core/testing';
import {describe, expect, it} from '@jest/globals';

import {DomainModelToRdfService} from '@ame/aspect-exporter';
import {provideMockObject} from '../../../../jest-helpers';

jest.mock('@ame/editor', () => ({
  ModelElementEditorComponent: class {},
}));

jest.mock('@esmf/aspect-model-loader', () => {
  class NamedElement {}
  class DefaultValue extends NamedElement {
    metaModelVersion!: string;
    aspectModelUrn!: string;
    name!: string;
    value!: string;
    isPredefined?: boolean;

    constructor(data: any) {
      super();
      Object.assign(this, data);
    }
    getPreferredName(lang: string) {
      if (lang === 'en') return 'Value EN';
      return undefined;
    }
    getDescription(lang: string) {
      if (lang === 'en') return 'Description EN';
      return undefined;
    }
    getSee() {
      return [];
    }
    getValue() {
      return this.value;
    }
  }

  class ModelElementCache {}

  return {DefaultValue, ModelElementCache};
});

describe('DomainModelToRdfService', () => {
  let service: DomainModelToRdfService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: DomainModelToRdfService,
          useValue: provideMockObject(DomainModelToRdfService),
        },
      ],
    });
    service = TestBed.inject(DomainModelToRdfService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
