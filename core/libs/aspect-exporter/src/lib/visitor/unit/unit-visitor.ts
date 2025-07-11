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
import {getPreferredNamesLocales} from '@ame/utils';
import {Injectable} from '@angular/core';
import {DefaultUnit, Samm} from '@esmf/aspect-model-loader';
import {DataFactory, Store} from 'n3';
import {RdfNodeService} from '../../rdf-node';
import {BaseVisitor} from '../base-visitor';

@Injectable()
export class UnitVisitor extends BaseVisitor<DefaultUnit> {
  private get store(): Store {
    return this.loadedFilesService.currentLoadedFile.rdfModel.store;
  }

  private get samm(): Samm {
    return this.loadedFilesService.currentLoadedFile.rdfModel.samm;
  }

  constructor(
    private rdfNodeService: RdfNodeService,
    private loadedFilesService: LoadedFilesService,
  ) {
    super(loadedFilesService);
  }

  visit(unit: DefaultUnit): DefaultUnit {
    this.setPrefix(unit.aspectModelUrn);
    const oldAspectModelUrn = unit.aspectModelUrn;
    this.addProperties(unit);
    if (oldAspectModelUrn !== unit.aspectModelUrn) {
      this.removeOldQuads(oldAspectModelUrn);
    }
    return unit;
  }

  private addProperties(unit: DefaultUnit) {
    if (unit.isPredefined) {
      return;
    }

    this.rdfNodeService.update(unit, {
      preferredName: getPreferredNamesLocales(unit).map(language => ({
        language,
        value: unit.getPreferredName(language),
      })),
      symbol: unit.symbol,
      commonCode: unit.code,
      conversionFactor: unit.conversionFactor,
      // numericConversionFactor: unit.numericConversionFactor,
    });

    // update reference unit
    if (unit.referenceUnit?.aspectModelUrn) {
      this.store.addQuad(
        DataFactory.namedNode(unit.aspectModelUrn),
        this.samm.ReferenceUnitProperty(),
        DataFactory.namedNode(unit.referenceUnit.aspectModelUrn),
      );
      this.setPrefix(unit.referenceUnit.aspectModelUrn);
    }

    // update quantity kinds
    this.store.removeQuads(this.store.getQuads(DataFactory.namedNode(unit.aspectModelUrn), this.samm.QuantityKindProperty(), null, null));

    for (const quantityKind of unit.quantityKinds || []) {
      if (!quantityKind?.aspectModelUrn) {
        continue;
      }

      this.store.addQuad(
        DataFactory.triple(
          DataFactory.namedNode(unit.aspectModelUrn),
          this.samm.QuantityKindProperty(),
          DataFactory.namedNode(quantityKind.aspectModelUrn),
        ),
      );

      this.setPrefix(quantityKind.aspectModelUrn);
    }
  }

  private removeOldQuads(oldAspectModelUrn: string) {
    this.store.removeQuads(this.store.getQuads(DataFactory.namedNode(oldAspectModelUrn), null, null, null));
  }
}
