/*
 * Copyright (c) 2020 Robert Bosch Manufacturing Solutions GmbH, Germany. All rights reserved.
 */
import {DefaultConstraint} from './default-constraint';

export interface FixedPointConstraint {
  scale: number;
  integer: number;
}

export class DefaultFixedPointConstraint extends DefaultConstraint implements FixedPointConstraint {
  static createInstance() {
    return new DefaultFixedPointConstraint(null, null, 'Constraint', null, null);
  }

  get className() {
    return 'DefaultFixedPointConstraint';
  }

  constructor(metaModelVersion: string, aspectModelUrn: string, name: string, public scale: number, public integer: number) {
    super(metaModelVersion, aspectModelUrn, name);
  }
}
