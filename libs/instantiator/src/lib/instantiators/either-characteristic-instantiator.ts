/*
 * Copyright (c) 2020 Robert Bosch Manufacturing Solutions GmbH, Germany. All rights reserved.
 */
import {NamedNode, Quad} from 'n3';
import {Characteristic, DefaultEither} from '@bame/meta-model';
import {CharacteristicInstantiator} from './characteristic-instantiator';
import {MetaModelElementInstantiator} from '../meta-model-element-instantiator';

export class EitherCharacteristicInstantiator extends CharacteristicInstantiator {
  constructor(metaModelElementInstantiator: MetaModelElementInstantiator, nextProcessor: CharacteristicInstantiator) {
    super(metaModelElementInstantiator, nextProcessor);
  }

  protected processElement(quads: Array<Quad>): Characteristic {
    let defaultEither = this.cachedFile.getElement<DefaultEither>(quads[0]?.subject.value, this.isIsolated);
    if (defaultEither) {
      return defaultEither;
    }

    defaultEither = new DefaultEither(null, null, null, null, null);
    for (const quad of quads) {
      if (this.bammc.isEitherLeftProperty(quad.predicate.value)) {
        this.metaModelElementInstantiator.loadCharacteristic(
          quad,
          false,
          (extReference: Characteristic) => (defaultEither.left = extReference)
        );
        continue;
      }

      if (this.bammc.isEitherRightProperty(quad.predicate.value)) {
        this.metaModelElementInstantiator.loadCharacteristic(
          quad,
          false,
          (extReference: Characteristic) => (defaultEither.right = extReference)
        );
      }
    }

    return defaultEither;
  }

  public shouldProcess(nameNode: NamedNode): boolean {
    return this.bammc.EitherCharacteristic().equals(nameNode);
  }
}
