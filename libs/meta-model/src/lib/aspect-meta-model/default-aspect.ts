/*
 * Copyright (c) 2020 Robert Bosch Manufacturing Solutions GmbH, Germany. All rights reserved.
 */

import {Base, Operation, Event} from './index';
import {BaseMetaModelElement} from './base';
import {HasProperties} from './has-properties';
import {DefaultProperty} from './default-property';
import {DefaultOperation} from './default-operation';
import {OverWrittenProperty} from './overwritten-property';
import {AspectModelVisitor} from '@bame/mx-graph';
import {DefaultEvent} from './default-event';

export interface Aspect extends BaseMetaModelElement, HasProperties {
  operations: Array<Operation>;
  events: Array<Event>;
  isCollectionAspect?: boolean;
}

export class DefaultAspect extends Base implements Aspect {
  get className() {
    return 'DefaultAspect';
  }

  constructor(
    metaModelVersion: string,
    aspectModelUrn: string,
    name: string,
    public properties: Array<OverWrittenProperty> = [],
    public operations: Array<Operation> = [],
    public events: Array<Event> = [],
    public isCollectionAspect: boolean = false
  ) {
    super(metaModelVersion, aspectModelUrn, name);
  }

  accept<T, U>(visitor: AspectModelVisitor<T, U>, context: U): T {
    return visitor.visitAspect(this, context);
  }

  delete(baseMetalModelElement: BaseMetaModelElement) {
    if (baseMetalModelElement instanceof DefaultProperty) {
      const index = this.properties.findIndex(({property}) => property.aspectModelUrn === baseMetalModelElement.aspectModelUrn);
      if (index >= 0) {
        this.properties.splice(index, 1);
      }
    } else if (baseMetalModelElement instanceof DefaultOperation) {
      const index = this.operations.indexOf(baseMetalModelElement);
      if (index >= 0) {
        this.operations.splice(index, 1);
      }
    } else if (baseMetalModelElement instanceof DefaultEvent) {
      const index = this.events.indexOf(baseMetalModelElement);
      if (index >= 0) {
        this.events.splice(index, 1);
      }
    }
  }
}
