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

import {LoadedFilesService} from '@ame/cache';
import {MxGraphAttributeService} from '@ame/mx-graph';
import {ModelService} from '@ame/rdf/services';
import {Injectable, inject} from '@angular/core';
import {
  DefaultAspect,
  DefaultCharacteristic,
  DefaultConstraint,
  DefaultEntity,
  DefaultEntityInstance,
  DefaultEvent,
  DefaultOperation,
  DefaultProperty,
  DefaultUnit,
  DefaultValue,
  NamedElement,
} from '@esmf/aspect-model-loader';
import {mxgraph} from 'mxgraph-factory';
import {filter, tap} from 'rxjs/operators';
import {
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
  ValueVisitor,
} from './visitor';

@Injectable({providedIn: 'root'})
export class DomainModelToRdfService {
  private mxGraphAttributeService = inject(MxGraphAttributeService);
  private loadedFiles = inject(LoadedFilesService);
  private aspectVisitorService = inject(AspectVisitor);
  private propertyVisitorService = inject(PropertyVisitor);
  private operationVisitorService = inject(OperationVisitor);
  private characteristicVisitorService = inject(CharacteristicVisitor);
  private valueVisitorService = inject(ValueVisitor);
  private constraintVisitorService = inject(ConstraintVisitor);
  private entityVisitorService = inject(EntityVisitor);
  private entityInstanceVisitor = inject(EntityInstanceVisitor);
  private eventVisitorService = inject(EventVisitor);
  private unitVisitorService = inject(UnitVisitor);
  private modelService = inject(ModelService);
  private cleanupVisitorService = inject(CleanupVisitor);

  get graph(): mxgraph.mxGraph {
    return this.mxGraphAttributeService.graph;
  }

  get currentCachedFile() {
    return this.loadedFiles.currentLoadedFile.cachedFile;
  }

  private working = false;

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

    const rootElements = this.currentCachedFile.getAllElements().filter(e => !Array.from(e.parents).filter(Boolean).length);
    for (const element of rootElements) {
      this.visitLayer(element);
    }
  }

  private visitLayer(element: NamedElement, visited = {}) {
    if (visited[element.aspectModelUrn]) {
      return;
    }

    this.exportElement(element);
    visited[element.aspectModelUrn] = true;
    for (const child of element.children) {
      this.visitLayer(child, visited);
    }
  }

  private exportElement(element: NamedElement) {
    if (this.loadedFiles.isElementExtern(element)) {
      return;
    }

    this.getVisitorService(element)?.visit(element as any);
  }

  private getVisitorService(metaModelElement: NamedElement) {
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
    } else if (metaModelElement instanceof DefaultEntityInstance) {
      return this.entityInstanceVisitor;
    } else if (metaModelElement instanceof DefaultValue) {
      return this.valueVisitorService;
    } else if (metaModelElement instanceof DefaultEvent) {
      return this.eventVisitorService;
    } else if (metaModelElement instanceof DefaultUnit) {
      return this.unitVisitorService;
    }

    return null;
  }
}
