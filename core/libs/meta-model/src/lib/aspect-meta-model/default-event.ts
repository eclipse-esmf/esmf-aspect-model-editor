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

import {Base, BaseMetaModelElement} from './base';
import {AspectModelVisitor} from '@ame/mx-graph';
import {OverWrittenProperty} from './overwritten-property';
import {Samm} from '@ame/vocabulary';

export interface Event extends BaseMetaModelElement {
  parameters: Array<OverWrittenProperty>;
}

export class DefaultEvent extends Base implements Event {
  static createInstance() {
    return new DefaultEvent(null, null, 'event', []);
  }

  get className() {
    return 'DefaultEvent';
  }

  constructor(metaModelVersion: string, aspectModelUrn: string, name: string, public parameters: Array<OverWrittenProperty> = []) {
    super(metaModelVersion, aspectModelUrn, name);
  }

  accept<T, U>(visitor: AspectModelVisitor<T, U>, context: U): T {
    return visitor.visitEvent(this, context);
  }

  delete(baseMetalModelElement: BaseMetaModelElement) {
    this.parameters = this.parameters.filter(
      overwrittenProperty => overwrittenProperty.property.aspectModelUrn !== baseMetalModelElement.aspectModelUrn
    );
  }

  isPredefined(): boolean {
    return this.aspectModelUrn ? this.aspectModelUrn.startsWith(`${Samm.BASE_URI}event:${this.metaModelVersion}#`) : false;
  }
}
