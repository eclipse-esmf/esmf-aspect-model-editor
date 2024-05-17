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
import {IsNamed} from './is-named';
import {IsVersioned} from './is-versioned';
import {IsDescribed} from './is-described';
import {ExternalReference} from './external-reference';

export interface BaseElement extends IsNamed, IsVersioned {}

export interface BaseMetaModelElement extends BaseElement, IsDescribed, ExternalReference {
  fileName: string;
  parents: BaseMetaModelElement[];
  children: BaseMetaModelElement[];
  get className(): string;
  isPredefined(): boolean;
}

export class ModelRelationArray<T extends BaseMetaModelElement> extends Array<T> {
  push(...items: T[]): number {
    let pushedItemsCount = 0;
    for (const item of items) {
      const existent = this.some(e => e.aspectModelUrn === item.aspectModelUrn);
      if (existent) {
        continue;
      }

      super.push(item);
      ++pushedItemsCount;
    }

    return pushedItemsCount;
  }
}

export abstract class Base implements BaseMetaModelElement {
  public preferredNames: Map<string, string>;
  public descriptions: Map<string, string>;
  public see?: Array<string> = [];
  public anonymousNode = false;
  public externalReference = false;
  public predefined = false;
  public fileName: string;

  public parents: BaseMetaModelElement[];
  public children: BaseMetaModelElement[];

  abstract get className(): string;

  protected constructor(
    public metaModelVersion: string,
    public aspectModelUrn: string,
    public name: string
  ) {
    this.preferredNames = new Map();
    this.descriptions = new Map();

    this.children = new ModelRelationArray();
    this.parents = new ModelRelationArray();
  }

  isAnonymousNode(): boolean {
    return this.anonymousNode;
  }

  setAnonymousNode(value: boolean) {
    this.anonymousNode = value;
  }

  addDescription(locale: string, description: string) {
    this.descriptions.set(locale, description);
  }

  getDescription(locale: string): string {
    return this.descriptions.get(locale);
  }

  removeDescription(locale: string): string {
    const descTmp = this.getDescription(locale);
    this.descriptions.delete(locale);
    return descTmp;
  }

  setSeeReferences(references: Array<string>) {
    this.see = references;
  }

  addPreferredName(locale: string, preferredName: string) {
    this.preferredNames.set(locale, preferredName);
  }

  getPreferredName(locale: string): string {
    return this.preferredNames.get(locale);
  }

  removePreferredName(locale: string): string {
    const preferredNameTmp = this.getPreferredName(locale);
    this.preferredNames.delete(locale);
    return preferredNameTmp;
  }

  getAllLocalesDescriptions(): Array<string> {
    return Array.from(this.descriptions.keys());
  }

  getAllLocalesPreferredNames(): Array<string> {
    return Array.from(this.preferredNames.keys());
  }

  getSeeReferences(): Array<string> {
    return this.see;
  }

  addSeeReference(reference: string) {
    return this.see.push(reference);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  delete(_baseMetalModelElement: BaseMetaModelElement) {
    // This is intentional
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  update(_baseMetalModelElement: BaseMetaModelElement) {
    // This is intentional
  }

  setExternalReference(external: boolean) {
    this.externalReference = external;
  }

  isExternalReference() {
    return this.externalReference;
  }

  isPredefined() {
    return this.predefined;
  }
}
