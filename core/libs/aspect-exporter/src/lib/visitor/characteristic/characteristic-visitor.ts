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
import {
  BaseMetaModelElement,
  CanExtend,
  DefaultCharacteristic,
  DefaultCode,
  DefaultCollection,
  DefaultDuration,
  DefaultEither,
  DefaultEntity,
  DefaultEntityValue,
  DefaultEnumeration,
  DefaultList,
  DefaultMeasurement,
  DefaultProperty,
  DefaultQuantifiable,
  DefaultSet,
  DefaultSingleEntity,
  DefaultSortedSet,
  DefaultState,
  DefaultStructuredValue,
  DefaultTimeSeries,
  DefaultTrait,
} from '@ame/meta-model';
import {MxGraphHelper, MxGraphService} from '@ame/mx-graph';
import {RdfService} from '@ame/rdf/services';
import {Bamm, Bammc} from '@ame/vocabulary';
import {mxgraph} from 'mxgraph-factory';
import {DataFactory, Literal, NamedNode, Store} from 'n3';
import {RdfListService} from '../../rdf-list';
import {RdfNodeService} from '../../rdf-node/rdf-node.service';
import {BaseVisitor} from '../base-visitor';

@Injectable()
export class CharacteristicVisitor extends BaseVisitor<DefaultCharacteristic> {
  private get store(): Store {
    return this.rdfNodeService.modelService.getLoadedAspectModel().rdfModel.store;
  }

  private get bamm(): Bamm {
    return this.rdfNodeService.modelService.getLoadedAspectModel().rdfModel.BAMM();
  }

  private get bammc(): Bammc {
    return this.rdfNodeService.modelService.getLoadedAspectModel().rdfModel.BAMMC();
  }

  private readonly characteristicsCallback = {
    DefaultTrait: (characteristic: DefaultTrait) => this.updateTrait(characteristic),
    DefaultQuantifiable: (characteristic: DefaultQuantifiable) => this.updateQuantifiable(characteristic),
    DefaultMeasurement: (characteristic: DefaultMeasurement) => this.updateMeasurement(characteristic),
    DefaultEnumeration: (characteristic: DefaultEnumeration) => this.updateEnumeration(characteristic),
    DefaultState: (characteristic: DefaultState) => this.updateState(characteristic),
    DefaultDuration: (characteristic: DefaultDuration) => this.updateDuration(characteristic),
    DefaultCollection: (characteristic: DefaultCollection) => this.updateCollection(characteristic),
    DefaultList: (characteristic: DefaultList) => this.updateCollection(characteristic),
    DefaultSet: (characteristic: DefaultSet) => this.updateCollection(characteristic),
    DefaultSortedSet: (characteristic: DefaultSortedSet) => this.updateCollection(characteristic),
    DefaultTimeSeries: (characteristic: DefaultTimeSeries) => this.updateCollection(characteristic),
    DefaultCode: (characteristic: DefaultCode) => this.updateCode(characteristic),
    DefaultEither: (characteristic: DefaultEither) => this.updateEither(characteristic),
    DefaultSingleEntity: (characteristic: DefaultSingleEntity) => this.updateSingleEntity(characteristic),
    DefaultStructuredValue: (characteristic: DefaultStructuredValue) => this.updateStructuredValue(characteristic),
  };

  constructor(
    private rdfNodeService: RdfNodeService,
    private rdfListService: RdfListService,
    private mxGraphService: MxGraphService,
    rdfService: RdfService
  ) {
    super(rdfService);
  }

  visit(cell: mxgraph.mxCell): DefaultCharacteristic {
    const characteristic = MxGraphHelper.getModelElement<DefaultCharacteristic>(cell);
    this.setPrefix(characteristic.aspectModelUrn);
    this.updateParents(cell);

    if (characteristic.isPredefined()) {
      return characteristic;
    }

    this.updateProperties(characteristic);
    this.characteristicsCallback[characteristic.className]?.(characteristic);

    return characteristic;
  }

  // Types of characteristics
  private updateTrait(characteristic: DefaultTrait) {
    // update baseCharacteristic
    if (characteristic.baseCharacteristic?.aspectModelUrn) {
      this.store.addQuad(
        DataFactory.namedNode(characteristic.aspectModelUrn),
        this.bammc.BaseCharacteristicProperty(),
        DataFactory.namedNode(characteristic.baseCharacteristic.aspectModelUrn)
      );
      this.setPrefix(characteristic.baseCharacteristic.aspectModelUrn);
    }

    // update constraints
    this.store.removeQuads(
      this.store.getQuads(DataFactory.namedNode(characteristic.aspectModelUrn), this.bammc.ConstraintProperty(), null, null)
    );

    for (const constraint of characteristic.constraints || []) {
      if (!constraint?.aspectModelUrn) {
        continue;
      }

      this.store.addQuad(
        DataFactory.triple(
          DataFactory.namedNode(characteristic.aspectModelUrn),
          this.bammc.ConstraintProperty(),
          DataFactory.namedNode(constraint.aspectModelUrn)
        )
      );
      this.setPrefix(constraint.aspectModelUrn);
    }
  }

  private updateQuantifiable(characteristic: DefaultQuantifiable) {
    if (!characteristic.unit?.aspectModelUrn) {
      return;
    }

    this.updateUnit(characteristic);
  }

  private updateMeasurement(characteristic: DefaultMeasurement) {
    this.updateUnit(characteristic);
  }

  private updateEnumeration(characteristic: DefaultEnumeration) {
    this.rdfListService.push(characteristic, ...characteristic.values);
    if (!(characteristic.dataType instanceof DefaultEntity)) {
      return;
    }

    for (const value of characteristic.values) {
      if (value instanceof DefaultEntityValue) {
        this.setPrefix(value.aspectModelUrn);
      }
    }
  }

