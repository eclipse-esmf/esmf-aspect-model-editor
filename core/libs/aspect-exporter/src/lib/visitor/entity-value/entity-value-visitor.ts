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

import {Injectable} from '@angular/core';
import {DefaultCharacteristic, DefaultCollection, DefaultEntityValue, EntityValueProperty, LangStringProperty} from '@ame/meta-model';
import {ModelService, RdfService} from '@ame/rdf/services';
import {DataFactory, Literal, NamedNode} from 'n3';
import {BaseVisitor} from '../base-visitor';
import {isDataTypeLangString} from '@ame/shared';
import {RdfListService} from '../../rdf-list';

@Injectable()
export class EntityValueVisitor extends BaseVisitor<DefaultEntityValue> {
  constructor(private rdfListService: RdfListService, public modelService: ModelService, rdfService: RdfService) {
    super(rdfService);
  }

  visit(entityValue: DefaultEntityValue): DefaultEntityValue {
    return this.visitModel(entityValue);
  }

  visitModel(entityValue: DefaultEntityValue): DefaultEntityValue {
    this.setPrefix(entityValue.aspectModelUrn);
    this.updateProperties(entityValue);
    this.updateBaseProperties(entityValue);
    return entityValue;
  }

  private updateProperties(entityValue: DefaultEntityValue): void {
    const {aspectModelUrn} = entityValue;
    const rdfModel = this.modelService.currentRdfModel;

    const {propertyCollectionWithLangString, property} = entityValue.properties.reduce(
      (acc, property) => (
        isDataTypeLangString(property.key.property) && property.key.property.characteristic instanceof DefaultCollection
          ? acc.propertyCollectionWithLangString.push(property)
          : acc.property.push(property),
        acc
      ),
      {
        propertyCollectionWithLangString: [],
        property: [],
      }
    );

    if (propertyCollectionWithLangString.length > 0) {
      const withoutEmptyLangString = propertyCollectionWithLangString.filter(prop => {
        return prop.value.value !== null && prop.value.value !== undefined;
      });

      const langStringRdfObject = withoutEmptyLangString.map(this.createObjectForCollectionLangStringRDF.bind(this));
      this.rdfListService.pushEntityValueLangString(entityValue, ...langStringRdfObject);
    }

    if (property.length > 0) {
      const propertiesWithoutEmptyLangString = property.filter(prop => {
        const urn = prop.key.property.characteristic.dataType.urn;
        return !(this.getDataTypeFromUrn(urn) === 'langString' && prop.value === '');
      });

      propertiesWithoutEmptyLangString.forEach(property => {
        const rdfObject = this.createObjectForRDF(property);
        const {key, value} = property;

        rdfModel.store.addQuad(DataFactory.namedNode(aspectModelUrn), DataFactory.namedNode(key.property.aspectModelUrn), rdfObject);

        this.handleExternalReference(value, aspectModelUrn);
      });
    }
  }

  private createObjectForCollectionLangStringRDF(ev: EntityValueProperty): {predicate: NamedNode; literal: Literal} {
    const langString = ev.value as LangStringProperty;
    const predicate = DataFactory.namedNode(ev.key.property.aspectModelUrn);
    return {
      predicate: predicate,
      literal: DataFactory.literal(langString?.value?.toString(), langString?.language?.toString()),
    };
  }

  private createObjectForRDF({key, value}: EntityValueProperty): NamedNode | Literal {
    if (value instanceof DefaultEntityValue) {
      return DataFactory.namedNode(value.aspectModelUrn);
    }

    if (isDataTypeLangString(key.property) && key.property.characteristic instanceof DefaultCharacteristic) {
      const langString = value as LangStringProperty;
      return DataFactory.literal(langString?.value?.toString(), langString?.language?.toString());
    }

    const dataType = key.property?.getDeepLookUpDataType();
    return DataFactory.literal(value?.toString(), dataType ? DataFactory.namedNode(dataType.getUrn()) : undefined);
  }

  private handleExternalReference(value: any, aspectModelUrn: string): void {
    if (value instanceof DefaultEntityValue && value.isExternalReference()) {
      this.setPrefix(aspectModelUrn);
    }
  }
  private getDataTypeFromUrn(urn: string): string {
    const parts = urn.split('#');
    return parts.length > 1 ? parts[1] : null;
  }
  private updateBaseProperties(entityValue: DefaultEntityValue): void {
    const rdfModel = this.modelService.currentRdfModel;
    rdfModel.store.addQuad(
      DataFactory.namedNode(entityValue.aspectModelUrn),
      rdfModel.SAMM().RdfType(),
      DataFactory.namedNode(entityValue.entity.aspectModelUrn)
    );
  }
}
