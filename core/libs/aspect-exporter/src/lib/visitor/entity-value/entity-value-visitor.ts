/*
 * Copyright (c) 2023 Robert Bosch Manufacturing Solutions GmbH
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
import {DefaultEntityValue, EntityValueProperty, LangStringProperty} from '@ame/meta-model';
import {ModelService, RdfService} from '@ame/rdf/services';
import {DataFactory} from 'n3';
import {BaseVisitor} from '../base-visitor';
import {isDataTypeLangString} from '@ame/shared';

@Injectable()
export class EntityValueVisitor extends BaseVisitor<DefaultEntityValue> {
  constructor(public modelService: ModelService, rdfService: RdfService) {
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
    const rdfModel = this.modelService.getLoadedAspectModel().rdfModel;

    entityValue.properties.forEach(property => {
      const object = this.createObjectForRDF(property);
      const {key, value} = property;

      rdfModel.store.addQuad(DataFactory.namedNode(aspectModelUrn), DataFactory.namedNode(key.property.aspectModelUrn), object);

      this.handleExternalReference(value, aspectModelUrn);
    });
  }

  private createObjectForRDF({key, value}: EntityValueProperty): any {
    if (value instanceof DefaultEntityValue) {
      return DataFactory.namedNode(value.aspectModelUrn);
    }

    if (isDataTypeLangString(key.property)) {
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

  private updateBaseProperties(entityValue: DefaultEntityValue): void {
    const rdfModel = this.modelService.getLoadedAspectModel().rdfModel;
    rdfModel.store.addQuad(
      DataFactory.namedNode(entityValue.aspectModelUrn),
      rdfModel.SAMM().RdfType(),
      DataFactory.namedNode(entityValue.entity.aspectModelUrn)
    );
  }
}
