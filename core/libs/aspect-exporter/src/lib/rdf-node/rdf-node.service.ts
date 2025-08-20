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
import {ModelService} from '@ame/rdf/services';
import {RdfModelUtil} from '@ame/rdf/utils';
import {Injectable} from '@angular/core';
import {DefaultEncodingConstraint, NamedElement, RdfModel, Type} from '@esmf/aspect-model-loader';
import {BlankNode, DataFactory, Quad} from 'n3';
import {PropertyEnum} from './enums/property.enum';
import {BasePropertiesInterface, LocaleInterface} from './interfaces';

@Injectable({
  providedIn: 'root',
})
export class RdfNodeService {
  constructor(
    public modelService: ModelService,
    private loadedFilesService: LoadedFilesService,
  ) {}

  get rdfModel(): RdfModel {
    return this.loadedFilesService.currentLoadedFile.rdfModel;
  }

  /**
   * Removes the quads corresponding to the given properties of an element.
   * If no properties are given, all the quads for the element will be deleted.
   *
   * @param metaModelElement - element to be removed or from where properties will be removed
   * @param properties - optional: properties to be removed from the store
   */
  public remove(metaModelElement: NamedElement, properties?: string[]) {
    let quadsToBeRemoved: Quad[] = [];
    if (!properties?.length) {
      quadsToBeRemoved = this.rdfModel.store.getQuads(DataFactory.namedNode(metaModelElement.aspectModelUrn), null, null, null);
    } else {
      quadsToBeRemoved = properties
        .map(
          property =>
            this.rdfModel.store.getQuads(
              DataFactory.namedNode(metaModelElement.aspectModelUrn),
              DataFactory.namedNode(this.rdfModel.samm.getAspectModelUrn(property)),
              null,
              null,
            )?.[0],
        )
        .filter(quad => quad); // filter null/undefined
    }
    this.rdfModel.store.removeQuads(quadsToBeRemoved);
    console.info(`Removed quads ${JSON.stringify(quadsToBeRemoved)}`);
  }

  /**
   * Updates the quads of the given element with the provided properties
   * In case no quads exist for the subject, the type quad will be added
   *
   * @param metaModelElement
   * @param properties
   */
  public update(metaModelElement: NamedElement, properties: BasePropertiesInterface): void {
    const elementQuads: Quad[] = this.rdfModel.store.getQuads(DataFactory.namedNode(metaModelElement.aspectModelUrn), null, null, null);

    if (!elementQuads?.some(quad => this.rdfModel.samm.RdfType().value === quad.predicate.value)) {
      const newElement = DataFactory.triple(
        DataFactory.namedNode(metaModelElement.aspectModelUrn),
        this.rdfModel.samm.RdfType(),
        DataFactory.namedNode(RdfModelUtil.getFullQualifiedModelName(metaModelElement)),
      );
      this.rdfModel.store.addQuad(newElement);
    }

    Object.keys(properties).forEach((key: string) => {
      if (key === 'characteristicType') {
        return;
      }

      const outdatedQuad = this.rdfModel.store.getQuads(
        DataFactory.namedNode(metaModelElement.aspectModelUrn),
        DataFactory.namedNode(this.rdfModel.samm.getAspectModelUrn(key)),
        null,
        null,
      );

      if (outdatedQuad?.length) {
        this.rdfModel.store.removeQuads(outdatedQuad);
      }

      if (!properties[key] && properties[key] !== 0) {
        // in case of null, undefined or false, don't add the quads
        return;
      }

      const {samm, sammC, sammU} = this.rdfModel;

      switch (key) {
        case PropertyEnum.Description:
        case PropertyEnum.PreferredName:
          this.updateLocalizedValue(metaModelElement, properties, key);
          break;
        case PropertyEnum.See:
          this.updateArrayField(metaModelElement, properties, key, samm.getAspectModelUrn(key));
          break;
        case metaModelElement instanceof DefaultEncodingConstraint && PropertyEnum.Value: {
          const propKey = properties[key].substring(properties[key].indexOf('#') + 1);
          const encodingsList = samm.getEncodingList();
          this.addDatatype(
            metaModelElement,
            samm.getAspectModelUrn(key),
            encodingsList.find((el: any) => el.value === propKey).isDefinedBy,
          );
          break;
        }
        case PropertyEnum.NumericConversionFactor:
          this.addQuad(metaModelElement, properties[key], samm.getAspectModelUrn(key));
          break;
        case PropertyEnum.DataType:
          this.addDatatype(metaModelElement, samm.getAspectModelUrn(key), properties[key]);
          break;
        case PropertyEnum.LowerBoundDefinition:
        case PropertyEnum.UpperBoundDefinition:
          this.addDatatype(metaModelElement, sammC.getAspectModelUrn(key), sammC.getAspectModelUrn(properties[key]));
          break;
        case PropertyEnum.MaxValue:
        case PropertyEnum.MinValue:
        case PropertyEnum.Scale:
        case PropertyEnum.Integer:
        case PropertyEnum.LocaleCode:
        case PropertyEnum.LanguageCode:
          this.addQuad(metaModelElement, properties[key], sammC.getAspectModelUrn(key), properties['characteristicType']);
          break;
        case PropertyEnum.ConversionFactor:
          this.addQuad(metaModelElement, properties[key], sammU.getAspectModelUrn(key));
          break;
        default:
          this.addQuad(metaModelElement, properties[key], samm.getAspectModelUrn(key));
          break;
      }
    });
  }

