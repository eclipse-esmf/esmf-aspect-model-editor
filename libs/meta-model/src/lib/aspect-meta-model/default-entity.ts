/*
 * Copyright (c) 2020 Robert Bosch Manufacturing Solutions GmbH, Germany. All rights reserved.
 */

import {Base, BaseMetaModelElement} from './base';
import {HasProperties} from './has-properties';
import {Type} from './type';
import {CanRefine} from './can-refine';
import {OverWrittenProperty} from './overwritten-property';
import {AspectModelVisitor} from '@bame/mx-graph';

export interface Entity extends BaseMetaModelElement, HasProperties, Type, CanRefine {}

export class DefaultEntity extends Base implements Entity {
  static createInstance() {
    return new DefaultEntity(null, null, 'Entity', new Array<OverWrittenProperty>());
  }

  get className() {
    return 'DefaultEntity';
  }

  constructor(
    metaModelVersion: string,
    aspectModelUrn: string,
    name: string,
    public properties: Array<OverWrittenProperty> = [],
    public refines?: string
  ) {
    super(metaModelVersion, aspectModelUrn, name);
  }

  isComplex(): boolean {
    return true;
  }

  isScalar(): boolean {
    return false;
  }

  getUrn(): string {
    return this.aspectModelUrn;
  }

  getRefines(): string {
    return this.refines;
  }

  accept<T, U>(visitor: AspectModelVisitor<T, U>, context: U): T {
    return visitor.visitEntity(this, context);
  }

  delete(baseMetalModelElement: BaseMetaModelElement) {
    if (baseMetalModelElement.className === 'DefaultProperty') {
      const index = this.properties.findIndex(({property}) => property.aspectModelUrn === baseMetalModelElement.aspectModelUrn);
      if (index >= 0) {
        this.properties.splice(index, 1);
      }
    }
  }
}
