/*
 * Copyright (c) 2020 Robert Bosch Manufacturing Solutions GmbH, Germany. All rights reserved.
 */

import {DefaultConstraint} from './default-constraint';

export interface LengthConstraint {
  minValue?: number;
  maxValue?: number;
}

export class DefaultLengthConstraint extends DefaultConstraint implements LengthConstraint {
  static createInstance() {
    return new DefaultLengthConstraint(null, null, 'Constraint', null, null);
  }

  get className() {
    return 'DefaultLengthConstraint';
  }

  constructor(metaModelVersion: string, aspectModelUrn: string, name: string, public minValue?: number, public maxValue?: number) {
    super(metaModelVersion, aspectModelUrn, name);
  }
}
