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
import {AspectProps} from '../shared/props';
import {ModelVisitor} from '../visitor/model-visitor';
import {Event, Operation} from './index';
import {StructureElement} from './structure-element';

export interface Aspect extends StructureElement {
  operations: Array<Operation>;
  events: Array<Event>;
  isCollectionAspect: boolean;

  getOperations(): Operation[];
  setOperations(value: Operation[]): void;
  getEvents(): Event[];
  setEvents(value: Event[]): void;
  accept<T, U>(visitor: ModelVisitor<T, U>, context: U): T;
}

export class DefaultAspect extends StructureElement implements Aspect {
  override className = 'DefaultAspect';
  operations: Operation[];
  events: Event[];
  isCollectionAspect: boolean;

  override get children(): ElementSet {
    const children = [];
    if (this.operations?.length) {
      children.push(...this.operations);
    }

    if (this.events?.length) {
      children.push(...this.events);
    }

    return super.children.append(children);
  }

  constructor(props: AspectProps) {
    super(props);
    this.properties = props.properties || [];
    this.operations = props.operations || [];
    this.events = props.events || [];
    this.isCollectionAspect = props.isCollectionAspect;
  }

  getOperations(): Operation[] {
    return this.operations;
  }

  setOperations(value: Operation[]) {
    this.operations = value;
  }

  getEvents(): Event[] {
    return this.events;
  }

  setEvents(value: Event[]) {
    this.events = value;
  }

  accept<T, U>(visitor: ModelVisitor<T, U>, context: U): T {
    return visitor.visitAspect(this, context);
  }
}
