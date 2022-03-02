/*
 * Copyright (c) 2020 Robert Bosch Manufacturing Solutions GmbH, Germany. All rights reserved.
 */
import {AspectModelVisitor} from '@bame/mx-graph';
import {Base, BaseMetaModelElement} from './base';

export type Constraint = BaseMetaModelElement;

export class DefaultConstraint extends Base implements Constraint {
  static createInstance() {
    return new DefaultConstraint(null, null, 'Constraint');
  }

  get className() {
    return 'DefaultConstraint';
  }

  constructor(metaModelVersion: string, aspectModelUrn: string, name: string) {
    super(metaModelVersion, aspectModelUrn, name);
  }

  accept<T, U>(visitor: AspectModelVisitor<T, U>, context: U): T {
    return visitor.visitConstraint(this, context);
  }
}
