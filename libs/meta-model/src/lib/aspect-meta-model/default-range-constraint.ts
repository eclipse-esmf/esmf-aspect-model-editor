/*
 * Copyright (c) 2020 Robert Bosch Manufacturing Solutions GmbH, Germany. All rights reserved.
 */

import {DefaultConstraint} from './default-constraint';
import {BoundDefinition} from './bound-definition';

export interface RangeConstraint {
  minValue?: number;
  maxValue?: number;
}

export class DefaultRangeConstraint extends DefaultConstraint implements RangeConstraint {
  static createInstance() {
    return new DefaultRangeConstraint(null, null, 'Constraint', BoundDefinition.LESS_THAN, BoundDefinition.GREATER_THAN, null, null);
  }

  get className() {
    return 'DefaultRangeConstraint';
  }

  constructor(
    metaModelVersion: string,
    aspectModelUrn: string,
    name: string,
    public upperBoundDefinition: BoundDefinition,
    public lowerBoundDefinition: BoundDefinition,
    public minValue?: any,
    public maxValue?: any
  ) {
    super(metaModelVersion, aspectModelUrn, name);
  }
}
