/*
 * Copyright (c) 2020 Robert Bosch Manufacturing Solutions GmbH, Germany. All rights reserved.
 */

import {Characteristic, DefaultCharacteristic} from './default-characteristic';
import {Base, BaseMetaModelElement} from './base';
import {CanRefine} from './can-refine';
import {LookUpDatatype} from './look-up-datatype';
import {Type} from './type';
import {DefaultScalar} from './default-scalar';
import {DefaultTrait} from './default-trait';
import {AspectModelVisitor} from '@bame/mx-graph';

export interface Property extends BaseMetaModelElement, CanRefine, LookUpDatatype {
  characteristic: Characteristic;
  refines?: string;
  exampleValue?: any;
}

export class DefaultProperty extends Base implements Property {
  static createInstance() {
    return new DefaultProperty(null, null, 'property', null);
  }

  get className() {
    return 'DefaultProperty';
  }

  constructor(
    metaModelVersion: string,
    aspectModelUrn: string,
    name: string,
    public characteristic: Characteristic,
    public refines?: string,
    public exampleValue?: any
  ) {
    super(metaModelVersion, aspectModelUrn, name);
  }

  getRefines(): string {
    return this.refines;
  }

  getDeepLookUpDataType(): Type {
    if (this.characteristic instanceof DefaultTrait) {
      return this.characteristic?.baseCharacteristic?.dataType;
    }
    return this.characteristic ? this.characteristic.dataType : null;
  }

  accept<T, U>(visitor: AspectModelVisitor<T, U>, context: U): T {
    return visitor.visitProperty(this, context);
  }

  delete(baseMetalModelElement: BaseMetaModelElement) {
    if (this.characteristic && this.characteristic.aspectModelUrn === baseMetalModelElement.aspectModelUrn) {
      this.characteristic = null;
    }
  }

  update(baseMetalModelElement: BaseMetaModelElement) {
    if (baseMetalModelElement instanceof DefaultCharacteristic) {
      this.characteristic = baseMetalModelElement;
    } else if (baseMetalModelElement instanceof DefaultScalar) {
      this.characteristic.dataType = baseMetalModelElement;
    }
  }
}
