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
import {inject, Injectable} from '@angular/core';
import {
  DefaultCharacteristic,
  DefaultCode,
  DefaultCollection,
  DefaultDuration,
  DefaultEither,
  DefaultEntity,
  DefaultEntityInstance,
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
  NamedElement,
  Samm,
  SammC,
} from '@esmf/aspect-model-loader';
import {DataFactory, Literal, NamedNode, Store} from 'n3';
import {RdfListService} from '../../rdf-list';
import {RdfNodeService} from '../../rdf-node';
import {BaseVisitor} from '../base-visitor';

@Injectable({providedIn: 'root'})
export class CharacteristicVisitor extends BaseVisitor<DefaultCharacteristic> {
  public rdfNodeService = inject(RdfNodeService);
  public rdfListService = inject(RdfListService);
  public loadedFilesService = inject(LoadedFilesService);

  private get store(): Store {
    return this.loadedFilesService.currentLoadedFile.rdfModel.store;
  }

  private get samm(): Samm {
    return this.loadedFilesService.currentLoadedFile.rdfModel.samm;
  }

  private get sammC(): SammC {
    return this.loadedFilesService.currentLoadedFile.rdfModel.sammC;
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

  visit(characteristic: DefaultCharacteristic): DefaultCharacteristic {
    this.setPrefix(characteristic.aspectModelUrn);
    this.updateParents(characteristic);

    if (characteristic.isPredefined) {
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
        this.sammC.BaseCharacteristicProperty(),
        DataFactory.namedNode(characteristic.baseCharacteristic.aspectModelUrn),
      );
      this.setPrefix(characteristic.baseCharacteristic.aspectModelUrn);
    }

    // update constraints
    this.store.removeQuads(
      this.store.getQuads(DataFactory.namedNode(characteristic.aspectModelUrn), this.sammC.ConstraintProperty(), null, null),
    );

    for (const constraint of characteristic.constraints || []) {
      if (!constraint?.aspectModelUrn) {
        continue;
      }

      this.store.addQuad(
        DataFactory.triple(
          DataFactory.namedNode(characteristic.aspectModelUrn),
          this.sammC.ConstraintProperty(),
          DataFactory.namedNode(constraint.aspectModelUrn),
        ),
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
      if (value instanceof DefaultEntityInstance) {
        this.setPrefix(value.aspectModelUrn);
      }
    }
  }

  private updateState(characteristic: DefaultState) {
    this.updateEnumeration(characteristic);

    let object = null;
    if (characteristic.defaultValue instanceof NamedElement) {
      object = DataFactory.namedNode(characteristic.defaultValue.aspectModelUrn);
    } else {
      object = DataFactory.literal(
        characteristic.defaultValue.value as string,
        characteristic.dataType ? DataFactory.namedNode(characteristic.dataType?.getUrn()) : undefined,
      );
    }

    this.removeOldAndAddNewReference(DataFactory.namedNode(characteristic.aspectModelUrn), this.sammC.DefaultValueProperty(), object);
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
        this.sammC.EitherLeftProperty(),
        DataFactory.namedNode(characteristic.left.aspectModelUrn),
      );
      this.setPrefix(characteristic.left.aspectModelUrn);
    }

    if (characteristic.right) {
      // Updating Right
      this.store.addQuad(
        DataFactory.namedNode(characteristic.aspectModelUrn),
        this.sammC.EitherRightProperty(),
        DataFactory.namedNode(characteristic.right.aspectModelUrn),
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
      this.sammC.DeconstructionRuleProperty(),
      DataFactory.literal(characteristic.deconstructionRule),
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
      preferredName: Array.from(characteristic.preferredNames.keys())?.map(language => ({
        language,
        value: characteristic.getPreferredName(language),
      })),
      description: Array.from(characteristic.descriptions.keys())?.map(language => ({
        language,
        value: characteristic.getDescription(language),
      })),
      see: characteristic.getSee() || [],
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
      this.sammC.UnitProperty(),
      DataFactory.namedNode(characteristic.unit.aspectModelUrn),
    );
    this.setPrefix(characteristic.unit.aspectModelUrn);
  }

  private updateElementCharacteristic(characteristic: DefaultCollection) {
    if (!characteristic.elementCharacteristic) {
      return;
    }

    this.store.addQuad(
      DataFactory.namedNode(characteristic.aspectModelUrn),
      this.sammC.ElementCharacteristicProperty(),
      DataFactory.namedNode(characteristic.elementCharacteristic.aspectModelUrn),
    );
    this.setPrefix(characteristic.elementCharacteristic.aspectModelUrn);
  }

  private updateParents(characteristic: DefaultCharacteristic): string {
    for (const parent of characteristic.parents) {
      if (parent instanceof DefaultTrait || parent instanceof DefaultEither) {
        continue;
      }

      if ((parent instanceof DefaultProperty && parent.getExtends()) || this.loadedFilesService.isElementExtern(parent)) {
        continue;
      }

      if (characteristic.dataType?.isComplexType() && parent instanceof DefaultProperty && !parent.isPredefined) {
        // removing exampleValue for complex datatype
        parent.exampleValue = null;
        this.rdfNodeService.update(parent, {exampleValue: null});
      }

      parent instanceof DefaultProperty &&
        !parent.isPredefined &&
        this.removeOldAndAddNewReference(
          DataFactory.namedNode(parent.aspectModelUrn),
          parent instanceof DefaultCollection ? this.sammC.ElementCharacteristicProperty() : this.samm.CharacteristicProperty(),
          DataFactory.namedNode(characteristic.aspectModelUrn),
        );
    }

    return characteristic.aspectModelUrn;
  }
}
