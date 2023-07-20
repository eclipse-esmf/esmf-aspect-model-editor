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

import {Base, Event, Operation} from './index';
import {BaseMetaModelElement} from './base';
import {HasProperties} from './has-properties';
import {DefaultProperty} from './default-property';
import {DefaultOperation} from './default-operation';
import {OverWrittenProperty} from './overwritten-property';
import {DefaultEvent} from './default-event';

export interface Aspect extends BaseMetaModelElement, HasProperties {
  operations: Array<Operation>;
  events: Array<Event>;
  isCollectionAspect?: boolean;
}

export class DefaultAspect extends Base implements Aspect {
  get className() {
    return 'DefaultAspect';
  }

  static createInstance() {
    return new DefaultAspect(null, null, 'Aspect');
  }

  constructor(
    metaModelVersion: string,
    aspectModelUrn: string,
    name: string,
    public properties: Array<OverWrittenProperty> = [],
    public operations: Array<Operation> = [],
    public events: Array<Event> = [],
    public isCollectionAspect: boolean = false
  ) {
    super(metaModelVersion, aspectModelUrn, name);
  }

  delete(baseMetalModelElement: BaseMetaModelElement) {
    if (baseMetalModelElement instanceof DefaultProperty) {
      const index = this.properties.findIndex(({property}) => property.aspectModelUrn === baseMetalModelElement.aspectModelUrn);
      if (index >= 0) {
        this.properties.splice(index, 1);
      }
    } else if (baseMetalModelElement instanceof DefaultOperation) {
      const index = this.operations.indexOf(baseMetalModelElement);
      if (index >= 0) {
        this.operations.splice(index, 1);
      }
    } else if (baseMetalModelElement instanceof DefaultEvent) {
      const index = this.events.indexOf(baseMetalModelElement);
      if (index >= 0) {
        this.events.splice(index, 1);
      }
    }
  }
}
