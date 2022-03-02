/*
 * Copyright (c) 2020 Robert Bosch Manufacturing Solutions GmbH, Germany. All rights reserved.
 */
import {AspectModelVisitor} from '@bame/mx-graph';
import {DefaultConstraint} from './default-constraint';

export interface EncodingConstraint {
  value: string;
}

export class DefaultEncodingConstraint extends DefaultConstraint implements EncodingConstraint {
  static createInstance() {
    return new DefaultEncodingConstraint(null, null, 'Constraint', null);
  }

  get className() {
    return 'DefaultEncodingConstraint';
  }

  constructor(metaModelVersion: string, aspectModelUrn: string, name: string, public value: string) {
    super(metaModelVersion, aspectModelUrn, name);
  }

  accept<T, U>(visitor: AspectModelVisitor<T, U>, context: U): T {
    return visitor.visitConstraint(this, context);
  }
}
