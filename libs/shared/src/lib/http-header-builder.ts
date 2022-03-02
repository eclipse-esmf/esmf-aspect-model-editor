/*
 * Copyright (c) 2020 Robert Bosch Manufacturing Solutions GmbH, Germany. All rights reserved.
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

  withUrn(urn: string): HttpHeaderBuilder {
    this.httpHeaders = this.httpHeaders.append('Bame-Model-Urn', urn);
    return this;
  }

  build(): HttpHeaders {
    return this.httpHeaders;
  }
}
