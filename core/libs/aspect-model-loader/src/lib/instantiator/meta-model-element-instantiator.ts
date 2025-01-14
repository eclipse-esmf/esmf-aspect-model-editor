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

import {NamedNode, Quad, Quad_Subject, Util} from 'n3';
import {LangString} from '../aspect-meta-model/named-element';
import {BaseInitProps} from '../shared/base-init-props';
import {NamedElementProps} from '../shared/props';

export const basePropertiesFactory = (initProps: BaseInitProps) => {
  function getLangValuePair(quad: Quad) {
    const localeCode = initProps.rdfModel.getLocale(quad);
    return localeCode ? {lang: localeCode, value: quad.object.value} : {lang: 'en', value: quad.object.value};
  }

  function getAspectModelUrn(typeQuad: Quad, quads: Array<Quad>): {aspectModelUrn: string; hasSyntheticName: boolean} {
    const rdfModel = initProps.rdfModel;
    const {samm} = rdfModel;
    if (typeQuad && !Util.isBlankNode(typeQuad.subject)) {
      return {aspectModelUrn: `${typeQuad.subject.value}`, hasSyntheticName: false};
    }

    if (!(quads && quads.length > 0)) {
      return {aspectModelUrn: `${rdfModel.getAspectModelUrn()}${Math.floor(Math.random() * 5000) + 1}`, hasSyntheticName: true};
    }

    const propertyQuads = quads.find(quads => quads.predicate.value === samm.property().id);
    if (propertyQuads && Util.isBlankNode(quads[0].subject)) {
      return {aspectModelUrn: propertyQuads.object.value, hasSyntheticName: false};
    }

    return {aspectModelUrn: quads[0].subject.id, hasSyntheticName: false};
  }

  return (subject: Quad_Subject): NamedElementProps => {
    const rdfModel = initProps.rdfModel;
    const {samm} = rdfModel;
    const baseProperties = rdfModel.findAnyProperty(subject as NamedNode);

    const descriptions = new Map<LangString, string>();
    const preferredNames = new Map<LangString, string>();
    const see: string[] = [];

    let typeQuad: Quad;
    for (const quad of baseProperties) {
      if (samm.isDescriptionProperty(quad.predicate.value)) {
        const {lang, value} = getLangValuePair(quad);
        descriptions.set(lang, value);
        continue;
      }

      if (samm.isPreferredNameProperty(quad.predicate.value)) {
        const {lang, value} = getLangValuePair(quad);
        preferredNames.set(lang, value);
        continue;
      }

      if (samm.isSeeProperty(quad.predicate.value)) {
        see.push(quad.object.value);
        continue;
      }

      if (quad.predicate.value === samm.RdfType().value) {
        typeQuad = quad;
      }
    }

    const {aspectModelUrn, hasSyntheticName} = getAspectModelUrn(typeQuad, baseProperties);
    const metaModelVersion = rdfModel.samm.version;
    const name = aspectModelUrn.split('#')?.[1];

    return {
      name,
      hasSyntheticName,
      aspectModelUrn,
      metaModelVersion,
      descriptions,
      preferredNames,
      see,
    };
  };
};
