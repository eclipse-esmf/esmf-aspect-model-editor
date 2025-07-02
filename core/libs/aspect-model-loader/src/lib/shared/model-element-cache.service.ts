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

import {NamedElement} from '../aspect-meta-model/named-element';

export interface CacheStrategy {
  /**
   * Reset all cached elements.
   */
  reset(): void;

  /**
   * Gets a NamedElement, and returns the element or undefined.
   * @param key key of the element
   * @return NamedElement or undefined if it does not exists
   */
  get<T>(key: string): T;

  /**
   * Get element by name.
   *
   * @param name name of the element
   * @return T[] with the found elements or an empty Array
   */
  getByName<T extends NamedElement>(name: string): T[];

  /**
   * Filter the cache to find elements matching the predicate filter
   */
  filter<T extends NamedElement>(filterPredicate: FilterPredicate): T[];

  /**
   * Resolve cached element instance or add the given element to teh cache
   *
   * @param modelElement element instance to resolve
   * @return cached element instance
   */
  resolveInstance<T extends NamedElement>(modelElement: T): T;

  /**
   * Add element explicitly to the cache
   *
   * @param aspectModelUrn urn of the element
   * @param modelElement element instance to resolve
   * @param overwrite force to overwrite it if an element with the name already exists
   */
  addElement<T extends NamedElement>(aspectModelUrn: string, modelElement: T, overwrite?: boolean): void;

  /**
   * Returns the keys with the search in the key
   *
   * @param search if left empty all keys will be returned
   */
  getKeys(search?: string): string[];

  /**
   * Removed one element from the cache
   *
   * @param key element to be removed
   */
  removeElement(key: string): void;

  /**
   * Updates the namespace of all elements in the cache
   *
   * @param oldValue old namespace
   * @param newValue new namespace
   */
  updateElementsNamespace(oldValue: string, newValue: string): void;

  /**
   * Updates the key of a cached element
   *
   * @param oldKey old key of the element
   * @param newKey new key of the element
   */
  updateElementKey(oldKey: string, newKey: string): void;

  /**
   * Get all elements in the cache
   */
  getAllElements<T extends NamedElement>(): T[];
}

/**
 * Function is a predicate, to test each element of the array. Return a value that coerces to true
 * to keep the element, or to false otherwise.
 */
export interface FilterPredicate {
  (NamedElement: NamedElement): boolean;
}

export class ModelElementCache implements CacheStrategy {
  private instanceCache: Map<string, NamedElement>;

  constructor() {
    this.instanceCache = new Map<string, NamedElement>();
  }

  public reset(): void {
    this.instanceCache.clear();
  }

  public get<T>(key: string): T {
    return this.instanceCache.get(key) as T;
  }

  public filter<T>(filterPredicate: FilterPredicate): T[] {
    return [...this.instanceCache.values()].filter(filterPredicate) as T[];
  }

  public getByName<T>(name: string): T[] {
    return [...this.instanceCache.values()].filter(element => element.name === name) as T[];
  }

  public resolveInstance<T extends NamedElement>(instance: T): T {
    if (instance.isAnonymous()) {
      return instance;
    }

    const aspectModelUrn = instance.aspectModelUrn;
    const resolvedInstance = this.get(aspectModelUrn);
    if (resolvedInstance) {
      return resolvedInstance as T;
    }

    this.instanceCache.set(aspectModelUrn, instance);
    return instance;
  }

  public addElement<T>(aspectModelUrn: string, modelElement: T, overwrite = false) {
    aspectModelUrn = (modelElement as NamedElement)?.aspectModelUrn || aspectModelUrn;
    const cachedElement = this.instanceCache.get(aspectModelUrn);

    if (!overwrite && cachedElement) {
      return;
    }

    if (cachedElement) {
      console.info(`Element with the name ${aspectModelUrn} already exist. Overwriting existing element.`);
    }
    this.instanceCache.set(aspectModelUrn, modelElement as NamedElement);
  }

  public removeElement(key: string): void {
    this.instanceCache.delete(key);
  }

  public getKeys(search = '') {
    return Array.from(this.instanceCache.keys()).filter(key => key?.includes(search));
  }

  public updateElementsNamespace(oldValue: string, newValue: string): void {
    const newCachedElements = new Map<string, NamedElement>();

    this.instanceCache.forEach((element: NamedElement, key: string) => {
      const newAspectModelUrn = element.aspectModelUrn.replace(oldValue, newValue);
      const newKey = key.replace(oldValue, newValue);

      element.aspectModelUrn = newAspectModelUrn;
      newCachedElements.set(newKey, element);
    });
    this.instanceCache = newCachedElements;
  }

  updateElementKey(oldKey: string, newKey: string) {
    const resolvedEntry = this.instanceCache.get(oldKey);
    if (resolvedEntry) {
      this.instanceCache.delete(oldKey);
      this.instanceCache.set(newKey, resolvedEntry);
    }
  }

  getAllElements<T extends NamedElement>(): T[] {
    return [...this.instanceCache.values()] as T[];
  }
}
