/* eslint-disable @typescript-eslint/no-unsafe-declaration-merging */
/* eslint-disable @typescript-eslint/no-empty-interface */
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

import {use} from 'typescript-mix';
import {ElementSet} from '../shared/elements-set';
import {EntityInstanceProps} from '../shared/props';
import {ModelVisitor} from '../visitor/model-visitor';
import {Enumeration} from './characteristic/default-enumeration';
import {Entity} from './default-entity';
import {LangString, NamedElement} from './named-element';
import {Value} from './value';

export type PropertyUrn = string;
export type EntityInstanceProperty<T = PropertyUrn> = [T, Value];

export interface EntityInstance extends NamedElement, Value {
  assertions: Map<PropertyUrn, Value[]>;
  type: Entity;
  getAssertions(): Map<PropertyUrn, Value[]>;
  getAssertion(propertyUrn: PropertyUrn): Value[];
  setAssertion(propertyUrn: PropertyUrn, value: Value): void;
  getTuples(): EntityInstanceProperty[];
  removeAssertion(propertyUrn: PropertyUrn, value: Value): void;
}

export interface DefaultEntityInstance extends EntityInstance {}
export class DefaultEntityInstance extends NamedElement implements EntityInstance {
  @use(Value) _: DefaultEntityInstance;

  className = 'DefaultEntityInstance';
  assertions: Map<PropertyUrn, Value[]> = new Map();
  type: Entity;

  override parents: ElementSet<Enumeration> = new ElementSet();
  override get children(): ElementSet<NamedElement> {
    const children = new ElementSet<NamedElement>();
    Array.from(this.assertions.values())
      .flat()
      .forEach(value => {
        if (value instanceof DefaultEntityInstance) {
          children.push(value);
        }
      });
    if (this.type) {
      children.push(this.type);
    }
    return children;
  }

  constructor(props: EntityInstanceProps) {
    super(props);
    this.type = props.type;
    this.assertions = props.assertions || new Map();
  }

  getTuples(): EntityInstanceProperty[] {
    return Array.from(this.assertions.entries()).reduce((tuples, [propertyUrn, values]) => {
      values.forEach(value => tuples.push([propertyUrn, value]));
      return tuples;
    }, []);
  }

  getType(): Entity {
    return this.type as Entity;
  }

  getAssertions(): Map<PropertyUrn, Value[]> {
    return this.assertions;
  }

  getAssertion(propertyUrn: PropertyUrn): Value[] {
    return this.assertions.get(propertyUrn) || [];
  }

  getValues<T>(): T {
    return Array.from(this.assertions.values()) as T;
  }

  setAssertion(propertyUrn: PropertyUrn, value: Value) {
    if (!value) return;
    if (!this.assertions.has(propertyUrn)) {
      this.assertions.set(propertyUrn, []);
    }
    const values = this.assertions.get(propertyUrn);
    values.push(value);
  }

  removeAssertionLanguage(propertyUrn: PropertyUrn, language: LangString): boolean {
    if (!language) return false;
    if (!this.assertions.has(propertyUrn)) return false;

    const values = this.assertions.get(propertyUrn);
    if (!Array.isArray(values)) return false;

    this.assertions.set(
      propertyUrn,
      values.filter(v => v.language === language),
    );
    return true;
  }

  removeAssertion(propertyUrn: PropertyUrn, value: Value) {
    if (!value) return;
    if (!this.assertions.has(propertyUrn)) {
      return;
    }
    const values = this.assertions.get(propertyUrn);
    const index = values.findIndex(
      v => v.value === value.value && v.language === value.language && v.type?.getUrn() === value.type.getUrn(),
    );
    if (index > -1) {
      values.splice(index, 1);
    }
  }

  accept<T, U>(visitor: ModelVisitor<T, U>, context: U): T {
    return visitor.visitEntityInstance(this, context);
  }
}
