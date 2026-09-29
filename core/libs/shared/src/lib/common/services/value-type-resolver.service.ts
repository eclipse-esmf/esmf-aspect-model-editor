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

import {inject, Injectable} from '@angular/core';
import {DefaultCharacteristic, DefaultProperty, DefaultScalar, DefaultValue, Type} from '@esmf/aspect-model-loader';
import {LoadedFilesPort} from '../../contracts';
import {simpleDataTypes} from '../constants/xsd-datatypes';

export interface ValueTypeResolution {
  /** The effective type for this value, or null if unresolvable or conflicting */
  type: Type | null;
  /** Effective short type name (e.g. 'integer', 'string') */
  shortType: string | null;
  /** Effective full type URN */
  typeUrn: string | null;
  /** Source of determination: 'external' | 'single-parent' | 'multiple-parents-compatible' | 'standalone' | 'conflict' */
  source: 'external' | 'single-parent' | 'multiple-parents-compatible' | 'standalone' | 'conflict';
  /** True if multiple connected characteristics have conflicting data types */
  hasConflict: boolean;
  /** Conflict details if hasConflict is true */
  conflictMessage?: string;
  /** True if the type is fixed (from external reference or connected characteristic) and should not be edited at the Value */
  isReadOnly: boolean;
  /** True if value has no connected characteristic and user can choose data type */
  canSelectDataType: boolean;
  /** Connected characteristics */
  connectedCharacteristics: DefaultCharacteristic[];
}

@Injectable({providedIn: 'root'})
export class ValueTypeResolverService {
  private loadedFilesService = inject(LoadedFilesPort, {optional: true});

  /**
   * Static helper to resolve value type from a DefaultValue.
   */
  static resolveValueTypeStatic(value: DefaultValue, loadedFilesService?: LoadedFilesPort | null): ValueTypeResolution {
    if (!value) {
      return {
        type: null,
        shortType: null,
        typeUrn: null,
        source: 'standalone',
        hasConflict: false,
        isReadOnly: false,
        canSelectDataType: true,
        connectedCharacteristics: [],
      };
    }

    const isExternal = Boolean(loadedFilesService?.isElementExtern(value));

    // Collect connected characteristics from parents
    const connectedCharacteristics = this.findConnectedCharacteristics(value);

    // 1. Externally referenced Value: type of external value is authoritative
    if (isExternal && value.type) {
      const typeUrn = this.extractTypeUrn(value.type);
      const shortType = this.extractShortType(value.type);

      // Check if any connected local characteristic has an incompatible data type
      const charDataTypes = connectedCharacteristics.map(char => {
        const dt = this.getCharacteristicDataType(char);
        return {char, type: dt, urn: dt ? this.extractTypeUrn(dt) : null, shortType: dt ? this.extractShortType(dt) : null};
      });
      const incompatible = charDataTypes.find(c => c.urn && typeUrn && c.urn !== typeUrn);
      if (incompatible) {
        return {
          type: value.type,
          shortType,
          typeUrn,
          source: 'external',
          hasConflict: true,
          conflictMessage: `External value data type (${shortType}) conflicts with connected characteristic data type (${incompatible.shortType}).`,
          isReadOnly: true,
          canSelectDataType: false,
          connectedCharacteristics,
        };
      }

      return {
        type: value.type,
        shortType,
        typeUrn,
        source: 'external',
        hasConflict: false,
        isReadOnly: true,
        canSelectDataType: false,
        connectedCharacteristics,
      };
    }

    // 2., 3., 4.: Handle connected characteristics
    if (connectedCharacteristics.length > 0) {
      const charDataTypes: Array<{char: DefaultCharacteristic; type: Type | null; urn: string | null; shortType: string | null}> = [];

      for (const char of connectedCharacteristics) {
        const dt = this.getCharacteristicDataType(char);
        const urn = dt ? this.extractTypeUrn(dt) : null;
        const shortType = dt ? this.extractShortType(dt) : null;
        charDataTypes.push({char, type: dt, urn, shortType});
      }

      // Unique distinct data type URNs
      const distinctTypes = new Map<string, Type>();
      for (const item of charDataTypes) {
        if (item.urn && item.type) {
          distinctTypes.set(item.urn, item.type);
        }
      }

      // 4. Multiple connected characteristics with conflicting data types
      if (distinctTypes.size > 1) {
        const typeNames = Array.from(distinctTypes.values())
          .map(t => this.extractShortType(t))
          .join(', ');
        return {
          type: null,
          shortType: null,
          typeUrn: null,
          source: 'conflict',
          hasConflict: true,
          conflictMessage: `Connected characteristics have conflicting data types: ${typeNames}. Please correct the characteristics first.`,
          isReadOnly: true,
          canSelectDataType: false,
          connectedCharacteristics,
        };
      }

      // 2. Exactly one characteristic OR 3. multiple characteristics with same data type
      if (distinctTypes.size === 1) {
        const resolvedType = distinctTypes.values().next().value;
        const shortType = this.extractShortType(resolvedType);
        const typeUrn = this.extractTypeUrn(resolvedType);
        return {
          type: resolvedType,
          shortType,
          typeUrn,
          source: connectedCharacteristics.length === 1 ? 'single-parent' : 'multiple-parents-compatible',
          hasConflict: false,
          isReadOnly: true,
          canSelectDataType: false,
          connectedCharacteristics,
        };
      }

      // Connected characteristics have no data type specified
      return {
        type: value.type || null,
        shortType: value.type ? this.extractShortType(value.type) : null,
        typeUrn: value.type ? this.extractTypeUrn(value.type) : null,
        source: 'single-parent',
        hasConflict: false,
        isReadOnly: true,
        canSelectDataType: false,
        connectedCharacteristics,
      };
    }

    // 5. Standalone Value without connected characteristic:
    const typeUrn = value.type ? this.extractTypeUrn(value.type) : null;
    const shortType = value.type ? this.extractShortType(value.type) : null;
    return {
      type: value.type || null,
      shortType,
      typeUrn,
      source: 'standalone',
      hasConflict: false,
      isReadOnly: false,
      canSelectDataType: true,
      connectedCharacteristics: [],
    };
  }

