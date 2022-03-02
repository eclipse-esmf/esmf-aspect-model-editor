/*
 * Copyright (c) 2020 Robert Bosch Manufacturing Solutions GmbH, Germany. All rights reserved.
 */

import {DefaultConstraint} from './default-constraint';

export interface RegularExpressionConstraint {
  value: string;
}

export class DefaultRegularExpressionConstraint extends DefaultConstraint implements RegularExpressionConstraint {
  static createInstance() {
    return new DefaultRegularExpressionConstraint(null, null, 'Constraint', null);
  }

  get className() {
    return 'DefaultRegularExpressionConstraint';
  }

  constructor(metaModelVersion: string, aspectModelUrn: string, name: string, public value: string) {
    super(metaModelVersion, aspectModelUrn, name);
  }
}
