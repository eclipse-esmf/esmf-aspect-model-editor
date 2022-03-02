/*
 * Copyright (c) 2020 Robert Bosch Manufacturing Solutions GmbH, Germany. All rights reserved.
 */

import {Type} from './type';

export class DefaultScalar implements Type {
  get className() {
    return 'DefaultScalar';
  }

  constructor(private urn: string) {}

  getUrn(): string {
    return this.urn;
  }

  isComplex(): boolean {
    return false;
  }

  isScalar(): boolean {
    return true;
  }
}
