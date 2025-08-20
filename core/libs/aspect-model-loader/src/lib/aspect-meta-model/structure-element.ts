/* eslint-disable @typescript-eslint/no-unsafe-declaration-merging */
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
import {StructuredElementProps} from '../shared/props';
import {PropertyUrn} from './default-entity-instance';
import {HasProperties} from './has-properties';
import {NamedElement} from './named-element';

export interface PropertyPayload {
  optional: boolean;
  notInPayload: boolean;
  payloadName: string;
}

export interface StructureElement extends HasProperties, NamedElement {}
export abstract class StructureElement extends NamedElement {
  @use(HasProperties) _: StructureElement;

  override get children(): ElementSet {
    return new ElementSet(...this.properties);
  }

  propertiesPayload: Record<PropertyUrn, PropertyPayload> = {};

  constructor(props: StructuredElementProps) {
    super(props);
    this.properties = props.properties || [];
  }

  isComplexType() {
    return false;
  }
}
