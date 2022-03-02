/*
 *
 *  * Copyright (c) 2020 Robert Bosch Manufacturing Solutions GmbH, Germany. All rights reserved.
 *
 */
import {NamedNode, Quad, Util} from 'n3';
import {Characteristic, DefaultEnumeration, DefaultEntityValue} from '@bame/meta-model';
import {EntityValueInstantiator} from './entity-value-instantiator';
import {CharacteristicInstantiator} from './characteristic-instantiator';
import {MetaModelElementInstantiator} from '../meta-model-element-instantiator';
import {RdfModel} from '@bame/rdf/utils';

export class EnumerationCharacteristicInstantiator extends CharacteristicInstantiator {
  constructor(metaModelElementInstantiator: MetaModelElementInstantiator, nextProcessor: CharacteristicInstantiator) {
    super(metaModelElementInstantiator, nextProcessor);
  }

  protected processElement(quads: Array<Quad>): Characteristic {
    let enumeration = this.cachedFile.getElement<DefaultEnumeration>(quads[0]?.subject.value, this.isIsolated);
    if (enumeration) {
      return enumeration;
    }

    const bamm = this.metaModelElementInstantiator.bamm;
    const bammc = this.metaModelElementInstantiator.bammc;
    enumeration = DefaultEnumeration.createInstance();

    for (const quad of quads) {
      if ((bamm.isValueProperty(quad.predicate.value) || bammc.isValuesProperty(quad.predicate.value)) && Util.isBlankNode(quad.object)) {
        enumeration.values = this.getEnumerationValues(quad);
      }
    }
    return enumeration;
  }

  private getEnumerationValues(quad: Quad): Array<string | DefaultEntityValue> {
    const quads = this.metaModelElementInstantiator.rdfModel.resolveBlankNodes(quad.object.value);
    const isEntityValue = this.isEntityValue(quads?.[0]);

    const values = [];
    for (const entityValueQuad of quads) {
      if (isEntityValue) {
        this.metaModelElementInstantiator.loadEntityValue(entityValueQuad, (ev: DefaultEntityValue) => {
          values.push(ev);
        });
        continue;
      }
      values.push(`${entityValueQuad.object.value}`);
    }
    return values;
  }

  private instantiateEntityValue(quadValue: Quad, enumeration: DefaultEnumeration) {
    const entityValue = new EntityValueInstantiator(this.metaModelElementInstantiator).createEntityValue(
      this.metaModelElementInstantiator.rdfModel.findAnyProperty(quadValue),
      quadValue.object
    );
    enumeration.values?.push(entityValue);
    entityValue?.addParent(enumeration);
  }

  shouldProcess(nameNode: NamedNode): boolean {
    return this.metaModelElementInstantiator.bammc.EnumerationCharacteristic().equals(nameNode);
  }

  private isEntityValue(quad: Quad) {
    if (!quad) {
      return false;
    }

    const externalRdfModel = this.metaModelElementInstantiator.getRdfModelByElement(quad.object);
    const rdfModel: RdfModel = externalRdfModel || this.metaModelElementInstantiator.rdfModel;

    // check if it is a valid entity value
    const bamm = this.metaModelElementInstantiator.bamm;
    const entityValueQuads = rdfModel.store.getQuads(quad.object, null, null, null);
    if (!entityValueQuads.length) {
      return false;
    }

    // check if it is an entity value
    let entityQuads = rdfModel.store.getQuads(entityValueQuads[0]?.object, null, null, null);
    if (!entityQuads.length) {
      const entityRdfModel = this.metaModelElementInstantiator.getRdfModelByElement(entityValueQuads[0]?.object);
      entityQuads = entityRdfModel.store.getQuads(entityValueQuads[0]?.object, null, null, null);
    }

    const rdfTypeQuad = entityQuads.find(({predicate}) => bamm.RdfType().equals(predicate));
    if (!rdfTypeQuad) {
      return false;
    }

    return bamm.Entity().equals(rdfTypeQuad.object);
  }
}
