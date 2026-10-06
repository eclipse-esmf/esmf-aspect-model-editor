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

import {Quad, Quad_Subject, Util} from 'n3';
import {DefaultValue} from '../aspect-meta-model';
import {BaseInitProps} from '../shared/base-init-props';
import {basePropertiesFactory} from './meta-model-element-instantiator';

export function valueFactory(initProps: BaseInitProps) {
  return (quads: Quad[], dataType = null, value = '') => {
    if (!quads?.length) return null;

    const {samm} = initProps.rdfModel;
    const elementsCache = initProps.cache;

    const subject = quads?.[0].subject as Quad_Subject;
    const isAnonymous = Util.isBlankNode(subject);
    const cachedValue = elementsCache.get<DefaultValue>(subject.value);
    if (cachedValue) {
      return cachedValue;
    }

    const baseProperties = basePropertiesFactory(initProps)(subject);

    const name = isAnonymous ? '[Value]' : baseProperties.name;
    const aspectModelUrn = isAnonymous
      ? `${initProps.rdfModel.getAspectModelUrn()}[Value]_${Math.floor(Math.random() * 9000) + 1000}`
      : baseProperties.aspectModelUrn;

    const valueElement = new DefaultValue({
      ...baseProperties,
      name,
      aspectModelUrn,
      isAnonymous,
      hasSyntheticName: isAnonymous ? true : baseProperties.hasSyntheticName,
      value,
      type: dataType,
    });

    for (const quad of quads) {
      if (samm.isValueProperty(quad.predicate.value)) {
        valueElement.value = quad.object.value;
      }
    }

    if (isAnonymous) {
      elementsCache.addElement(subject.value, valueElement);
    }

    return elementsCache.resolveInstance(valueElement);
  };
}
