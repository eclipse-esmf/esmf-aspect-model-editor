/*
 * Copyright (c) 2023 Robert Bosch Manufacturing Solutions GmbH
 *
 * See the AUTHORS file(s) distributed with this work for
 * additional information regarding authorship.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * SPDX-License-Identifier: MPL-2.0
 */
import {NamedNode, Quad} from 'n3';
import {Characteristic, DefaultCode, DefaultEntity, Type} from '@ame/meta-model';
import {CharacteristicInstantiator} from './characteristic-instantiator';
import {MetaModelElementInstantiator} from '../meta-model-element-instantiator';
import {syncElementWithChildren} from '../helpers';

export class CodeCharacteristicInstantiator extends CharacteristicInstantiator {
  constructor(metaModelElementInstantiator: MetaModelElementInstantiator, nextProcessor: CharacteristicInstantiator) {
    super(metaModelElementInstantiator, nextProcessor);
  }

  protected processElement(quads: Array<Quad>): Characteristic {
    const code = this.cachedFile.getElement<Characteristic>(quads[0]?.subject.value);
    if (code) {
      return code;
    }

    const samm = this.metaModelElementInstantiator.samm;
    const defaultCode = new DefaultCode(null, null, null, null);

    quads.forEach(quad => {
      if (samm.isDataTypeProperty(quad.predicate.value)) {
        this.metaModelElementInstantiator.getDataType(quad, (entity: Type) => {
          defaultCode.dataType = entity;
          if (entity instanceof DefaultEntity) {
            defaultCode.children.push(entity);
            syncElementWithChildren(defaultCode);
          }
        });
      }
    });

    defaultCode.fileName = this.metaModelElementInstantiator.fileName;

    return defaultCode;
  }

  shouldProcess(nameNode: NamedNode): boolean {
    return this.metaModelElementInstantiator.sammC.CodeCharacteristic().equals(nameNode);
  }
}
