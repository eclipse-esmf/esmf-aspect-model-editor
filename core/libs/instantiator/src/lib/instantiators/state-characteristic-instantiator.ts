/*
 * Copyright (c) 2024 Robert Bosch Manufacturing Solutions GmbH
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
import {CharacteristicInstantiator} from './characteristic-instantiator';
import {MetaModelElementInstantiator} from '../meta-model-element-instantiator';
import {NamedNode, Quad, Util} from 'n3';
import {EnumerationCharacteristicInstantiator} from './enumeration-characteristic-instantiator';
import {EntityValueInstantiator} from './entity-value-instantiator';
import {Characteristic, DefaultEntityInstance, DefaultEnumeration, DefaultState, Enumeration} from '@ame/meta-model';
import {syncElementWithChildren} from '../helpers';

export class StateCharacteristicInstantiator extends EnumerationCharacteristicInstantiator {
  constructor(metaModelElementInstantiator: MetaModelElementInstantiator, nextProcessor: CharacteristicInstantiator) {
    super(metaModelElementInstantiator, nextProcessor);
  }

  protected processElement(quads: Array<Quad>): Characteristic {
    let defaultState = this.cachedFile.getElement<DefaultState>(quads[0]?.subject.value);
    if (defaultState) {
      return defaultState;
    }

    const sammC = this.metaModelElementInstantiator.sammC;
    const defaultEnumeration = <DefaultEnumeration>super.processElement(quads);

    defaultState = new DefaultState(
      defaultEnumeration.metaModelVersion,
      defaultEnumeration.aspectModelUrn,
      defaultEnumeration.name,
      defaultEnumeration.values,
      null,
      defaultEnumeration.dataType
    );

    defaultState.fileName = this.metaModelElementInstantiator.fileName;

    quads.forEach(quad => {
      if (sammC.isDefaultValueProperty(quad.predicate.value)) {
        defaultState.defaultValue = this.getDefaultValue(quad);
        if (defaultState.defaultValue instanceof DefaultEntityInstance) defaultState.children.push(defaultState.defaultValue);
      }
    });

    syncElementWithChildren(defaultState);
    return defaultState;
  }

  protected createEnumerationObject(): Enumeration {
    return new DefaultState(null, null, null, null, null);
  }

  private getDefaultValue(quad: Quad): DefaultEntityInstance | string {
    if (Util.isLiteral(quad.object)) {
      return `${quad.object.value}`;
    }

    const quads: Quad[] = Util.isBlankNode(quad.object)
      ? this.metaModelElementInstantiator.rdfModel.resolveBlankNodes(quad.object.value)
      : this.metaModelElementInstantiator.rdfModel.findAnyProperty(quad.object as NamedNode);

    return new EntityValueInstantiator(this.metaModelElementInstantiator).createEntityValue(quads, quad.object);
  }

  shouldProcess(nameNode: NamedNode): boolean {
    return this.metaModelElementInstantiator.sammC.StateCharacteristic().equals(nameNode);
  }
}
