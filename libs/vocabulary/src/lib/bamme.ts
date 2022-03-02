/*
 * Copyright (c) 2020 Robert Bosch Manufacturing Solutions GmbH, Germany. All rights reserved.
 */

import {Bamm} from './bamm';

export class Bamme {
  private alias = 'bamm-e';

  constructor(private bamm: Bamm) {}

  getAlias(): string {
    return this.alias;
  }

  isRelatedNamespace(namespace: string): boolean {
    return namespace.startsWith(this.getUri());
  }

  getUri(): string {
    return `${this.bamm.getBaseUri()}entity:${this.bamm.version}`;
  }

  getNamespace(): string {
    return `${this.getUri()}#`;
  }

  getAspectModelUrn(elementName: string): string {
    return `${this.getNamespace()}${elementName}`;
  }
}
