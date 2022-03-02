/*
 * Copyright (c) 2020 Robert Bosch Manufacturing Solutions GmbH, Germany. All rights reserved.
 */
import {AspectModelVisitor} from '@bame/mx-graph';
import {BaseMetaModelElement} from './base';
import {Characteristic, DefaultCharacteristic} from './default-characteristic';
import {Constraint, DefaultConstraint} from './default-constraint';

export interface Trait extends BaseMetaModelElement {
  baseCharacteristic?: Characteristic;
  constraints?: Array<Constraint>;
}

export class DefaultTrait extends DefaultCharacteristic implements Trait {
  static createInstance() {
    return new DefaultTrait(null, null, 'Trait', null, []);
  }

  get className() {
    return 'DefaultTrait';
  }

  constructor(
    metaModelVersion: string,
    aspectModelUrn: string,
    name: string,
    public baseCharacteristic?: Characteristic,
    public constraints?: Array<Constraint>
  ) {
    super(metaModelVersion, aspectModelUrn, name);
  }

  getBaseCharacteristic(): Characteristic {
    return this.baseCharacteristic;
  }

  getConstraints(): Array<Constraint> {
    return this.constraints;
  }

  accept<T, U>(visitor: AspectModelVisitor<T, U>, context: U): T {
    return visitor.visitCharacteristic(this, context);
  }

  delete(baseMetaModelElement: BaseMetaModelElement) {
    if (this.baseCharacteristic && this.baseCharacteristic.aspectModelUrn === baseMetaModelElement.aspectModelUrn) {
      this.baseCharacteristic = null;
    }

    this.constraints = this.constraints?.filter(element => element.aspectModelUrn !== baseMetaModelElement.aspectModelUrn);
  }

  update(baseMetaModelElement: BaseMetaModelElement) {
    if (baseMetaModelElement instanceof DefaultCharacteristic) {
      this.baseCharacteristic = baseMetaModelElement;
    } else if (baseMetaModelElement instanceof DefaultConstraint) {
      this.constraints.push(baseMetaModelElement);
    }
  }
}
