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

import {inject, Injectable} from '@angular/core';
import {RdfModel, SerializationMetadata} from '@esmf/aspect-model-loader';
import {ConfigurationService} from '../state/settings/configuration.service';

/**
 * Resolves the comment header (e.g. copyright) of an Aspect Model file.
 * Every file keeps its own header; the configured copyright header is only the default for models without a source file.
 */
@Injectable({providedIn: 'root'})
export class ModelHeaderService {
  private readonly configurationService = inject(ConfigurationService);

  getHeader(rdfModel?: RdfModel | null): string[] {
    return rdfModel?.serializationMetadata?.headerComments ?? this.configurationService.getSettings()?.copyrightHeader ?? [];
  }

  /** The header comment lines without separating blank lines, as shown to the user. */
  getHeaderText(rdfModel?: RdfModel | null): string {
    return this.getHeader(rdfModel).join('\n').replace(/\n+$/, '');
  }

  setHeaderText(rdfModel: RdfModel | null | undefined, text: string): void {
    const metadata = rdfModel?.serializationMetadata;
    if (!metadata || text.replace(/\n+$/, '') === this.getHeaderText(rdfModel)) {
      return;
    }
    const lines = text ? text.replace(/\n+$/, '').split('\n') : [];
    metadata.headerComments = lines.length ? [...lines, ''] : [];
  }

  withHeader(content: string, rdfModel?: RdfModel | null): string {
    const header = this.getHeader(rdfModel);
    // Without a recorded separator the header is followed by an empty line, the common layout of Aspect Model files.
    const normalized =
      header.length && header[header.length - 1] !== '' && !rdfModel?.serializationMetadata?.headerComments ? [...header, ''] : header;
    return SerializationMetadata.applyHeader(content, normalized);
  }
}
