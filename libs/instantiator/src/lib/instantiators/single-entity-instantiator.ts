/*
 * Copyright (c) 2020 Robert Bosch Manufacturing Solutions GmbH, Germany. All rights reserved.
 */
import {CharacteristicInstantiator} from './characteristic-instantiator';
import {MetaModelElementInstantiator} from '../meta-model-element-instantiator';
import {NamedNode, Quad} from 'n3';
import {Characteristic, DefaultSingleEntity, Type} from '@bame/meta-model';

export class SingleEntityInstantiator extends CharacteristicInstantiator {
  constructor(metaModelElementInstantiator: MetaModelElementInstantiator, nextProcessor: CharacteristicInstantiator) {
    super(metaModelElementInstantiator, nextProcessor);
  }

  protected processElement(quads: Array<Quad>): Characteristic {
    let defaultSingleEntity = this.cachedFile.getElement<DefaultSingleEntity>(quads[0]?.subject.value, this.isIsolated);
    if (defaultSingleEntity) {
      return defaultSingleEntity;
    }

    const bamm = this.metaModelElementInstantiator.bamm;
    defaultSingleEntity = new DefaultSingleEntity(null, null, null, null);

    this.metaModelElementInstantiator.initBaseProperties(quads, defaultSingleEntity, this.metaModelElementInstantiator.rdfModel);

    quads.forEach(quad => {
      if (bamm.isDataTypeProperty(quad.predicate.value)) {
        this.metaModelElementInstantiator.getDataType(quad, (entity: Type) => {
          defaultSingleEntity.dataType = entity;
        });
      }
    });

    return defaultSingleEntity;
  }

  shouldProcess(nameNode: NamedNode): boolean {
    return this.metaModelElementInstantiator.bammc.SingleEntityCharacteristic().equals(nameNode);
  }
}
