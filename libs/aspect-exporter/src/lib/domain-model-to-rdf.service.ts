import {Injectable} from '@angular/core';
import {NamespacesCacheService} from '@bame/cache';
import {
  BaseMetaModelElement,
  DefaultAspect,
  DefaultCharacteristic,
  DefaultConstraint,
  DefaultEntity,
  DefaultEntityValue,
  DefaultEvent,
  DefaultOperation,
  DefaultProperty,
  DefaultUnit,
} from '@bame/meta-model';
import {MxGraphAttributeService, MxGraphHelper} from '@bame/mx-graph';
import {ModelService} from '@bame/rdf/services';
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
    } else if (metaModelElement instanceof DefaultEntityValue) {
      return this.entityValueVisitor;
    } else if (metaModelElement instanceof DefaultEvent) {
      return this.eventVisitorService;
    } else if(metaModelElement instanceof DefaultUnit) {
      return this.unitVisitorService;
    }

    return null;
  }
}
