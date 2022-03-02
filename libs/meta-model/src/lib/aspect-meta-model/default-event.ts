/*
 * Copyright (c) 2020 Robert Bosch Manufacturing Solutions GmbH, Germany. All rights reserved.
 */

import {Base, BaseMetaModelElement} from './base';
import {AspectModelVisitor} from '@bame/mx-graph';
import {OverWrittenProperty} from './overwritten-property';
import {Bamm} from '@bame/vocabulary';

export interface Event extends BaseMetaModelElement {
  parameters: Array<OverWrittenProperty>;
}

export class DefaultEvent extends Base implements Event {
  static createInstance() {
    return new DefaultEvent(null, null, 'event', []);
  }

  get className() {
    return 'DefaultEvent';
  }

  constructor(
    metaModelVersion: string,
    aspectModelUrn: string,
    name: string,
    public parameters: Array<OverWrittenProperty> = []
  ) {
    super(metaModelVersion, aspectModelUrn, name);
  }

  accept<T, U>(visitor: AspectModelVisitor<T, U>, context: U): T {
    return visitor.visitEvent(this, context);
  }

  delete(baseMetalModelElement: BaseMetaModelElement) {
    this.parameters = this.parameters
      .filter(overwrittenProperty => overwrittenProperty.property.aspectModelUrn !== baseMetalModelElement.aspectModelUrn);
  }

  isPredefined(): boolean {
    return this.aspectModelUrn ? this.aspectModelUrn.startsWith(`${Bamm.BASE_URI}event:${this.metaModelVersion}#`) : false;
  }
}
