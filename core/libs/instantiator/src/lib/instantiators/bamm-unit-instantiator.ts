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
import {DataFactory} from 'n3';
import {DefaultQuantityKind, DefaultUnit, Entity, QuantityKind, Unit} from '@ame/meta-model';
import {MetaModelElementInstantiator} from '../meta-model-element-instantiator';
import {Bamm, Bammu} from '@ame/vocabulary';

declare const bammuDefinition: any;

export class BammUnitInstantiator {
  private readonly bammu: Bammu;
  private readonly bamm: Bamm;

  private get cachedFile() {
    return this.metaModelElementInstantiator.cachedFile;
  }

  private get isIsolated() {
    return this.metaModelElementInstantiator.isIsolated;
  }

  private get rdfModel() {
    return this.metaModelElementInstantiator.rdfModel;
  }

  constructor(private metaModelElementInstantiator: MetaModelElementInstantiator) {
    this.bammu = this.metaModelElementInstantiator.bammu;
    this.bamm = this.metaModelElementInstantiator.bamm;
  }

  getUnit(name: string): Unit {
    const unit = this.createUnit(name);
    return <Unit>this.cachedFile.resolveElement(unit, this.isIsolated);
  }

  createQuantityKind(name: string): QuantityKind {
    if (!name) {
      return null;
    }

    const quantityKind = bammuDefinition.quantityKinds[name.replace(this.bammu.getNamespace(), '')];
    return quantityKind
      ? new DefaultQuantityKind(
          this.bamm.version,
          `${this.metaModelElementInstantiator.bammu.getDefaultQuantityKindsUri()}#${quantityKind.name}`,
          quantityKind.name,
          quantityKind.label
        )
      : null;
  }

  createUnit(urn: string): Unit {
    if (!urn) {
      return null;
    }

    const quantityKindNames = new Array<string>();
    const predefinedUnit = this.createPredefinedUnit(urn);

    if (predefinedUnit) {
      return predefinedUnit;
    }

    const defaultUnit = new DefaultUnit(this.bamm.version, null, null, null, null, null);
    defaultUnit.fileName = this.metaModelElementInstantiator.fileName;
    const unitPropertyQuads = this.metaModelElementInstantiator.rdfModel.store.getQuads(DataFactory.namedNode(urn), null, null, null);
    [, defaultUnit.name] = urn.split('#');
    const alreadyDefinedUnit = this.cachedFile.getElement<Entity>(unitPropertyQuads[0]?.subject.value, this.isIsolated);

    if (alreadyDefinedUnit) {
      return alreadyDefinedUnit;
    }

    defaultUnit.setExternalReference(this.rdfModel.isExternalRef);

    unitPropertyQuads.forEach(quad => {
      if (this.bamm.isSymbolProperty(quad.predicate.value)) {
        defaultUnit.symbol = quad.object.value;
      } else if (this.bamm.isReferenceUnitProperty(quad.predicate.value)) {
        defaultUnit.referenceUnit = this.createUnit(quad.object.value);
      } else if (this.bamm.isConversionFactorProperty(quad.predicate.value)) {
        defaultUnit.conversionFactor = quad.object.value;
      } else if (this.bamm.isNumericConversionFactorProperty(quad.predicate.value)) {
        defaultUnit.numericConversionFactor = quad.object.value;
      } else if (this.bamm.isCommonCodeProperty(quad.predicate.value)) {
        defaultUnit.code = quad.object.value;
      } else if (this.bamm.isQuantityKindProperty(quad.predicate.value)) {
        quantityKindNames.push(quad.object.value);
      }
    });

    this.metaModelElementInstantiator.initBaseProperties(unitPropertyQuads, defaultUnit, this.metaModelElementInstantiator.rdfModel);

    quantityKindNames.forEach(quantityKindName => {
      const quantityKind = this.createQuantityKind(quantityKindName);
      if (quantityKind) {
        defaultUnit.quantityKinds.push(quantityKind);
      }
    });

    return <Unit>this.cachedFile.resolveElement(defaultUnit, this.isIsolated);
  }

  createPredefinedUnit(name: string) {
    const defaultUnit = new DefaultUnit(this.bamm.version, null, null, null, null, null);
    const unit = bammuDefinition.units[name.replace(this.bammu.getNamespace(), '')];

    if (unit) {
      defaultUnit.name = unit.name;
      defaultUnit.addPreferredName('en', unit.label);
      defaultUnit.aspectModelUrn = `${this.metaModelElementInstantiator.bammu.getDefaultUnitUri()}#${defaultUnit.name}`;
      defaultUnit.symbol = unit.symbol;
      defaultUnit.code = unit.code;
      defaultUnit.referenceUnit = unit.referenceUnit ? this.createUnit(unit.referenceUnit().name) : null;
      defaultUnit.conversionFactor = unit.conversionFactor;
      defaultUnit.quantityKinds = unit.quantityKinds;

      return defaultUnit;
    }

    return null;
  }
}
