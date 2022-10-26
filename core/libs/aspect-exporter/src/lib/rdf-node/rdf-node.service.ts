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
import {BaseMetaModelElement, DefaultEncodingConstraint, Type} from '@ame/meta-model';
import {ModelService} from '@ame/rdf/services';
import {RdfModelUtil} from '@ame/rdf/utils';
import {LogService} from '@ame/shared';
import {BlankNode, DataFactory, Quad} from 'n3';
import {PropertyEnum} from './enums/property.enum';
import {BasePropertiesInterface, LocaleInterface} from './interfaces';

@Injectable({
  providedIn: 'root',
})
export class RdfNodeService {
  constructor(public loggerService: LogService, public modelService: ModelService) {}

  // Removes the quads corresponding to the given properties of an element
  // If no properties are given, all the quads for the element will be deleted
  public remove(metaModelElement: BaseMetaModelElement, properties?: string[]) {
    const rdfModel = this.modelService.getLoadedAspectModel().rdfModel;
    let quadsToBeRemoved: Quad[] = [];
    if (!properties?.length) {
      quadsToBeRemoved = rdfModel.store.getQuads(DataFactory.namedNode(metaModelElement.aspectModelUrn), null, null, null);
    } else {
      quadsToBeRemoved = properties
        .map(
          property =>
            rdfModel.store.getQuads(
              DataFactory.namedNode(metaModelElement.aspectModelUrn),
              DataFactory.namedNode(rdfModel.BAMM().getAspectModelUrn(property)),
              null,
              null
            )?.[0]
        )
        .filter(quad => quad); // filter null/undefined
    }
    rdfModel.store.removeQuads(quadsToBeRemoved);
    this.loggerService.logInfo(`Removed quads ${JSON.stringify(quadsToBeRemoved)}`);
  }

  // Updates the quads of the given element with the provided properties
  // In case no quads exist for the subject, the type quad will be added
  public update(metaModelElement: BaseMetaModelElement, properties: BasePropertiesInterface): void {
    const rdfModel = this.modelService.getLoadedAspectModel().rdfModel;
    const elementQuads: Quad[] = rdfModel.store.getQuads(DataFactory.namedNode(metaModelElement.aspectModelUrn), null, null, null);

    if (!elementQuads?.some(quad => rdfModel.BAMM().RdfType().value === quad.predicate.value)) {
      const newElement = DataFactory.triple(
        DataFactory.namedNode(metaModelElement.aspectModelUrn),
        rdfModel.BAMM().RdfType(),
        DataFactory.namedNode(RdfModelUtil.getFullQualifiedModelName(metaModelElement))
      );
      rdfModel.store.addQuad(newElement);
    }

    Object.keys(properties).forEach((key: string) => {
      if (key === 'characteristicType') {
        return;
      }

      const outdatedQuad = rdfModel.store.getQuads(
        DataFactory.namedNode(metaModelElement.aspectModelUrn),
        DataFactory.namedNode(rdfModel.BAMM().getAspectModelUrn(key)),
        null,
        null
      );

      if (outdatedQuad?.length) {
        rdfModel.store.removeQuads(outdatedQuad);
      }

      if (!properties[key] && properties[key] !== 0) {
        // in case of null, undefined or false, don't add the quads
        return;
      }

      const bamm = rdfModel.BAMM();
      const bammc = rdfModel.BAMMC();
      const bammu = rdfModel.BAMMU();

      switch (key) {
        case PropertyEnum.Description:
        case PropertyEnum.PreferredName:
          this.updateLocalizedValue(metaModelElement, properties, key);
          break;
        case PropertyEnum.See:
          this.updateArrayField(metaModelElement, properties, key, bamm.getAspectModelUrn(key));
          break;
        case metaModelElement instanceof DefaultEncodingConstraint && PropertyEnum.Value:
          this.addDatatype(
            metaModelElement,
            bamm.getAspectModelUrn(key),
            bamm.getEncodingList().find(enc => enc.value === properties[key]).isDefinedBy
          );
          break;
        case PropertyEnum.DataType:
          this.addDatatype(metaModelElement, bamm.getAspectModelUrn(key), properties[key]);
          break;
        case PropertyEnum.LowerBoundDefinition:
        case PropertyEnum.UpperBoundDefinition:
          this.addDatatype(metaModelElement, bammc.getAspectModelUrn(key), bammc.getAspectModelUrn(properties[key]));
          break;
        case PropertyEnum.MaxValue:
        case PropertyEnum.MinValue:
        case PropertyEnum.Scale:
        case PropertyEnum.Integer:
        case PropertyEnum.LocaleCode:
        case PropertyEnum.LanguageCode:
          this.addQuad(metaModelElement, properties[key], bammc.getAspectModelUrn(key), properties['characteristicType']);
          break;
        case PropertyEnum.CommonCode:
        case PropertyEnum.Symbol:
        case PropertyEnum.ConversionFactor:
        case PropertyEnum.NumericConversionFactor:
          this.addQuad(metaModelElement, properties[key], bammu.getAspectModelUrn(key));
          break;
        default:
          this.addQuad(metaModelElement, properties[key], bamm.getAspectModelUrn(key));
          break;
      }
    });
  }

