/*
 * Copyright (c) 2020 Robert Bosch Manufacturing Solutions GmbH, Germany. All rights reserved.
 */

import {DataFactory, Quad} from 'n3';
import {DefaultEntity, Entity, OverWrittenProperty} from '@bame/meta-model';
import {MetaModelElementInstantiator} from '../meta-model-element-instantiator';

export class EntityInstantiator {
  private get cachedFile() {
    return this.metaModelElementInstantiator.cachedFile;
  }

  private get rdfModel() {
    return this.metaModelElementInstantiator.rdfModel;
  }

  private get isIsolated() {
    return this.metaModelElementInstantiator.isIsolated;
  }

  constructor(private metaModelElementInstantiator: MetaModelElementInstantiator) {}

  createEntity(quads: Array<Quad>): Entity {
    const entity = this.cachedFile.getElement<Entity>(quads[0]?.subject.value, this.isIsolated);

    if (entity) {
      return entity;
    }

    const bamm = this.metaModelElementInstantiator.bamm;
    const defaultEntity = new DefaultEntity(null, null, null, new Array<OverWrittenProperty>());
    defaultEntity.setExternalReference(this.rdfModel.isExternalRef);

    this.metaModelElementInstantiator.initBaseProperties(quads, defaultEntity, this.metaModelElementInstantiator.rdfModel);

    quads.forEach(quad => {
      if (bamm.isPropertiesProperty(quad.predicate.value)) {
        defaultEntity.properties = this.metaModelElementInstantiator.getProperties(
          DataFactory.namedNode(quad.subject.value),
          bamm.PropertiesProperty()
        );
      }
    });

    return <Entity>this.cachedFile.resolveElement(defaultEntity, this.isIsolated);
  }
}
