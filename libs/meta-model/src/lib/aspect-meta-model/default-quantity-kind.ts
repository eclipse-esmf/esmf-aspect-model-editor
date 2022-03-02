/*
 * Copyright (c) 2020 Robert Bosch Manufacturing Solutions GmbH, Germany. All rights reserved.
 */

import {IsNamed} from './is-named';
import {Base} from './base';
import {AspectModelVisitor} from '@bame/mx-graph';

export interface QuantityKind extends IsNamed {
  label: string;
}

export class DefaultQuantityKind extends Base implements QuantityKind {
  get className() {
    return 'DefaultQuantityKind';
  }

  constructor(metaModelVersion: string, aspectModelUrn: string, name: string, public label: string) {
    super(metaModelVersion, aspectModelUrn, name);
  }

  accept<T, U>(visitor: AspectModelVisitor<T, U>, context: U): T {
    return visitor.visitQuantityKind(this, context);
  }
}
