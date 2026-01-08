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

import {NamedNode, Quad} from 'n3';
import {DefaultValue} from '../aspect-meta-model';
import {BaseInitProps} from '../shared/base-init-props';
import {basePropertiesFactory} from './meta-model-element-instantiator';

export function valueFactory(initProps: BaseInitProps) {
  return (quads: Quad[], dataType = null, value = '') => {
    // TODO check how to use dataType because the type should defined in the value element
    if (!quads?.length) return null;

    const {samm} = initProps.rdfModel;
    const elementsCache = initProps.cache;

    const subject = quads?.[0].subject as NamedNode;
    const cachedValue = elementsCache.get<DefaultValue>(subject.value);
    if (cachedValue) {
      return cachedValue;
    }

    const baseProperties = basePropertiesFactory(initProps)(subject);

    const valueElement = new DefaultValue({
      ...baseProperties,
      value,
    });

    for (const quad of quads) {
      if (samm.isValueProperty(quad.predicate.value)) {
        valueElement.value = quad.object.value;
      }
    }

    return elementsCache.resolveInstance(valueElement);
  };
}