  public updateBlankNode(element: BlankNode, metaModelElement: BaseMetaModelElement, properties: BasePropertiesInterface) {
    for (const key in properties) {
      const rdfModel = this.modelService.getLoadedAspectModel().rdfModel;

      if (!properties[key] && properties[key] !== 0) {
        // in case of null, undefined or false, don't add the quads
        continue;
      }

      const bamm = rdfModel.BAMM();
      switch (key) {
        case PropertyEnum.Description:
        case PropertyEnum.PreferredName:
          properties[key].forEach((localeValue: LocaleInterface) => {
            if (!localeValue.value && Number(localeValue.value) !== 0) {
              return;
            }

            rdfModel.store.addQuad(
              DataFactory.triple(
                DataFactory.namedNode(metaModelElement.aspectModelUrn),
                DataFactory.namedNode(rdfModel.BAMM().getAspectModelUrn(key)),
                DataFactory.literal(localeValue.value, localeValue.language)
              )
            );
          });
          break;
        case PropertyEnum.See:
          properties[key]?.forEach(value => {
            rdfModel.store.addQuad(DataFactory.triple(element, bamm.SeeProperty(), DataFactory.namedNode(`${value}`)));
          });
          break;
        case PropertyEnum.Extends:
          rdfModel.store.addQuad(DataFactory.triple(element, bamm.ExtendsProperty(), DataFactory.namedNode(properties[key])));
          break;
        case PropertyEnum.Characteristic:
          rdfModel.store.addQuad(DataFactory.triple(element, bamm.CharacteristicProperty(), DataFactory.namedNode(properties[key])));
          break;
        default:
          this.addQuad(metaModelElement, properties[key], bamm.getAspectModelUrn(key));
          break;
      }
    }
  }

  private updateLocalizedValue(metaModelElement: BaseMetaModelElement, properties: BasePropertiesInterface, key: string) {
    const rdfModel = this.modelService.getLoadedAspectModel().rdfModel;
    properties[key].forEach((localeValue: LocaleInterface & {value: number}) => {
      if (!localeValue.value && localeValue.value !== 0) {
        return;
      }

      rdfModel.store.addQuad(
        DataFactory.triple(
          DataFactory.namedNode(metaModelElement.aspectModelUrn),
          DataFactory.namedNode(rdfModel.BAMM().getAspectModelUrn(key)),
          DataFactory.literal(localeValue.value, localeValue.language)
        )
      );
    });
  }

  private updateArrayField(
    metaModelElement: BaseMetaModelElement,
    properties: BasePropertiesInterface,
    key: string,
    aspectModelUrn: string
  ) {
    const arrayProperty: string[] = properties[key];
    arrayProperty.forEach(property => {
      this.addDatatype(metaModelElement, aspectModelUrn, property, key !== 'see');
    });
  }

  private addDatatype(
    metaModelElement: BaseMetaModelElement,
    aspectModelUrn: string,
    value: string | number | boolean,
    encodeUrn?: boolean
  ) {
    if (!value && value !== 0) {
      return;
    }

    const rdfModel = this.modelService.getLoadedAspectModel().rdfModel;
    rdfModel.store.addQuad(
      DataFactory.triple(
        DataFactory.namedNode(metaModelElement.aspectModelUrn),
        DataFactory.namedNode(aspectModelUrn),
        DataFactory.namedNode(encodeUrn ? encodeURIComponent(`${value}`) : `${value}`)
      )
    );
  }

  private addQuad(
    metaModelElement: BaseMetaModelElement,
    value: string | number | boolean,
    aspectModelUrn: string,
    characteristicType?: Type
  ) {
    if (!value && value !== 0) {
      return;
    }

    const rdfModel = this.modelService.getLoadedAspectModel().rdfModel;
    rdfModel.store.addQuad(
      DataFactory.triple(
        DataFactory.namedNode(metaModelElement.aspectModelUrn),
        DataFactory.namedNode(aspectModelUrn),
        DataFactory.literal(`${value}`, RdfModelUtil.resolveAccurateType(metaModelElement, aspectModelUrn, rdfModel, characteristicType))
      )
    );
  }
}
