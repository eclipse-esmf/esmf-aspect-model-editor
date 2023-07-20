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
import {Quad_Subject} from 'n3';
import {Aspect, BaseMetaModelElement, DefaultAspect, DefaultProperty} from '@ame/meta-model';
import {MetaModelElementInstantiator} from '../meta-model-element-instantiator';

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
    const samm = this.metaModelElementInstantiator.samm;
    const aspectNode = this.rdfModel.store.getQuads(aspectSubject, this.rdfModel.SAMM().RdfType(), this.rdfModel.SAMM().Aspect(), null)[0]
      .subject;
    const aspect = new DefaultAspect(null, null, null);

    this.metaModelElementInstantiator.getProperties(aspectNode, samm.PropertiesProperty(), aspect);
    this.metaModelElementInstantiator.getOperations(aspectNode, samm.OperationsProperty(), aspect);
    this.metaModelElementInstantiator.getEvents(aspectNode, samm.EventsProperty(), aspect);

    aspect.fileName = this.metaModelElementInstantiator.fileName;

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
