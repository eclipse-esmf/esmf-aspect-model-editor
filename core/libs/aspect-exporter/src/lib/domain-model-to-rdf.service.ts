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
import {NamespacesCacheService} from '@ame/cache';
import {
  BaseMetaModelElement,
  DefaultAbstractEntity,
  DefaultAspect,
  DefaultCharacteristic,
  DefaultConstraint,
  DefaultEntity,
  DefaultEntityValue,
  DefaultEvent,
  DefaultOperation,
  DefaultProperty,
  DefaultUnit,
} from '@ame/meta-model';
import {MxGraphAttributeService, MxGraphHelper} from '@ame/mx-graph';
import {ModelService} from '@ame/rdf/services';
import {mxgraph} from 'mxgraph-factory';
import {filter, tap} from 'rxjs/operators';
import {
  AspectVisitor,
  CharacteristicVisitor,
  CleanupVisitor,
  ConstraintVisitor,
  EntityValueVisitor,
  EntityVisitor,
  EventVisitor,
  OperationVisitor,
  PropertyVisitor,
  UnitVisitor,
} from './visitor';
import { AbstractEntityVisitor } from './visitor/abstract-entity';

@Injectable()
export class DomainModelToRdfService {
  get graph(): mxgraph.mxGraph {
    return this.mxGraphAttributeService.graph;
  }

  get currentCachedFile() {
    return this.namespacesCacheService.getCurrentCachedFile();
  }

  private working = false;

  constructor(
    private aspectVisitorService: AspectVisitor,
    private propertyVisitorService: PropertyVisitor,
    private operationVisitorService: OperationVisitor,
    private characteristicVisitorService: CharacteristicVisitor,
    private constraintVisitorService: ConstraintVisitor,
    private entityVisitorService: EntityVisitor,
    private abstractEntityVisitorService: AbstractEntityVisitor,
    private entityValueVisitor: EntityValueVisitor,
    private eventVisitorService: EventVisitor,
    private unitVisitorService: UnitVisitor,
    private modelService: ModelService,
    private cleanupVisitorService: CleanupVisitor,
    private namespacesCacheService: NamespacesCacheService,
    private mxGraphAttributeService: MxGraphAttributeService
  ) {}

  listenForStoreUpdates() {
    this.modelService.visitorAnnouncer$
      .pipe(
        filter(() => !this.working),
        tap(() => (this.working = true))
      )
      .subscribe(({observer}) => {
        try {
          this.updateRdfStore();
        } finally {
          this.working = false;
          this.modelService.finishStoreUpdate(observer);
        }
      });
  }

  private updateRdfStore() {
    this.cleanupVisitorService.removeStoreElements();

    for (const cell of this.graph.getChildCells(this.graph.getDefaultParent())) {
      this.visitCell(cell);
    }
  }

  private visitCell(cell: mxgraph.mxCell) {
    const metaModelElement = MxGraphHelper.getModelElement(cell);
    if (metaModelElement?.isExternalReference()) {
      return;
    }

    this.getVisitorService(metaModelElement)?.visit(cell);
  }

  private getVisitorService(metaModelElement: BaseMetaModelElement) {
    if (metaModelElement instanceof DefaultAspect) {
      return this.aspectVisitorService;
    } else if (metaModelElement instanceof DefaultProperty) {
      return this.propertyVisitorService;
    } else if (metaModelElement instanceof DefaultOperation) {
      return this.operationVisitorService;
    } else if (metaModelElement instanceof DefaultConstraint) {
      return this.constraintVisitorService;
    } else if (metaModelElement instanceof DefaultCharacteristic) {
      return this.characteristicVisitorService;
    } else if (metaModelElement instanceof DefaultEntity) {
      return this.entityVisitorService;
    } else if (metaModelElement instanceof DefaultAbstractEntity) {
      return this.abstractEntityVisitorService;
    } else if (metaModelElement instanceof DefaultEntityValue) {
      return this.entityValueVisitor;
    } else if (metaModelElement instanceof DefaultEvent) {
      return this.eventVisitorService;
    } else if (metaModelElement instanceof DefaultUnit) {
      return this.unitVisitorService;
    }

    return null;
  }
}
