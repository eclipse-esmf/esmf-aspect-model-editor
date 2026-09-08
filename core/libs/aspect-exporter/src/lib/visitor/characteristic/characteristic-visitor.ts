/*
 * Copyright (c) 2026 Robert Bosch Manufacturing Solutions GmbH
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
import {simpleDataTypes} from '@ame/shared';
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
  DefaultValue,
  NamedElement,
  Samm,
  SammC,
} from '@esmf/aspect-model-loader';
import {DataFactory, Literal, NamedNode, Quad_Subject, Store} from 'n3';
import {RdfListService} from '../../rdf-list';
import {RdfNodeService} from '../../rdf-node';
import {BaseVisitor} from '../base-visitor';
import {ConstraintVisitor} from '../constraint/constraint-visitor';

@Injectable({providedIn: 'root'})
export class CharacteristicVisitor extends BaseVisitor<DefaultCharacteristic> {
  public rdfNodeService = inject(RdfNodeService);
  public rdfListService = inject(RdfListService);
  public loadedFilesService = inject(LoadedFilesService);
  public constraintVisitor = inject(ConstraintVisitor);

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
    DefaultTrait: (characteristic: DefaultTrait, subject?: Quad_Subject) => this.updateTrait(characteristic, subject),
    DefaultQuantifiable: (characteristic: DefaultQuantifiable, subject?: Quad_Subject) => this.updateQuantifiable(characteristic, subject),
    DefaultMeasurement: (characteristic: DefaultMeasurement, subject?: Quad_Subject) => this.updateMeasurement(characteristic, subject),
    DefaultEnumeration: (characteristic: DefaultEnumeration, subject?: Quad_Subject) => this.updateEnumeration(characteristic, subject),
    DefaultState: (characteristic: DefaultState, subject?: Quad_Subject) => this.updateState(characteristic, subject),
    DefaultDuration: (characteristic: DefaultDuration, subject?: Quad_Subject) => this.updateDuration(characteristic, subject),
    DefaultCollection: (characteristic: DefaultCollection, subject?: Quad_Subject) => this.updateCollection(characteristic, subject),
    DefaultList: (characteristic: DefaultList, subject?: Quad_Subject) => this.updateCollection(characteristic, subject),
    DefaultSet: (characteristic: DefaultSet, subject?: Quad_Subject) => this.updateCollection(characteristic, subject),
    DefaultSortedSet: (characteristic: DefaultSortedSet, subject?: Quad_Subject) => this.updateCollection(characteristic, subject),
    DefaultTimeSeries: (characteristic: DefaultTimeSeries, subject?: Quad_Subject) => this.updateCollection(characteristic, subject),
    DefaultCode: (characteristic: DefaultCode, subject?: Quad_Subject) => this.updateCode(characteristic, subject),
    DefaultEither: (characteristic: DefaultEither, subject?: Quad_Subject) => this.updateEither(characteristic, subject),
    DefaultSingleEntity: (characteristic: DefaultSingleEntity, subject?: Quad_Subject) => this.updateSingleEntity(characteristic, subject),
    DefaultStructuredValue: (characteristic: DefaultStructuredValue, subject?: Quad_Subject) =>
      this.updateStructuredValue(characteristic, subject),
  };

  visit(characteristic: DefaultCharacteristic, customSubject?: Quad_Subject): DefaultCharacteristic {
    if (!customSubject && characteristic.isAnonymous?.()) {
      return characteristic;
    }

    if (!customSubject) {
      this.setPrefix(characteristic.aspectModelUrn);
      this.updateParents(characteristic);
    }

    if (characteristic.isPredefined) {
      return characteristic;
    }

    this.updateProperties(characteristic, customSubject);
    this.characteristicsCallback[characteristic.className]?.(characteristic, customSubject);

    return characteristic;
  }

  // Types of characteristics
  private updateTrait(characteristic: DefaultTrait, customSubject?: Quad_Subject) {
    const subject = customSubject || DataFactory.namedNode(characteristic.aspectModelUrn);
    // update baseCharacteristic
    if (characteristic.baseCharacteristic) {
      if (characteristic.baseCharacteristic.isAnonymous?.()) {
        const baseBlank = DataFactory.blankNode();
        this.store.addQuad(DataFactory.triple(subject, this.sammC.BaseCharacteristicProperty(), baseBlank));
        this.visit(characteristic.baseCharacteristic, baseBlank);
      } else if (characteristic.baseCharacteristic.aspectModelUrn) {
        this.store.addQuad(
          DataFactory.triple(
            subject,
            this.sammC.BaseCharacteristicProperty(),
            DataFactory.namedNode(characteristic.baseCharacteristic.aspectModelUrn),
          ),
        );
        this.setPrefix(characteristic.baseCharacteristic.aspectModelUrn);
      }
    }

    // update constraints
    this.store.removeQuads(this.store.getQuads(subject, this.sammC.ConstraintProperty(), null, null));

    for (const constraint of characteristic.constraints || []) {
      if (!constraint) {
        continue;
      }

      if (constraint.isAnonymous?.()) {
        const constraintBlank = DataFactory.blankNode();
        this.store.addQuad(DataFactory.triple(subject, this.sammC.ConstraintProperty(), constraintBlank));
        this.constraintVisitor.visit(constraint, characteristic.baseCharacteristic?.dataType, constraintBlank);
      } else if (constraint.aspectModelUrn) {
        this.store.addQuad(DataFactory.triple(subject, this.sammC.ConstraintProperty(), DataFactory.namedNode(constraint.aspectModelUrn)));
        this.setPrefix(constraint.aspectModelUrn);
      }
    }
  }

  private updateQuantifiable(characteristic: DefaultQuantifiable, customSubject?: Quad_Subject) {
    if (!characteristic.unit?.aspectModelUrn) {
      return;
    }

    this.updateUnit(characteristic, customSubject);
  }

  private updateMeasurement(characteristic: DefaultMeasurement, customSubject?: Quad_Subject) {
    this.updateUnit(characteristic, customSubject);
  }

  private updateEnumeration(characteristic: DefaultEnumeration, _customSubject?: Quad_Subject) {
    this.rdfListService.push(characteristic, ...characteristic.values);
    for (const value of characteristic.values) {
      if (value instanceof DefaultValue) {
        if (!value.isAnonymous?.()) {
          this.setPrefix(value.aspectModelUrn);
        }
      } else if (value instanceof DefaultEntityInstance) {
        this.setPrefix(value.aspectModelUrn);
      }
    }
  }

  private updateState(characteristic: DefaultState, customSubject?: Quad_Subject) {
    this.updateEnumeration(characteristic, customSubject);

    const subject = customSubject || DataFactory.namedNode(characteristic.aspectModelUrn);
    let object = null;
    const dataTypeUrn =
      characteristic.dataType?.urn ||
      characteristic.dataType?.aspectModelUrn ||
      (typeof (characteristic.dataType as any)?.getUrn === 'function' ? (characteristic.dataType as any).getUrn() : null) ||
      simpleDataTypes.string.isDefinedBy;
    if (characteristic.defaultValue instanceof NamedElement) {
      object = DataFactory.namedNode(characteristic.defaultValue.aspectModelUrn);
    } else if (characteristic.defaultValue) {
      object = DataFactory.literal(characteristic.defaultValue.value as string, DataFactory.namedNode(dataTypeUrn));
    }

    this.removeOldAndAddNewReference(subject, this.sammC.DefaultValueProperty(), object);
  }

  private updateDuration(characteristic: DefaultDuration, customSubject?: Quad_Subject) {
    this.updateUnit(characteristic, customSubject);
  }

  private updateCollection(characteristic: DefaultCollection, customSubject?: Quad_Subject) {
    if (!characteristic.elementCharacteristic) {
      return;
    }

    this.updateElementCharacteristic(characteristic, customSubject);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private updateCode(_characteristic: DefaultCode, _customSubject?: Quad_Subject) {
    // To be discussed
  }

  private updateEither(characteristic: DefaultEither, customSubject?: Quad_Subject) {
    const subject = customSubject || DataFactory.namedNode(characteristic.aspectModelUrn);
    if (characteristic.left) {
      if (characteristic.left.isAnonymous?.()) {
        const leftBlank = DataFactory.blankNode();
        this.store.addQuad(DataFactory.triple(subject, this.sammC.EitherLeftProperty(), leftBlank));
        this.visit(characteristic.left, leftBlank);
      } else {
        this.store.addQuad(
          DataFactory.triple(subject, this.sammC.EitherLeftProperty(), DataFactory.namedNode(characteristic.left.aspectModelUrn)),
        );
        this.setPrefix(characteristic.left.aspectModelUrn);
      }
    }

    if (characteristic.right) {
      if (characteristic.right.isAnonymous?.()) {
        const rightBlank = DataFactory.blankNode();
        this.store.addQuad(DataFactory.triple(subject, this.sammC.EitherRightProperty(), rightBlank));
        this.visit(characteristic.right, rightBlank);
      } else {
        this.store.addQuad(
          DataFactory.triple(subject, this.sammC.EitherRightProperty(), DataFactory.namedNode(characteristic.right.aspectModelUrn)),
        );
        this.setPrefix(characteristic.right.aspectModelUrn);
      }
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private updateSingleEntity(_characteristic: DefaultSingleEntity, _customSubject?: Quad_Subject) {
    // nothing to add
  }

  private updateStructuredValue(characteristic: DefaultStructuredValue, customSubject?: Quad_Subject) {
    const subject = customSubject || DataFactory.namedNode(characteristic.aspectModelUrn);
    // remove deconstructionRule
    this.store.addQuad(
      DataFactory.triple(subject, this.sammC.DeconstructionRuleProperty(), DataFactory.literal(characteristic.deconstructionRule)),
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
  private updateProperties(characteristic: DefaultCharacteristic, subject?: Quad_Subject) {
    const properties = {
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
    };

    if (subject) {
      this.rdfNodeService.update(characteristic, properties, subject);
    } else {
      this.rdfNodeService.update(characteristic, properties);
    }

    if (characteristic.dataType instanceof DefaultEntity) {
      this.setPrefix(characteristic.dataType.aspectModelUrn);
    }
  }

  private removeOldAndAddNewReference(subject: Quad_Subject, predicate: NamedNode, object: NamedNode | Literal) {
    const existing = this.store.getQuads(subject, predicate, object, null);
    if (existing.length) {
      return;
    }

    this.store.removeQuads(this.store.getQuads(subject, predicate, null, null));
    this.store.addQuad(DataFactory.triple(subject, predicate, object));
  }

  private updateUnit(characteristic: DefaultMeasurement | DefaultQuantifiable | DefaultDuration, customSubject?: Quad_Subject) {
    if (!characteristic.unit) {
      return;
    }

    const subject = customSubject || DataFactory.namedNode(characteristic.aspectModelUrn);
    this.store.addQuad(DataFactory.triple(subject, this.sammC.UnitProperty(), DataFactory.namedNode(characteristic.unit.aspectModelUrn)));
    this.setPrefix(characteristic.unit.aspectModelUrn);
  }

  private updateElementCharacteristic(characteristic: DefaultCollection, customSubject?: Quad_Subject) {
    if (!characteristic.elementCharacteristic) {
      return;
    }

    const subject = customSubject || DataFactory.namedNode(characteristic.aspectModelUrn);
    if (characteristic.elementCharacteristic.isAnonymous?.()) {
      const blankNode = DataFactory.blankNode();
      this.store.addQuad(DataFactory.triple(subject, this.sammC.ElementCharacteristicProperty(), blankNode));
      this.visit(characteristic.elementCharacteristic, blankNode);
      return;
    }

    this.store.addQuad(
      DataFactory.triple(
        subject,
        this.sammC.ElementCharacteristicProperty(),
        DataFactory.namedNode(characteristic.elementCharacteristic.aspectModelUrn),
      ),
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

      if (parent instanceof DefaultProperty && !parent.isPredefined) {
        this.removeOldAndAddNewReference(
          DataFactory.namedNode(parent.aspectModelUrn),
          parent instanceof DefaultCollection ? this.sammC.ElementCharacteristicProperty() : this.samm.CharacteristicProperty(),
          DataFactory.namedNode(characteristic.aspectModelUrn),
        );
      }
    }

    return characteristic.aspectModelUrn;
  }
}
