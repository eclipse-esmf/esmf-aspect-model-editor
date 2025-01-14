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

import {HttpHeaders} from '@angular/common/http';

export class HttpHeaderBuilder {
  private httpHeaders: HttpHeaders;

  constructor() {
    this.httpHeaders = new HttpHeaders();
  }

  withContentTypeRdfTurtle(): HttpHeaderBuilder {
    this.httpHeaders = this.httpHeaders.append('Content-Type', 'text/turtle');
    return this;
  }

  withTextContentType(): HttpHeaderBuilder {
    this.httpHeaders = this.httpHeaders.append('Content-Type', 'text');
    return this;
  }

  withAspectModelUrn(urn: string): HttpHeaderBuilder {
    this.httpHeaders = this.httpHeaders.append('aspect-model-urn', urn);
    return this;
  }

  // TODO withUrn, withNamespace and withFileName can be removed
  withUrn(urn: string): HttpHeaderBuilder {
    this.httpHeaders = this.httpHeaders.append('Ame-Model-Urn', urn);
    return this;
  }

  withNamespace(namespace: string): HttpHeaderBuilder {
    this.httpHeaders = this.httpHeaders.append('namespace', namespace);
    return this;
  }

  withFileName(fileName: string): HttpHeaderBuilder {
    if (fileName) {
      this.httpHeaders = this.httpHeaders.append('file-name', fileName.endsWith('.ttl') ? fileName : fileName + '.ttl');
    }

    return this;
  }

  build(): HttpHeaders {
    return this.httpHeaders;
  }
}