  /**
   * Resolves the effective data type and conflict status for a DefaultValue.
   */
  resolveValueType(value: DefaultValue): ValueTypeResolution {
    return ValueTypeResolverService.resolveValueTypeStatic(value, this.loadedFilesService);
  }

  /**
   * Static helper to format value according to its resolved data type.
   */
  static formatValueStatic(rawValue: unknown, resolution: ValueTypeResolution): string {
    if (rawValue === undefined || rawValue === null || rawValue === '') {
      return '';
    }

    const strVal = String(rawValue);
    const shortType = resolution.shortType?.toLowerCase();

    // Numeric types & boolean: no quotes
    if (this.isNumericTypeStatic(shortType) || shortType === 'boolean') {
      return strVal;
    }

    // Default string / complex / other types: quotes
    return `"${strVal}"`;
  }

  /**
   * Helper to format value according to its resolved data type.
   */
  formatValue(rawValue: unknown, resolution: ValueTypeResolution): string {
    return ValueTypeResolverService.formatValueStatic(rawValue, resolution);
  }

  static isNumericTypeStatic(shortType: string | null | undefined): boolean {
    if (!shortType) return false;
    const s = shortType.toLowerCase();
    return [
      'integer',
      'int',
      'positiveinteger',
      'negativeinteger',
      'nonnegativeinteger',
      'nonpositiveinteger',
      'long',
      'short',
      'byte',
      'unsignedint',
      'unsignedlong',
      'unsignedshort',
      'unsignedbyte',
      'decimal',
      'double',
      'float',
    ].includes(s);
  }

  isNumericType(shortType: string | null | undefined): boolean {
    return ValueTypeResolverService.isNumericTypeStatic(shortType);
  }

