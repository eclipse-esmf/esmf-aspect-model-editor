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

import {DefaultEntity, DefaultEntityInstance, DefaultProperty, Value} from '@esmf/aspect-model-loader';
import {EntityInstanceUtil} from './EntityInstanceUtil';

export interface EntityInstancePropertyRow {
  value: string;
  language?: string;
}

export type EntityInstancePropertiesModel = Record<string, EntityInstancePropertyRow[]>;
export type EntityInstancePropertyLocks = Record<string, Array<{value: boolean; language: boolean}>>;

export function emptyEntityInstanceProperties(entity: DefaultEntity): EntityInstancePropertiesModel {
  return Object.fromEntries(
    entity.properties
      .filter(property => !property.isAbstract)
      .map(property => [
        property.name,
        [
          {
            value: '',
            ...(EntityInstanceUtil.isDefaultPropertyWithLangString(property) ? {language: ''} : {}),
          },
        ],
      ]),
  );
}

export function entityInstanceProperties(
  entityValue: DefaultEntityInstance,
  resolveProperty: (urn: string) => DefaultProperty,
): {properties: EntityInstancePropertiesModel; locks: EntityInstancePropertyLocks} {
  const properties = emptyEntityInstanceProperties(entityValue.type as DefaultEntity);
  const locks: EntityInstancePropertyLocks = {};

  for (const [propertyUrn, assertion] of entityValue.getTuples()) {
    const property = resolveProperty(propertyUrn);
    if (!property || property.isAbstract) continue;

    const row: EntityInstancePropertyRow = {
      value: assertion instanceof DefaultEntityInstance ? assertion.name : String(assertion.value ?? ''),
      ...(assertion instanceof Value && assertion.language !== undefined ? {language: assertion.language} : {}),
    };
    const isInitialEmptyRow = properties[property.name]?.length === 1 && properties[property.name][0].value === '';
    properties[property.name] = isInitialEmptyRow ? [row] : [...(properties[property.name] || []), row];
    locks[property.name] = [
      ...(locks[property.name] || []),
      {
        value: assertion instanceof DefaultEntityInstance,
        language: assertion instanceof Value && assertion.language !== undefined && assertion.language !== '',
      },
    ];
  }

  for (const property of entityValue.type.properties.filter(property => !property.isAbstract)) {
    locks[property.name] ||= properties[property.name].map(() => ({value: false, language: false}));
  }

  return {properties, locks};
}

export function hasMissingRequiredEntityInstanceValue(entity: DefaultEntity, properties: EntityInstancePropertiesModel): boolean {
  return entity.properties.some(property => {
    if (property.isAbstract || entity.propertiesPayload[property.aspectModelUrn]?.optional) return false;
    const rows = properties[property.name] || [];
    return (
      rows.length === 0 ||
      rows.some(row =>
        EntityInstanceUtil.isDefaultPropertyWithLangString(property)
          ? !row.value || !row.language
          : row.value === '' || row.value === null || row.value === undefined,
      )
    );
  });
}
