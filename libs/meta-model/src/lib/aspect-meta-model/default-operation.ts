/*
 * Copyright (c) 2020 Robert Bosch Manufacturing Solutions GmbH, Germany. All rights reserved.
 */

import {Base, BaseMetaModelElement} from './base';
import {AspectModelVisitor} from '@bame/mx-graph';
import {OverWrittenProperty} from './overwritten-property';

export interface Operation extends BaseMetaModelElement {
  input: Array<OverWrittenProperty>;
  output?: OverWrittenProperty;
}

export class DefaultOperation extends Base implements Operation {
  static createInstance() {
    return new DefaultOperation(null, null, 'operation', [], null);
  }

  get className() {
    return 'DefaultOperation';
  }

  constructor(
    metaModelVersion: string,
    aspectModelUrn: string,
    name: string,
    public input: Array<OverWrittenProperty> = [],
    public output?: OverWrittenProperty
  ) {
    super(metaModelVersion, aspectModelUrn, name);
  }

  accept<T, U>(visitor: AspectModelVisitor<T, U>, context: U): T {
    return visitor.visitOperation(this, context);
  }

  delete(baseMetalModelElement: BaseMetaModelElement) {
    if (this.output && this.output.property.aspectModelUrn === baseMetalModelElement.aspectModelUrn) {
      this.output = null;
    }

    this.input = this.input.filter(inputProperty => inputProperty.property.aspectModelUrn !== baseMetalModelElement.aspectModelUrn);
  }
}
