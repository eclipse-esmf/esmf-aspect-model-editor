/*
 * Copyright (c) 2020 Robert Bosch Manufacturing Solutions GmbH, Germany. All rights reserved.
 */

import {Type} from './type';
import {Base, BaseMetaModelElement} from './base';
import {DefaultEntity} from './default-entity';
import {AspectModelVisitor} from '@bame/mx-graph';
import {Bamm} from '@bame/vocabulary';
import {DefaultScalar} from './default-scalar';

export interface Characteristic extends BaseMetaModelElement {
  dataType?: Type;
}

export class DefaultCharacteristic extends Base implements Characteristic {
  public createdFromEditor?: boolean;

  static createInstance() {
    return new DefaultCharacteristic(null, null, 'Characteristic');
  }

  get className() {
    return 'DefaultCharacteristic';
  }

  constructor(metaModelVersion: string, aspectModelUrn: string, name: string, public dataType?: Type) {
    super(metaModelVersion, aspectModelUrn, name);
  }

  isPredefined(): boolean {
    return this.aspectModelUrn ? this.aspectModelUrn.startsWith(`${Bamm.BASE_URI}characteristic:${this.metaModelVersion}#`) : false;
  }

  delete(baseMetalModelElement: BaseMetaModelElement | Type) {
    if (baseMetalModelElement instanceof DefaultEntity || baseMetalModelElement instanceof DefaultScalar) {
      this.dataType = null;
    }
  }

  update(baseMetalModelElement: BaseMetaModelElement | Type) {
    if (baseMetalModelElement instanceof DefaultEntity || baseMetalModelElement instanceof DefaultScalar) {
      this.dataType = baseMetalModelElement;
    }
  }

  accept<T, U>(visitor: AspectModelVisitor<T, U>, context: U): T {
    return visitor.visitCharacteristic(this, context);
  }
}
