/*
 * Copyright (c) 2022 Robert Bosch Manufacturing Solutions GmbH
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

import {Injectable} from '@angular/core';
import {DataFactory, Quad_Subject, Util} from 'n3';
import {BaseMetaModelElement, DefaultAspect} from '@ame/meta-model';
import {
  AspectInstantiator,
  BammUnitInstantiator,
  EntityInstantiator,
  EntityValueInstantiator,
  EventInstantiator,
  OperationInstantiator,
  PropertyInstantiator,
} from './instantiators';
import {MetaModelElementInstantiator} from './meta-model-element-instantiator';
import {CachedFile, NamespacesCacheService} from '@ame/cache';
import {RdfService} from '@ame/rdf/services';
import {RdfModel, RdfModelUtil} from '@ame/rdf/utils';
import {NotificationsService} from '@ame/shared';

@Injectable({
  providedIn: 'root',
})
export class InstantiatorService {
  constructor(
    private namespaceCacheService: NamespacesCacheService,
    public rdfService: RdfService,
    public notificationsService: NotificationsService
  ) {}

  public instantiateFile(rdfModel: RdfModel, cachedFile: CachedFile, fileName: string): CachedFile {
    const aspect = rdfModel.store.getSubjects(rdfModel.BAMM().RdfType(), rdfModel.BAMM().Aspect(), null)?.[0];

    if (cachedFile.getCachedElement<DefaultAspect>(aspect?.value)) {
      return cachedFile;
    }

    const metaModelElementInstantiator = new MetaModelElementInstantiator(
      rdfModel,
      cachedFile,
      fileName,
      this,
      this.namespaceCacheService,
      new Map<string, Array<BaseMetaModelElement>>(),
      this.notificationsService
    );

    if (aspect) {
      const aspectInstantiator = new AspectInstantiator(metaModelElementInstantiator);
      aspectInstantiator.createAspect(aspect).fileName = fileName;
    }

    const uniqueSubjects = rdfModel.store
      .getSubjects(null, null, null)
      .reduce(
        (subjects, subject) =>
          !Util.isBlankNode(subject) && !cachedFile.getCachedElement(subject.value) ? [...subjects, subject] : subjects,
        []
      );

    metaModelElementInstantiator.isIsolated = true;
    for (const subject of uniqueSubjects) {
      if (cachedFile.getElement(subject.value)) {
        continue;
      }

      this.instantiateUnusedElement(subject, rdfModel, cachedFile, metaModelElementInstantiator);
    }

    metaModelElementInstantiator.executeQueueInstantiators();

    return cachedFile;
  }

  public instantiateUnusedElement(
    subject: Quad_Subject,
    rdfModel: RdfModel,
    cachedFile: CachedFile,
    metaModelElementInstantiator: MetaModelElementInstantiator
  ) {
    const bamm = rdfModel.BAMM();
    const bammc = rdfModel.BAMMC();
    const bammu = rdfModel.BAMMU();
    const elementType = rdfModel.store.getObjects(subject, rdfModel.BAMM().RdfType(), null)?.[0]?.value;

    if (bamm.isPropertyElement(elementType)) {
      const overwrittenProperty = new PropertyInstantiator(metaModelElementInstantiator).createProperty({
        blankNode: false,
        quad: subject,
      });
      if (overwrittenProperty?.property) {
        cachedFile.resolveIsolatedElement(overwrittenProperty.property);
        cachedFile.removeCachedElement(overwrittenProperty.property.aspectModelUrn);
      }
      return;
    }

    if (elementType.endsWith('Constraint')) {
      const constraint = metaModelElementInstantiator.getConstraint(DataFactory.quad(null, null, subject));
      if (constraint) {
        cachedFile.resolveIsolatedElement(constraint);
        cachedFile.removeCachedElement(constraint.aspectModelUrn);
      }
      return;
    }

    if (bammc.isStandardCharacteristic(elementType) || bamm.isCharacteristic(elementType)) {
      const characteristic = metaModelElementInstantiator.getCharacteristic(DataFactory.quad(null, null, subject));
      if (characteristic) {
        cachedFile.resolveIsolatedElement(characteristic);
        cachedFile.removeCachedElement(characteristic.aspectModelUrn);
      }
      return;
    }

    if (bamm.isOperationElement(elementType)) {
      const operation = new OperationInstantiator(metaModelElementInstantiator).createOperation({
        blankNode: false,
        quad: subject,
      });
      if (operation) {
        cachedFile.resolveIsolatedElement(operation);
        cachedFile.removeCachedElement(operation.aspectModelUrn);
      }
      return;
    }

    if (bamm.isEventElement(elementType)) {
      const event = new EventInstantiator(metaModelElementInstantiator).createEvent({
        blankNode: false,
        quad: subject,
      });
      if (event) {
        cachedFile.resolveIsolatedElement(event);
        cachedFile.removeCachedElement(event.aspectModelUrn);
      }
      return;
    }

    if (bammu.isUnitElement(elementType)) {
      const unit = new BammUnitInstantiator(metaModelElementInstantiator).createUnit(subject.value);
      if (unit) {
        cachedFile.resolveIsolatedElement(unit);
        cachedFile.removeCachedElement(unit.aspectModelUrn);
      }
      return;
    }

    if (bamm.isEntity(elementType)) {
      const entity = new EntityInstantiator(metaModelElementInstantiator).createEntity(rdfModel.store.getQuads(subject, null, null, null));
      if (entity) {
        cachedFile.resolveIsolatedElement(entity);
        cachedFile.removeCachedElement(entity.aspectModelUrn);
      }
      return;
    }

    if (RdfModelUtil.isEntityValue(elementType, metaModelElementInstantiator)) {
      const entityValue = new EntityValueInstantiator(metaModelElementInstantiator).createEntityValue(
        rdfModel.store.getQuads(subject, null, null, null),
        subject
      );
      if (entityValue) {
        cachedFile.resolveIsolatedElement(entityValue);
        cachedFile.removeCachedElement(entityValue.aspectModelUrn);
      }
    }
  }
}
