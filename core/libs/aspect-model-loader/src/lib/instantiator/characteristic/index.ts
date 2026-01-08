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

import {NamedNode, Quad, Util} from 'n3';
import {Characteristic} from '../../aspect-meta-model';
import {BaseInitProps} from '../../shared/base-init-props';
import {characteristicFactory} from './characteristic-instantiator';
import {codeCharacteristicFactory} from './code-characteristic-instantiator';
import {collectionCharacteristicFactory} from './collection-characteristic-instantiator';
import {durationCharacteristicFactory} from './duration-characteristic-instantiator';
import {eitherCharacteristicFactory} from './either-characteristic-instantiator';
import {enumerationCharacteristicFactory} from './enumeration-characteristic-instantiator';
import {listCharacteristicFactory} from './list-characteristic-instantiator';
import {measurementCharacteristicFactory} from './measurement-characteristic-instantiator';
import {predefinedCharacteristicFactory} from './predefined-characteristic-instantiator';
import {quantifiableCharacteristicFactory} from './quantifiable-characteristic-instantiator';
import {setCharacteristicFactory} from './set-characteristic-instantiator';
import {singleEntityCharacteristicFactory} from './single-entity-instantiator';
import {sortedSetCharacteristicFactory} from './sorted-set-characteristic-instantiator';
import {stateCharacteristicFactory} from './state-characteristic-instantiator';
import {timeSeriesCharacteristicFactory} from './timeseries-characteristic-instantiator';
import {traitCharacteristicFactory} from './trait-characteristic-instantiator';

