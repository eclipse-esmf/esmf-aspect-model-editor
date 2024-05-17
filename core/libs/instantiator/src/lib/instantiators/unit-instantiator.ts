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
import {DataFactory} from 'n3';
import {DefaultQuantityKind, DefaultUnit, QuantityKind, Unit} from '@ame/meta-model';
import {MetaModelElementInstantiator} from '../meta-model-element-instantiator';
import {Samm, SammU} from '@ame/vocabulary';
import {syncElementWithChildren} from '../helpers';

declare const sammUDefinition: any;

export class UnitInstantiator {
  private readonly sammU: SammU;
  private readonly samm: Samm;

  private get cachedFile() {
    return this.metaModelElementInstantiator.cachedFile;
  }

  private get rdfModel() {
    return this.metaModelElementInstantiator.rdfModel;
  }

  constructor(private metaModelElementInstantiator: MetaModelElementInstantiator) {
    this.sammU = this.metaModelElementInstantiator.sammU;
    this.samm = this.metaModelElementInstantiator.samm;
  }

  getUnit(name: string): Unit {
    const unit = this.createUnit(name);
    return unit.isPredefined() ? unit : this.cachedFile.resolveElement(unit);
  }

  createQuantityKind(name: string): QuantityKind {
    if (!name) {
      return null;
    }

    const quantityKind = sammUDefinition.quantityKinds[name.replace(this.sammU.getNamespace(), '')];
    return quantityKind
      ? new DefaultQuantityKind(
          this.samm.version,
          `${this.metaModelElementInstantiator.sammU.getDefaultQuantityKindsUri()}#${quantityKind.name}`,
          quantityKind.name,
          quantityKind.label
        )
      : null;
  }

  createUnit(urn: string, parent?: Unit): Unit {
    if (!urn) {
      return null;
    }

    const quantityKindNames = new Array<string>();
    const predefinedUnit = this.createPredefinedUnit(urn, parent);

    if (predefinedUnit) {
      return predefinedUnit;
    }

    const defaultUnit = new DefaultUnit(this.samm.version, null, null, null, null, null);
    defaultUnit.fileName = this.metaModelElementInstantiator.fileName;
    const unitPropertyQuads = this.metaModelElementInstantiator.rdfModel.store.getQuads(DataFactory.namedNode(urn), null, null, null);
    [, defaultUnit.name] = urn.split('#');
    const alreadyDefinedUnit = this.cachedFile.getElement<Unit>(unitPropertyQuads[0]?.subject.value);

    if (alreadyDefinedUnit) {
      return alreadyDefinedUnit;
    }

    defaultUnit.setExternalReference(this.rdfModel.isExternalRef);

    unitPropertyQuads.forEach(quad => {
      if (this.samm.isSymbolProperty(quad.predicate.value)) {
        defaultUnit.symbol = quad.object.value;
      } else if (this.samm.isReferenceUnitProperty(quad.predicate.value)) {
        defaultUnit.referenceUnit = this.createUnit(quad.object.value);
        if (defaultUnit.referenceUnit) defaultUnit.children.push(defaultUnit);
      } else if (this.samm.isConversionFactorProperty(quad.predicate.value)) {
        defaultUnit.conversionFactor = quad.object.value;
      } else if (this.samm.isNumericConversionFactorProperty(quad.predicate.value)) {
        defaultUnit.numericConversionFactor = quad.object.value;
      } else if (this.samm.isCommonCodeProperty(quad.predicate.value)) {
        defaultUnit.code = quad.object.value;
      } else if (this.samm.isQuantityKindProperty(quad.predicate.value)) {
        quantityKindNames.push(quad.object.value);
      }
    });

    this.metaModelElementInstantiator.initBaseProperties(unitPropertyQuads, defaultUnit, this.metaModelElementInstantiator.rdfModel);

    quantityKindNames.forEach(quantityKindName => {
      const quantityKind = this.createQuantityKind(quantityKindName);
      if (quantityKind) {
        defaultUnit.quantityKinds.push(quantityKind);
      }
      defaultUnit.children.push(...defaultUnit.quantityKinds);
    });

    syncElementWithChildren(defaultUnit);
    return <Unit>this.cachedFile.resolveElement(defaultUnit);
  }

  createPredefinedUnit(name: string, parent?: Unit) {
    const defaultUnit = new DefaultUnit(this.samm.version, null, null, null, null, null);
    const unit = sammUDefinition.units[name.replace(this.sammU.getNamespace(), '')];

    if (unit) {
      defaultUnit.name = unit.name;
      defaultUnit.addPreferredName('en', unit.label);
      defaultUnit.aspectModelUrn = `${this.metaModelElementInstantiator.sammU.getDefaultUnitUri()}#${defaultUnit.name}`;
      defaultUnit.symbol = unit.symbol;
      defaultUnit.code = unit.code;
      defaultUnit.conversionFactor = unit.conversionFactor;
      defaultUnit.quantityKinds = unit.quantityKinds;

      if (!parent) {
        defaultUnit.referenceUnit = unit.referenceUnit ? this.createUnit(unit.referenceUnit().name, defaultUnit) : null;
      }

      return defaultUnit;
    }

    return null;
  }
}
