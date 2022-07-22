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
  AbstractEntityVisitor,
  AbstractPropertyVisitor,
} from './visitor';

@NgModule({
  declarations: [],
  imports: [CommonModule],
  providers: [
    AbstractEntityVisitor,
    AbstractPropertyVisitor,
    AspectVisitor,
    CharacteristicVisitor,
    CleanupVisitor,
    ConstraintVisitor,
    DomainModelToRdfService,
    EntityValueVisitor,
    EntityVisitor,
    EntityVisitor,
    EventVisitor,
    OperationVisitor,
    PropertyVisitor,
    RdfNodeService,
    UnitVisitor,
  ],
})
export class DomainModelToRdfModule {}
