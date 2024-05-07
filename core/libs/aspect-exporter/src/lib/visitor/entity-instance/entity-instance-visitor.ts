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
import {DefaultCollection, DefaultEntityInstance, EntityInstanceProperty} from '@ame/meta-model';
import {ModelService, RdfService} from '@ame/rdf/services';
import {DataFactory, Literal, NamedNode} from 'n3';
import {BaseVisitor} from '../base-visitor';
import {isDataTypeLangString} from '@ame/shared';
import {RdfListService} from '../../rdf-list';
import {Samm} from '@ame/vocabulary';

@Injectable()
export class EntityInstanceVisitor extends BaseVisitor<DefaultEntityInstance> {
  constructor(private rdfListService: RdfListService, public modelService: ModelService, rdfService: RdfService) {
    super(rdfService);
  }

  visit(entityValue: DefaultEntityInstance): DefaultEntityInstance {
    return this.visitModel(entityValue);
  }

  visitModel(entityValue: DefaultEntityInstance): DefaultEntityInstance {
    this.setPrefix(entityValue.aspectModelUrn);
    this.updateProperties(entityValue);
    this.updateBaseProperties(entityValue);
    return entityValue;
  }

  private updateProperties(entityValue: DefaultEntityInstance): void {
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

    if (propertyCollectionWithLangString.length) {
      const withoutEmptyLangString = propertyCollectionWithLangString.filter(prop => prop.value !== null && prop.language !== undefined);

      const langStringRdfObject = withoutEmptyLangString.map(this.createObjectForCollectionLangStringRDF.bind(this));
      this.rdfListService.pushEntityValueLangString(entityValue, ...langStringRdfObject);
    }

    if (property.length) {
      const propertiesWithoutEmptyLangString = property.filter(prop => {
        const urn = prop.key.property?.characteristic?.dataType?.getUrn();
        return !(urn === `${Samm.RDF_URI}#langString` && prop.value === '');
      });

      propertiesWithoutEmptyLangString.forEach(property => {
        const rdfObject = this.createObjectForRDF(property);
        const {key, value} = property;

        rdfModel.store.addQuad(DataFactory.namedNode(aspectModelUrn), DataFactory.namedNode(key.property.aspectModelUrn), rdfObject);

        this.handleExternalReference(value, aspectModelUrn);
      });
    }
  }

  private createObjectForCollectionLangStringRDF(ev: EntityInstanceProperty): {predicate: NamedNode; literal: Literal} {
    return {
      predicate: DataFactory.namedNode(ev.key.property.aspectModelUrn),
      literal: DataFactory.literal(ev?.value?.toString(), ev?.language?.toString()),
    };
  }

  private createObjectForRDF({key, value, language}: EntityInstanceProperty): NamedNode | Literal {
    if (value instanceof DefaultEntityInstance) {
      return DataFactory.namedNode(value.aspectModelUrn);
    }

    if (isDataTypeLangString(key.property) && language) {
      return DataFactory.literal(value?.toString(), language?.toString());
    }

    const dataType = key.property?.getDeepLookUpDataType();
    return DataFactory.literal(value?.toString(), dataType ? DataFactory.namedNode(dataType.getUrn()) : undefined);
  }

  private handleExternalReference(value: any, aspectModelUrn: string): void {
    if (value instanceof DefaultEntityInstance && value.isExternalReference()) {
      this.setPrefix(aspectModelUrn);
    }
  }

  private updateBaseProperties(entityValue: DefaultEntityInstance): void {
    const rdfModel = this.modelService.currentRdfModel;
    rdfModel.store.addQuad(
      DataFactory.namedNode(entityValue.aspectModelUrn),
      rdfModel.SAMM().RdfType(),
      DataFactory.namedNode(entityValue.entity.aspectModelUrn)
    );
  }
}
