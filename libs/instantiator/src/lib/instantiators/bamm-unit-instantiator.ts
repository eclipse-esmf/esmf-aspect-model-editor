/*
 * Copyright (c) 2020 Robert Bosch Manufacturing Solutions GmbH, Germany. All rights reserved.
 */
import {DataFactory} from 'n3';
import {DefaultQuantityKind, DefaultUnit, Entity, QuantityKind, Unit} from '@bame/meta-model';
import {MetaModelElementInstantiator} from '../meta-model-element-instantiator';
import {Bamm, Bammu} from '@bame/vocabulary';

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

  createUnit(name: string): Unit {
    if (!name) {
      return null;
    }

    const quantityKindNames = new Array<string>();
    const predefinedUnit = this.createPredefinedUnit(name);

    if (predefinedUnit) {
      return predefinedUnit;
    }

    const defaultUnit = new DefaultUnit(this.bamm.version, null, null, null, null, null);
    const unitPropertyQuads = this.metaModelElementInstantiator.rdfModel.store.getQuads(DataFactory.namedNode(name), null, null, null);
    const alreadyDefinedUnit = this.cachedFile.getElement<Entity>(unitPropertyQuads[0]?.subject.value, this.isIsolated);

    if (alreadyDefinedUnit) {
      return alreadyDefinedUnit;
    }

    defaultUnit.setExternalReference(this.rdfModel.isExternalRef);

    unitPropertyQuads.forEach(quad => {
      if (this.bamm.isNameProperty(quad.predicate.value)) {
        defaultUnit.name = quad.object.value;
      } else if (this.bammu.isSymbolProperty(quad.predicate.value)) {
        defaultUnit.symbol = quad.object.value;
      } else if (this.bammu.isReferenceUnitProperty(quad.predicate.value)) {
        defaultUnit.referenceUnit = this.createUnit(quad.object.value);
      } else if (this.bammu.isConversionFactorProperty(quad.predicate.value)) {
        defaultUnit.conversionFactor = quad.object.value;
      } else if (this.bammu.isNumericConversionFactorProperty(quad.predicate.value)) {
        defaultUnit.numericConversionFactor = quad.object.value;
      } else if (this.bammu.isCommonCodeProperty(quad.predicate.value)) {
        defaultUnit.code = quad.object.value;
      } else if (this.bammu.isQuantityKindProperty(quad.predicate.value)) {
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
