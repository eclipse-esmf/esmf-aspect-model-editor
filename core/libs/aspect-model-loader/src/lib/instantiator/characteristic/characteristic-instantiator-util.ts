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

import {Quad} from 'n3';
import {Value} from '../../aspect-meta-model';

export interface MultiLanguageText {
  value: string;
  language: string;
}

export class CharacteristicInstantiatorUtil {
  public static resolveValues(quad: Quad, dataType: string): string | number {
    if (!dataType || !dataType.includes('#')) {
      return `${quad.object.value}`;
    }

    switch (dataType.split('#')[1]) {
      case 'decimal':
      case 'integer':
      case 'double':
      case 'float':
      case 'byte':
      case 'short':
      case 'int':
      case 'long':
      case 'unsignedByte':
      case 'unsignedLong':
      case 'unsignedInt':
      case 'unsignedShort':
      case 'positiveInteger':
      case 'nonNegativeInteger':
      case 'negativeInteger':
      case 'nonPositiveInteger':
        return Number(quad.object.value);
      default:
        return `${quad.object.value}`;
    }
  }

  public static solveBlankNodeValues(resolvedBlankNodes: Array<Quad>): Array<Value> {
    return resolvedBlankNodes.length > 0 ? resolvedBlankNodes.map(item => this.createLanguageObject(item)) : [];
  }

  public static getPredicateKey(quad: Quad): string {
    return quad.predicate.value.split('#')[1];
  }

  public static createLanguageObject(quad: Quad): Value {
    const value = new Value(quad.object.value);
    value.language = (quad.object as any).language;
    return value;
  }
}