  private updateState(characteristic: DefaultState) {
    this.updateEnumeration(characteristic);

    let object = null;
    if (characteristic.defaultValue instanceof DefaultEntity) {
      object = DataFactory.namedNode(characteristic.defaultValue.aspectModelUrn);
    } else {
      object = DataFactory.literal(
        characteristic.defaultValue.toString(),
        characteristic.dataType ? DataFactory.namedNode(characteristic.dataType?.getUrn()) : undefined
      );
    }

    this.removeOldAndAddNewReference(DataFactory.namedNode(characteristic.aspectModelUrn), this.bammc.DefaultValueProperty(), object);
  }

  private updateDuration(characteristic: DefaultDuration) {
    this.updateUnit(characteristic);
  }

  private updateCollection(characteristic: DefaultCollection) {
    if (!characteristic.elementCharacteristic) {
      return;
    }

    this.updateElementCharacteristic(characteristic);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private updateCode(_characteristic: DefaultCode) {
    // To be discussed
  }

  private updateEither(characteristic: DefaultEither) {
    if (characteristic.left) {
      // Updating Left
      this.store.addQuad(
        DataFactory.namedNode(characteristic.aspectModelUrn),
        this.bammc.EitherLeftProperty(),
        DataFactory.namedNode(characteristic.left.aspectModelUrn)
      );
      this.setPrefix(characteristic.left.aspectModelUrn);
    }

    if (characteristic.right) {
      // Updating Right
      this.store.addQuad(
        DataFactory.namedNode(characteristic.aspectModelUrn),
        this.bammc.EitherRightProperty(),
        DataFactory.namedNode(characteristic.right.aspectModelUrn)
      );
      this.setPrefix(characteristic.right.aspectModelUrn);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private updateSingleEntity(_characteristic: DefaultSingleEntity) {
    // nothing to add
  }

  private updateStructuredValue(characteristic: DefaultStructuredValue) {
    // remove deconstructionRule
    this.store.addQuad(
      DataFactory.namedNode(characteristic.aspectModelUrn),
      this.bammc.DeconstructionRuleProperty(),
      DataFactory.literal(characteristic.deconstructionRule)
    );

    // update elements
    this.rdfListService.push(characteristic, ...characteristic.elements);

    for (const element of characteristic.elements) {
      if (element instanceof DefaultProperty) {
        this.setPrefix(element.aspectModelUrn);
      }
    }
  }

  // base functions
  private updateProperties(characteristic: DefaultCharacteristic) {
    this.rdfNodeService.update(characteristic, {
      name: characteristic.name,
      preferredName: characteristic.getAllLocalesPreferredNames()?.map(language => ({
        language,
        value: characteristic.getPreferredName(language),
      })),
      description: characteristic.getAllLocalesDescriptions()?.map(language => ({
        language,
        value: characteristic.getDescription(language),
      })),
      see: characteristic.getSeeReferences() || [],
      dataType: characteristic.dataType?.getUrn(),
    });

    if (characteristic.dataType instanceof DefaultEntity) {
      this.setPrefix(characteristic.dataType.aspectModelUrn);
    }
  }

  private removeOldAndAddNewReference(subject: NamedNode, predicate: NamedNode, object: NamedNode | Literal) {
    const existing = this.store.getQuads(subject, predicate, object, null);
    if (existing.length) {
      return;
    }

    this.store.removeQuads(this.store.getQuads(subject, predicate, null, null));
    this.store.addQuad(DataFactory.triple(subject, predicate, object));
  }

  private updateUnit(characteristic: DefaultMeasurement | DefaultQuantifiable | DefaultDuration) {
    if (!characteristic.unit) {
      return;
    }

    this.store.addQuad(
      DataFactory.namedNode(characteristic.aspectModelUrn),
      this.bammc.UnitProperty(),
      DataFactory.namedNode(characteristic.unit.aspectModelUrn)
    );
    this.setPrefix(characteristic.unit.aspectModelUrn);
  }

  private updateElementCharacteristic(characteristic: DefaultCollection) {
    if (!characteristic.elementCharacteristic) {
      return;
    }

    this.store.addQuad(
      DataFactory.namedNode(characteristic.aspectModelUrn),
      this.bammc.ElementCharacteristicProperty(),
      DataFactory.namedNode(characteristic.elementCharacteristic.aspectModelUrn)
    );
    this.setPrefix(characteristic.elementCharacteristic.aspectModelUrn);
  }

  private updateParents(cell: mxgraph.mxCell): string {
    const characteristic = MxGraphHelper.getModelElement<DefaultCharacteristic>(cell);
    const parents = this.getParents(cell);

    for (const parent of parents) {
      if (parent instanceof DefaultTrait || parent instanceof DefaultEither) {
        continue;
      }

      if (parent instanceof CanExtend && parent.extendedElement) {
        continue;
      }

      if (characteristic.dataType?.isComplex() && parent instanceof DefaultProperty) {
        // remove exampleValue for complex datatype

        parent.exampleValue = null;
        this.rdfNodeService.update(parent, {exampleValue: null});
      }

      this.removeOldAndAddNewReference(
        DataFactory.namedNode(parent.aspectModelUrn),
        parent instanceof DefaultCollection ? this.bammc.ElementCharacteristicProperty() : this.bamm.CharacteristicProperty(),
        DataFactory.namedNode(characteristic.aspectModelUrn)
      );
    }

    return characteristic.aspectModelUrn;
  }

  private getParents(cell: mxgraph.mxCell): BaseMetaModelElement[] {
    return this.mxGraphService
      .resolveParents(cell)
      .map((parent: mxgraph.mxCell) => MxGraphHelper.getModelElement<DefaultProperty | DefaultCharacteristic>(parent));
  }
}
