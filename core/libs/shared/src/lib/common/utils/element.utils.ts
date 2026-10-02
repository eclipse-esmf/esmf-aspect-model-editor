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

import {
  DefaultAspect,
  DefaultCharacteristic,
  DefaultEntity,
  DefaultProperty,
  DefaultTrait,
  ElementSet,
  NamedElement,
  Type,
} from '@esmf/aspect-model-loader';

export class ElementPropertyUtil {
  /**
   * Checks if child (a property) is either an optional, notInPayload or has a payloadName
   *
   * @param child NamedElement
   * @param parent NamedElement
   */
  static isOptionalProperty(child: DefaultProperty, parent: NamedElement): boolean {
    if (!(parent instanceof DefaultAspect || parent instanceof DefaultEntity) || !(child instanceof DefaultProperty)) {
      return false;
    }

    return !!parent.propertiesPayload[child.aspectModelUrn]?.optional;
  }
}

/**
 * Gets the model element from a graph cell or node object
 */
export function getModelElement<U extends NamedElement = NamedElement>(cell: any): U {
  if (!cell) {
    return null as any;
  }
  if (typeof cell['getMetaModelElement'] === 'function') {
    const node = cell.getMetaModelElement();
    return (node?.element ?? null) as U;
  }
  if (cell.configuration?.node?.element) {
    return cell.configuration.node.element as U;
  }
  if (cell.element) {
    return cell.element as U;
  }
  return (cell.value ?? null) as U;
}

/**
 * Sets the model element node on a cell
 */
export function setElementNode(cell: any, node: any): void {
  if (cell) {
    cell['getMetaModelElement'] = () => node;
    if (!cell.configuration) {
      cell.configuration = {};
    }
    cell.configuration.node = node;
  }
}

/**
 * Model element relationship management utilities
 */
export class ElementRelationUtil {
  static getModelElement<U extends NamedElement = NamedElement>(cell: any): U {
    return getModelElement<U>(cell);
  }

  static setElementNode(cell: any, node: any): void {
    setElementNode(cell, node);
  }

  static establishRelation(parent: NamedElement, child: NamedElement): void {
    if (!parent || !child) {
      return;
    }
    if (parent.children && !parent.children.some(c => c.aspectModelUrn === child.aspectModelUrn)) {
      parent.children.push(child);
    }
    if (child.parents && !child.parents.some(p => p.aspectModelUrn === parent.aspectModelUrn)) {
      child.parents.push(parent);
    }
  }

  static removeRelation(parent: NamedElement, child: NamedElement, loadedFiles?: any): void {
    if (!parent || !child) {
      return;
    }

    if (loadedFiles && typeof loadedFiles.isElementExtern === 'function') {
      const parentNamespace = parent.aspectModelUrn?.split('#')[0];
      const childNamespace = child.aspectModelUrn?.split('#')[0];
      const isRemovable =
        parentNamespace !== childNamespace || !(loadedFiles.isElementExtern(parent) || loadedFiles.isElementExtern(child));
      if (!isRemovable || (loadedFiles.isElementExtern(parent) && child.isPredefined)) {
        return;
      }
    }

    if (child.parents) {
      child.parents = new ElementSet(...child.parents.filter(p => p.aspectModelUrn !== parent.aspectModelUrn));
    }
  }
}

/**
 * Get the data type of characteristic
 *
 * @param {DefaultCharacteristic} characteristic - The characteristic to get the data type from.
 * @returns {Type} - The data type of the characteristic.
 */
export const getDeepLookupDataType = (characteristic: DefaultCharacteristic): Type => {
  if (characteristic instanceof DefaultTrait) {
    return characteristic?.baseCharacteristic?.dataType;
  }
  return characteristic ? characteristic.dataType : null;
};

/**
 * Extracts the namespace part from a given URN.
 *
 * @param {string} urn - The Uniform Resource Name (URN) from which to extract the namespace.
 * @returns {string} The extracted namespace from the URN. If the URN doesn't contain a '#', the entire URN is returned.
 */
export const extractNamespace = (urn: string): string => urn.split('#')[0];

/**
 * Get the preferred names locales of a NamedElement
 *
 * @param {NamedElement} element - The NamedElement to get the preferred names locales from.
 * @returns {string[]} - Array of preferred names locales.
 */
export const getPreferredNamesLocales = (element: NamedElement): string[] => [...element.preferredNames.keys()];

/**
 * Get the descriptions locales of a NamedElement
 *
 * @param {NamedElement} element - The NamedElement to get the descriptions locales from.
 * @returns {string[]} - Array of descriptions locales.
 */
export const getDescriptionsLocales = (element: NamedElement): string[] => [...element.descriptions.keys()];
