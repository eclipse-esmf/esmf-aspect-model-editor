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
import {mxgraph} from 'mxgraph-factory';
import {DataFactory, Store} from 'n3';
import {BaseVisitor} from '../base-visitor';
import {MxGraphHelper} from '@ame/mx-graph';
import {RdfNodeService} from '../../rdf-node';
import {DefaultUnit} from '@ame/meta-model';
import {RdfService} from '@ame/rdf/services';
import {Bamm, Bammu} from '@ame/vocabulary';

@Injectable()
export class UnitVisitor extends BaseVisitor<DefaultUnit> {
  private get store(): Store {
    return this.rdfNodeService.modelService.getLoadedAspectModel().rdfModel.store;
  }

  private get bammu(): Bammu {
    return this.rdfNodeService.modelService.getLoadedAspectModel().rdfModel.BAMMU();
  }

  private get bamm(): Bamm {
    return this.rdfNodeService.modelService.getLoadedAspectModel().rdfModel.BAMM();
  }

  constructor(private rdfNodeService: RdfNodeService, rdfService: RdfService) {
    super(rdfService);
  }

  visit(cell: mxgraph.mxCell): DefaultUnit {
    const unit: DefaultUnit = MxGraphHelper.getModelElement<DefaultUnit>(cell);
    this.setPrefix(unit.aspectModelUrn);
    const oldAspectModelUrn = unit.aspectModelUrn;
    this.addProperties(unit);
    if (oldAspectModelUrn !== unit.aspectModelUrn) {
      this.removeOldQuads(oldAspectModelUrn);
    }
    return unit;
  }

  private addProperties(unit: DefaultUnit) {
    if (unit.isPredefined()) {
      return;
    }

    this.rdfNodeService.update(unit, {
      preferredName: unit.getAllLocalesPreferredNames().map(language => ({
        language,
        value: unit.getPreferredName(language),
      })),
      symbol: unit.symbol,
      commonCode: unit.code,
      conversionFactor: unit.conversionFactor,
      numericConversionFactor: unit.numericConversionFactor,
    });

    // update reference unit
    if (unit.referenceUnit?.aspectModelUrn) {
      this.store.addQuad(
        DataFactory.namedNode(unit.aspectModelUrn),
        this.bamm.ReferenceUnitProperty(),
        DataFactory.namedNode(unit.referenceUnit.aspectModelUrn)
      );
      this.setPrefix(unit.referenceUnit.aspectModelUrn);
    }

    // update quantity kinds
    this.store.removeQuads(this.store.getQuads(DataFactory.namedNode(unit.aspectModelUrn), this.bamm.QuantityKindProperty(), null, null));

    for (const quantityKind of unit.quantityKinds || []) {
      if (!quantityKind?.aspectModelUrn) {
        continue;
      }

      this.store.addQuad(
        DataFactory.triple(
          DataFactory.namedNode(unit.aspectModelUrn),
          this.bamm.QuantityKindProperty(),
          DataFactory.namedNode(quantityKind.aspectModelUrn)
        )
      );

      this.setPrefix(quantityKind.aspectModelUrn);
    }
  }

  private removeOldQuads(oldAspectModelUrn: string) {
    this.store.removeQuads(this.store.getQuads(DataFactory.namedNode(oldAspectModelUrn), null, null, null));
  }
}