export function allCharacteristicsFactory(initProps: BaseInitProps) {
  const {rdfModel} = initProps;

  const {createDefaultCharacteristic} = characteristicFactory(initProps);
  const createCodeCharacteristic = codeCharacteristicFactory(initProps);
  const createCollectionCharacteristic = collectionCharacteristicFactory(initProps);
  const createDurationCharacteristic = durationCharacteristicFactory(initProps);
  const createEitherCharacteristic = eitherCharacteristicFactory(initProps);
  const {createEnumerationCharacteristic, resolveEntityInstance} = enumerationCharacteristicFactory(initProps);
  const createStateCharacteristic = stateCharacteristicFactory(initProps);
  const createListCharacteristic = listCharacteristicFactory(initProps);
  const createMeasurementCharacteristic = measurementCharacteristicFactory(initProps);
  const createQuantifiableCharacteristic = quantifiableCharacteristicFactory(initProps);
  const createSetCharacteristic = setCharacteristicFactory(initProps);
  const createSingleEntityCharacteristic = singleEntityCharacteristicFactory(initProps);
  const createSortedSetCharacteristic = sortedSetCharacteristicFactory(initProps);
  const createTimeSeriesCharacteristic = timeSeriesCharacteristicFactory(initProps);
  const createTraitCharacteristic = traitCharacteristicFactory(initProps);
  const {getSupportedCharacteristicNames} = predefinedCharacteristicFactory(initProps);

  const processors = [
    // CodeCharacteristic
    {
      process: (quad: Quad) => createCodeCharacteristic(quad),
      shouldProcess: (namedNode: NamedNode) => rdfModel.sammC.CodeCharacteristic().equals(namedNode),
    },
    // CollectionCharacteristic
    {
      process: (quad: Quad) => createCollectionCharacteristic(quad, createCharacteristic),
      shouldProcess: (namedNode: NamedNode) => rdfModel.sammC.CollectionCharacteristic().equals(namedNode),
    },
    // DurationCharacteristic
    {
      process: (quad: Quad) => createDurationCharacteristic(quad),
      shouldProcess: (namedNode: NamedNode) => rdfModel.sammC.DurationCharacteristic().equals(namedNode),
    },
    // EitherCharacteristic
    {
      process: (quad: Quad) => createEitherCharacteristic(quad, createCharacteristic),
      shouldProcess: (namedNode: NamedNode) => rdfModel.sammC.EitherCharacteristic().equals(namedNode),
    },
    // EnumerationCharacteristic
    {
      process: (quad: Quad) => createEnumerationCharacteristic(quad),
      shouldProcess: (namedNode: NamedNode) => rdfModel.sammC.EnumerationCharacteristic().equals(namedNode),
    },
    // StateCharacteristic
    {
      process: (quad: Quad) => createStateCharacteristic(quad),
      shouldProcess: (namedNode: NamedNode) => rdfModel.sammC.StateCharacteristic().equals(namedNode),
    },
    // ListCharacteristic
    {
      process: (quad: Quad) => createListCharacteristic(quad),
      shouldProcess: (namedNode: NamedNode) => rdfModel.sammC.ListCharacteristic().equals(namedNode),
    },
    // MeasurementCharacteristic
    {
      process: (quad: Quad) => createMeasurementCharacteristic(quad),
      shouldProcess: (namedNode: NamedNode) => rdfModel.sammC.MeasurementCharacteristic().equals(namedNode),
    },
    // QuantifiableCharacteristic
    {
      process: (quad: Quad) => createQuantifiableCharacteristic(quad),
      shouldProcess: (namedNode: NamedNode) => rdfModel.sammC.QuantifiableCharacteristic().equals(namedNode),
    },
    // SetCharacteristic
    {
      process: (quad: Quad) => createSetCharacteristic(quad),
      shouldProcess: (namedNode: NamedNode) => rdfModel.sammC.SetCharacteristic().equals(namedNode),
    },
    // SingleEntityCharacteristic
    {
      process: (quad: Quad) => createSingleEntityCharacteristic(quad),
      shouldProcess: (namedNode: NamedNode) => rdfModel.sammC.SingleEntityCharacteristic().equals(namedNode),
    },
    // SortedSetCharacteristic
    {
      process: (quad: Quad) => createSortedSetCharacteristic(quad, createCharacteristic),
      shouldProcess: (namedNode: NamedNode) => rdfModel.sammC.SortedSetCharacteristic().equals(namedNode),
    },
    // TimeSeriesCharacteristic
    {
      process: (quad: Quad) => createTimeSeriesCharacteristic(quad, createCharacteristic),
      shouldProcess: (namedNode: NamedNode) => rdfModel.sammC.TimeSeriesCharacteristic().equals(namedNode),
    },
    // TraitCharacteristic
    {
      process: (quad: Quad) => createTraitCharacteristic(quad, createCharacteristic),
      shouldProcess: (namedNode: NamedNode) => rdfModel.sammC.TraitCharacteristic().equals(namedNode),
    },
    // should always be last
    // DefaultCharacteristic
    {
      process: (quad: Quad) => createDefaultCharacteristic(quad),
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      shouldProcess: (_namedNode?: NamedNode) => true,
    },
  ];

  function createCharacteristic(quad: Quad): Characteristic {
    if (!quad || !quad?.object) return null;

    let elementDefinitionQuad: Quad;

    if (quad.object.value.startsWith(rdfModel.sammC.getUri())) {
      elementDefinitionQuad = quad;
    } else {
      const characteristicQuads = Util.isBlankNode(quad.object)
        ? rdfModel.resolveBlankNodes(quad.object.value)
        : rdfModel.store.getQuads(quad.object, null, null, null);
      elementDefinitionQuad = characteristicQuads.find(q => rdfModel.samm.RdfType().equals(q.predicate));
    }

    if (!elementDefinitionQuad) {
      return null;
    }

    for (const processor of processors) {
      if (processor.shouldProcess(elementDefinitionQuad.object as NamedNode)) {
        return processor.process(quad);
      }
    }

    return null;
  }

  return {
    createDefaultCharacteristic,
    createCodeCharacteristic,
    createCollectionCharacteristic,
    createDurationCharacteristic,
    createEitherCharacteristic,
    createEnumerationCharacteristic,
    createListCharacteristic,
    createMeasurementCharacteristic,
    createQuantifiableCharacteristic,
    createSetCharacteristic,
    createSingleEntityCharacteristic,
    createSortedSetCharacteristic,
    createTimeSeriesCharacteristic,
    createTraitCharacteristic,
    createCharacteristic,
    resolveEntityInstance,
    getSupportedCharacteristicNames,
  };
}
