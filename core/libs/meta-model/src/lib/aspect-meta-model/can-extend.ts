/*
 * Copyright (c) 2022 Robert Bosch Manufacturing Solutions GmbH
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

import {AspectModelVisitor} from '@ame/mx-graph';
import {Base} from './base';
import {OverWrittenProperty} from './overwritten-property';

export abstract class CanExtend extends Base {
  public extendedElement: CanExtend;

  public get className(): any {
    throw new Error('Method not implemented.');
  }

  public get extendedPreferredName() {
    if (!this.extendedElement) {
      return null;
    }

    return this.extendedElement.preferredNames?.size ? this.extendedElement.preferredNames : this.extendedElement.extendedPreferredName;
  }

  public get extendedDescription() {
    if (!this.extendedElement) {
      return null;
    }

    return this.extendedElement.descriptions?.size ? this.extendedElement.descriptions : this.extendedElement.extendedDescription;
  }

  public get extendedSee() {
    if (!this.extendedElement) {
      return null;
    }

    return this.extendedElement.see?.length ? this.extendedElement.see : this.extendedElement.extendedSee;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  accept<T, U>(_visitor: AspectModelVisitor<T, U>, _context: U): T {
    throw new Error('Method not implemented.');
  }
}

export class CanExtendsWithProperties extends CanExtend {
  public get extendedProperties(): OverWrittenProperty[] {
    return (this.extendedElement as any)?.properties || [];
  }
}
