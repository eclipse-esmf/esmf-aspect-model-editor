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

import {BaseMetaModelElement} from './base';
import {CanExtend} from './can-extend';

interface AbstractProperty {
  exampleValue?: any;
}

export class DefaultAbstractProperty extends CanExtend implements AbstractProperty {
  public extendedElement: DefaultAbstractProperty = null;

  static createInstance() {
    return new DefaultAbstractProperty(null, null, 'abstractProperty', null);
  }

  get className() {
    return 'DefaultAbstractProperty';
  }

  constructor(
    metaModelVersion: string,
    aspectModelUrn: string,
    name: string,
    public exampleValue?: any,
    predefined = false,
  ) {
    super(metaModelVersion, aspectModelUrn, name);
    this.predefined = predefined;
  }

  isPredefined() {
    return this.predefined;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  delete(_baseMetalModelElement: BaseMetaModelElement) {
    return null;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  update(_baseMetalModelElement: BaseMetaModelElement) {
    return null;
  }
}
