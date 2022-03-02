import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {DomainModelToRdfService} from './domain-model-to-rdf.service';
import {RdfNodeService} from './rdf-node';
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

@NgModule({
  declarations: [],
  imports: [CommonModule],
  providers: [
    AspectVisitor,
    CharacteristicVisitor,
    ConstraintVisitor,
    EntityVisitor,
    PropertyVisitor,
    OperationVisitor,
    EntityVisitor,
    RdfNodeService,
    DomainModelToRdfService,
    CleanupVisitor,
    EntityValueVisitor,
    UnitVisitor,
    EventVisitor
  ],
})
export class DomainModelToRdfModule {}
