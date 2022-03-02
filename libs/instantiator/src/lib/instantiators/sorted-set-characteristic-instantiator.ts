/*
 * Copyright (c) 2020  Robert Bosch Manufacturing Solutions GmbH, Germany. All rights reserved.
 */
import {CharacteristicInstantiator} from './characteristic-instantiator';
import {MetaModelElementInstantiator} from '../meta-model-element-instantiator';
import {NamedNode} from 'n3';
import {CollectionCharacteristicInstantiator} from './collection-characteristic-instantiator';
import {Collection, DefaultSortedSet} from '@bame/meta-model';

export class SortedSetCharacteristicInstantiator extends CollectionCharacteristicInstantiator {
  constructor(metaModelElementInstantiator: MetaModelElementInstantiator, nextProcessor: CharacteristicInstantiator) {
    super(metaModelElementInstantiator, nextProcessor);
  }

  protected creatCollectionObject(): Collection {
    return new DefaultSortedSet(null, null, null, null);
  }

  shouldProcess(nameNode: NamedNode): boolean {
    return this.metaModelElementInstantiator.bammc.SortedSetCharacteristic().equals(nameNode);
  }
}
