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

import {ElementSet} from '../shared/elements-set';
import {NamedElementProps} from '../shared/props';
import {ModelElement} from './model-element';

export type LangString = string;

export abstract class NamedElement extends ModelElement {
  abstract className: string;
  _name: string;
  isPredefined: boolean;
  anonymous: boolean;
  aspectModelUrn: string;
  syntheticName: boolean;
  preferredNames: Map<LangString, string> = new Map();
  descriptions: Map<LangString, string> = new Map();
  see: string[] = [];
  parents: ElementSet = new ElementSet();

  set name(value: string) {
    this._name = value;
    const [namespace] = this.aspectModelUrn.split('#');
    this.aspectModelUrn = `${namespace}#${value}`;
  }
  get name() {
    return this._name;
  }

  constructor(props: NamedElementProps) {
    super(props);
    this.aspectModelUrn = props.aspectModelUrn;
    this.name = props.name;
    this.syntheticName = Boolean(props.hasSyntheticName);
    this.see = props.see || [];
    this.descriptions = props.descriptions || new Map();
    this.preferredNames = props.preferredNames || new Map();
    this.anonymous = Boolean(props.isAnonymous);
    this.isPredefined = Boolean(props.isPredefined);
  }

  get namespace(): string {
    return this.aspectModelUrn?.split('#')?.[0];
  }

  abstract get children(): ElementSet;

  getAspectModelUrn(): string {
    return this.aspectModelUrn;
  }

  getName(): string {
    return this.name;
  }

  hasSyntheticName(): boolean {
    return this.syntheticName;
  }

  isAnonymous(): boolean {
    return this.anonymous;
  }

  getSee(): string[] {
    return this.see;
  }

  setSee(value: string) {
    this.see.push(value);
  }

  removeSee(value: string) {
    this.see = this.see.filter(see => see !== value);
  }

  getPreferredNames(): Map<LangString, string> {
    return this.preferredNames;
  }

  getDescriptions(): Map<LangString, string> {
    return this.descriptions;
  }

  getPreferredName(lang: LangString = 'en'): string {
    return this.preferredNames.get(lang);
  }

  getDescription(lang: LangString = 'en'): string {
    return this.descriptions.get(lang);
  }

  getParents(): NamedElement[] {
    return this.parents;
  }

  addChild(child: NamedElement) {
    if (this.children.some(c => c.aspectModelUrn === child.aspectModelUrn)) {
      return;
    }

    this.children.push(child);
  }

  hasChild(child: NamedElement) {
    return this.children.some(e => child.aspectModelUrn === e.aspectModelUrn);
  }

  addParent(parent: NamedElement) {
    this.parents.push(parent);
  }

  removeParent(parent: NamedElement) {
    this.parents = new ElementSet(...this.parents.filter(p => parent.aspectModelUrn !== p.aspectModelUrn));
  }

  hasParent(parent: NamedElement): boolean {
    return -1 < this.parents.findIndex(e => e.aspectModelUrn === parent.aspectModelUrn);
  }
}