  public updateBlankNode(element: BlankNode, metaModelElement: NamedElement, properties: BasePropertiesInterface) {
    for (const key in properties) {
      if (!properties[key] && properties[key] !== 0) {
        // in case of null, undefined or false, don't add the quads
        continue;
      }

      const samm = this.rdfModel.samm;
      switch (key) {
        case PropertyEnum.Description:
        case PropertyEnum.PreferredName:
          properties[key].forEach((localeValue: LocaleInterface) => {
            if (!localeValue.value && Number(localeValue.value) !== 0) {
              return;
            }

            this.rdfModel.store.addQuad(
              DataFactory.triple(
                DataFactory.namedNode(metaModelElement.aspectModelUrn),
                DataFactory.namedNode(this.rdfModel.samm.getAspectModelUrn(key)),
                DataFactory.literal(localeValue.value, localeValue.language),
              ),
            );
          });
          break;
        case PropertyEnum.See:
          properties[key]?.forEach(value => {
            this.rdfModel.store.addQuad(DataFactory.triple(element, samm.SeeProperty(), DataFactory.namedNode(`${value}`)));
          });
          break;
        case PropertyEnum.Extends:
          this.rdfModel.store.addQuad(DataFactory.triple(element, samm.Extends(), DataFactory.namedNode(properties[key])));
          break;
        case PropertyEnum.Characteristic:
          this.rdfModel.store.addQuad(DataFactory.triple(element, samm.CharacteristicProperty(), DataFactory.namedNode(properties[key])));
          break;
        default:
          this.addQuad(metaModelElement, properties[key], samm.getAspectModelUrn(key));
          break;
      }
    }
  }

  private updateLocalizedValue(metaModelElement: NamedElement, properties: BasePropertiesInterface, key: string) {
    properties[key].forEach((localeValue: LocaleInterface & {value: number}) => {
      if (!localeValue.value && localeValue.value !== 0) {
        return;
      }

      this.rdfModel.store.addQuad(
        DataFactory.triple(
          DataFactory.namedNode(metaModelElement.aspectModelUrn),
          DataFactory.namedNode(this.rdfModel.samm.getAspectModelUrn(key)),
          DataFactory.literal(localeValue.value, localeValue.language),
        ),
      );
    });
  }

  private updateArrayField(metaModelElement: NamedElement, properties: BasePropertiesInterface, key: string, aspectModelUrn: string) {
    const arrayProperty: string[] = properties[key];
    arrayProperty.forEach(property => {
      this.addDatatype(metaModelElement, aspectModelUrn, property, key !== 'see');
    });
  }

  private addDatatype(metaModelElement: NamedElement, aspectModelUrn: string, value: string | number | boolean, encodeUrn?: boolean) {
    if (!value && value !== 0) {
      return;
    }

    this.rdfModel.store.addQuad(
      DataFactory.triple(
        DataFactory.namedNode(metaModelElement.aspectModelUrn),
        DataFactory.namedNode(aspectModelUrn),
        DataFactory.namedNode(encodeUrn ? encodeURIComponent(`${value}`) : `${value}`),
      ),
    );
  }

  private addQuad(metaModelElement: NamedElement, value: string | number | boolean, aspectModelUrn: string, characteristicType?: Type) {
    if (!value && value !== 0) {
      return;
    }

    const rdfModel = this.loadedFilesService.currentLoadedFile?.rdfModel;
    rdfModel &&
      this.rdfModel.store.addQuad(
        DataFactory.triple(
          DataFactory.namedNode(metaModelElement.aspectModelUrn),
          DataFactory.namedNode(aspectModelUrn),
          DataFactory.literal(`${value}`, RdfModelUtil.resolveAccurateType(metaModelElement, aspectModelUrn, rdfModel, characteristicType)),
        ),
      );
  }
}