  /**
   * Validates a value against a resolved data type.
   * Returns null if valid, or an error key/message if invalid.
   */
  validateValue(val: string, resolution: ValueTypeResolution): {kind: string; message: string} | null {
    if (!val || !resolution.shortType) {
      return null;
    }

    const trimmed = val.trim();
    const shortType = resolution.shortType.toLowerCase();

    switch (shortType) {
      case 'boolean':
        if (trimmed !== 'true' && trimmed !== 'false') {
          return {kind: 'invalidBoolean', message: 'Value must be "true" or "false"'};
        }
        break;

      case 'integer':
      case 'int':
        if (!/^-?\d+$/.test(trimmed)) {
          return {kind: 'invalidInteger', message: 'Value must be a valid integer'};
        }
        break;

      case 'positiveinteger':
        if (!/^[1-9]\d*$/.test(trimmed)) {
          return {kind: 'invalidPositiveInteger', message: 'Value must be a positive integer (> 0)'};
        }
        break;

      case 'nonnegativeinteger':
      case 'unsignedint':
      case 'unsignedshort':
      case 'unsignedbyte':
      case 'unsignedlong':
        if (!/^\d+$/.test(trimmed)) {
          return {kind: 'invalidNonNegativeInteger', message: 'Value must be a non-negative integer (>= 0)'};
        }
        break;

      case 'negativeinteger':
        if (!/^-[1-9]\d*$/.test(trimmed)) {
          return {kind: 'invalidNegativeInteger', message: 'Value must be a negative integer (< 0)'};
        }
        break;

      case 'nonpositiveinteger':
        if (trimmed !== '0' && !/^-[1-9]\d*$/.test(trimmed)) {
          return {kind: 'invalidNonPositiveInteger', message: 'Value must be a non-positive integer (<= 0)'};
        }
        break;

      case 'decimal':
      case 'double':
      case 'float':
        if (!/^-?\d+(\.\d+)?([eE][+-]?\d+)?$/.test(trimmed)) {
          return {kind: 'invalidDecimal', message: 'Value must be a valid decimal/number'};
        }
        break;

      case 'byte': {
        if (!/^-?\d+$/.test(trimmed)) {
          return {
            kind: 'invalidByte',
            message: 'Value must be a valid byte (-128 to 127)',
          };
        }

        const byteNum = Number(trimmed);

        if (byteNum < -128 || byteNum > 127) {
          return {
            kind: 'invalidByte',
            message: 'Value must be between -128 and 127',
          };
        }

        break;
      }

      case 'short': {
        if (!/^-?\d+$/.test(trimmed)) {
          return {
            kind: 'invalidShort',
            message: 'Value must be a valid 16-bit integer',
          };
        }

        const shortNum = Number(trimmed);

        if (shortNum < -32768 || shortNum > 32767) {
          return {
            kind: 'invalidShort',
            message: 'Value must be between -32768 and 32767',
          };
        }

        break;
      }
    }

    return null;
  }

  static isNumericType(shortType: string | null | undefined): boolean {
    return ValueTypeResolverService.isNumericTypeStatic(shortType);
  }

  private static findConnectedCharacteristics(value: DefaultValue): DefaultCharacteristic[] {
    const characteristics: DefaultCharacteristic[] = [];
    for (const parent of value.parents || []) {
      if (parent instanceof DefaultCharacteristic) {
        if (!characteristics.includes(parent)) {
          characteristics.push(parent);
        }
      } else if (parent instanceof DefaultProperty && parent.characteristic) {
        if (parent.characteristic instanceof DefaultCharacteristic) {
          if (!characteristics.includes(parent.characteristic)) {
            characteristics.push(parent.characteristic);
          }
        }
      }
    }
    return characteristics;
  }

  private static getCharacteristicDataType(characteristic: DefaultCharacteristic): Type | null {
    return DefaultCharacteristic.getEffectiveDataType(characteristic) || characteristic.dataType || null;
  }

  static extractTypeUrn(type: Type | any): string | null {
    if (!type) return null;
    if (typeof type === 'string') return type;
    if (typeof type.getUrn === 'function') return type.getUrn();
    return type.urn || type.aspectModelUrn || null;
  }

  static extractShortType(type: Type | any): string | null {
    if (!type) return null;
    if (typeof type.getShortType === 'function') {
      const short = type.getShortType();
      if (short) return short;
    }
    if (type.name) return type.name;
    const urn = this.extractTypeUrn(type);
    if (urn?.includes('#')) {
      return urn.split('#')[1];
    }
    return null;
  }

  extractTypeUrn(type: Type | any): string | null {
    return ValueTypeResolverService.extractTypeUrn(type);
  }

  extractShortType(type: Type | any): string | null {
    return ValueTypeResolverService.extractShortType(type);
  }

  createScalarType(typeName: string): DefaultScalar | null {
    const simpleType = (simpleDataTypes as Record<string, {isDefinedBy: string; description: string}>)[typeName];
    if (simpleType) {
      return new DefaultScalar({
        urn: simpleType.isDefinedBy,
        metaModelVersion: '2.1.0',
        descriptions: new Map([['en', simpleType.description || '']]),
      });
    }
    return null;
  }
}
