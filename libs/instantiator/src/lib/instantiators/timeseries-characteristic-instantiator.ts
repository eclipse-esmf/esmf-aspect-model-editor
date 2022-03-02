/*
 * Copyright (c) 2020  Robert Bosch Manufacturing Solutions GmbH, Germany. All rights reserved.
 */
import {CharacteristicInstantiator} from './characteristic-instantiator';
import {MetaModelElementInstantiator} from '../meta-model-element-instantiator';
import {NamedNode} from 'n3';
import {SortedSetCharacteristicInstantiator} from './sorted-set-characteristic-instantiator';
import {Collection, DefaultTimeSeries} from '@bame/meta-model';

export class TimeSeriesCharacteristicInstantiator extends SortedSetCharacteristicInstantiator {
  constructor(metaModelElementInstantiator: MetaModelElementInstantiator, nextProcessor: CharacteristicInstantiator) {
    super(metaModelElementInstantiator, nextProcessor);
  }

  protected creatCollectionObject(): Collection {
    return new DefaultTimeSeries(null, null, null, null, null);
  }

  shouldProcess(nameNode: NamedNode): boolean {
    return this.metaModelElementInstantiator.bammc.TimeSeriesCharacteristic().equals(nameNode);
  }
}
