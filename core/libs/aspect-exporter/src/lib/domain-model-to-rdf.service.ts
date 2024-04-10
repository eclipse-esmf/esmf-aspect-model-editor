/*
 * Copyright (c) 2024 Robert Bosch Manufacturing Solutions GmbH
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

import {Injectable, inject} from '@angular/core';
import {NamespacesCacheService} from '@ame/cache';
import {
  BaseMetaModelElement,
  DefaultAbstractEntity,
  DefaultAbstractProperty,
  DefaultAspect,
  DefaultCharacteristic,
  DefaultConstraint,
  DefaultEntity,
  DefaultEntityInstance,
  DefaultEvent,
  DefaultOperation,
  DefaultProperty,
  DefaultUnit,
} from '@ame/meta-model';
import {MxGraphAttributeService} from '@ame/mx-graph';
import {ModelService} from '@ame/rdf/services';
import {mxgraph} from 'mxgraph-factory';
import {filter, tap} from 'rxjs/operators';
import {
  AbstractEntityVisitor,
  AbstractPropertyVisitor,
  AspectVisitor,
  CharacteristicVisitor,
  CleanupVisitor,
  ConstraintVisitor,
  EntityInstanceVisitor,
  EntityVisitor,
  EventVisitor,
  OperationVisitor,
  PropertyVisitor,
  UnitVisitor,
} from './visitor';

@Injectable()
export class DomainModelToRdfService {
  private mxGraphAttributeService = inject(MxGraphAttributeService);
  private namespacesCacheService = inject(NamespacesCacheService);

  get graph(): mxgraph.mxGraph {
    return this.mxGraphAttributeService.graph;
  }

  get currentCachedFile() {
    return this.namespacesCacheService.currentCachedFile;
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
    private abstractPropertyVisitorService: AbstractPropertyVisitor,
    private entityInstanceVisitor: EntityInstanceVisitor,
    private eventVisitorService: EventVisitor,
    private unitVisitorService: UnitVisitor,
    private modelService: ModelService,
    private cleanupVisitorService: CleanupVisitor,
  ) {}

  listenForStoreUpdates() {
    this.modelService.visitorAnnouncer$
      .pipe(
        filter(() => !this.working),
        tap(() => (this.working = true)),
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

    const rootElements = this.namespacesCacheService.currentCachedFile.getAllElements().filter(e => !e.parents.length);
    for (const element of rootElements) {
      this.visitLayer(element);
    }
  }

  private visitLayer(element: BaseMetaModelElement, visited = {}) {
    if (visited[element.aspectModelUrn]) {
      return;
    }

    this.exportElement(element);
    visited[element.aspectModelUrn] = true;
    for (const child of element.children) {
      this.visitLayer(child, visited);
    }
  }

  private exportElement(element: BaseMetaModelElement) {
    if (element?.isExternalReference()) {
      return;
    }

    this.getVisitorService(element)?.visit(element as any);
  }

  private getVisitorService(metaModelElement: BaseMetaModelElement) {
    if (metaModelElement instanceof DefaultAspect) {
      return this.aspectVisitorService;
    } else if (metaModelElement instanceof DefaultProperty) {
      return this.propertyVisitorService;
    } else if (metaModelElement instanceof DefaultAbstractProperty) {
      return this.abstractPropertyVisitorService;
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
    } else if (metaModelElement instanceof DefaultEntityInstance) {
      return this.entityInstanceVisitor;
    } else if (metaModelElement instanceof DefaultEvent) {
      return this.eventVisitorService;
    } else if (metaModelElement instanceof DefaultUnit) {
      return this.unitVisitorService;
    }

    return null;
  }
}
