/*
 * Copyright (c) 2020 Robert Bosch Manufacturing Solutions GmbH, Germany. All rights reserved.
 */
import { Quad_Subject } from 'n3';
import { Aspect, BaseMetaModelElement, DefaultAspect, DefaultProperty } from '@bame/meta-model';
import { MetaModelElementInstantiator } from '../meta-model-element-instantiator';

export class AspectInstantiator {
  protected get namespaceCacheService() {
    return this.metaModelElementInstantiator.namespaceCacheService;
  }

  private get rdfModel() {
    return this.metaModelElementInstantiator.rdfModel;
  }

  private get cachedFile() {
    return this.metaModelElementInstantiator.cachedFile;
  }

  private get recursiveModelElements() {
    return this.metaModelElementInstantiator.recursiveModelElements;
  }

  constructor(public metaModelElementInstantiator: MetaModelElementInstantiator) {
    this.metaModelElementInstantiator = metaModelElementInstantiator;
  }

  createAspect(aspectSubject: Quad_Subject = null): Aspect {
    const bamm = this.metaModelElementInstantiator.bamm;
    const aspectNode = this.rdfModel.store.getQuads(aspectSubject, this.rdfModel.BAMM().RdfType(), this.rdfModel.BAMM().Aspect(), null)[0]
      .subject;
    const properties = this.metaModelElementInstantiator.getProperties(aspectNode, bamm.PropertiesProperty());
    const operations = this.metaModelElementInstantiator.getOperations(aspectNode, bamm.OperationsProperty());
    const events = this.metaModelElementInstantiator.getEvents(aspectNode, bamm.EventsProperty())
    const aspect = new DefaultAspect(null, null, null, properties, operations, events);

    this.metaModelElementInstantiator.initBaseProperties(this.rdfModel.findAnyProperty(aspectNode), aspect, this.rdfModel);

    this.recursiveModelElements.forEach((recursiveProperties: BaseMetaModelElement[], key: string) => {
      recursiveProperties.forEach((property: BaseMetaModelElement) => {
        if (property && property instanceof DefaultProperty) {
          property.characteristic = this.cachedFile.getCachedElement(key);
        }
      });
    });

    this.cachedFile.aspect = aspect;
    return <Aspect>this.metaModelElementInstantiator.cachedFile.resolveCachedElement(aspect);
  }
}
