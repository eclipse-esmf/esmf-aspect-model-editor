/*
 * Copyright (c) 2026 Robert Bosch Manufacturing Solutions GmbH
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

import {MaxGraphHelper} from '@ame/max-graph';
import {DefaultEntity, DefaultProperty, NamedElement, ScalarValue} from '@esmf/aspect-model-loader';
import {Cell} from '@maxgraph/core';
import {InheritanceConnector} from './inheritance-connector';

export class PropertyInheritanceConnector extends InheritanceConnector {
  public connect(parentMetaModel: NamedElement, childMetaModel: NamedElement, parentCell: Cell, childCell: Cell) {
    if (parentMetaModel instanceof DefaultProperty && childMetaModel instanceof DefaultProperty) {
      parentMetaModel.name = `[${childMetaModel.name}]`;
      parentMetaModel.preferredNames.clear();
      parentMetaModel.descriptions.clear();
      parentMetaModel.exampleValue = new ScalarValue({value: '', type: null});
      parentCell.setId(`[${childMetaModel.name}]`);
    }

    super.connect(parentMetaModel, childMetaModel, parentCell, childCell);
  }

  isInheritedElement(element: NamedElement): boolean {
    return element instanceof DefaultProperty || (element instanceof DefaultEntity && element.isAbstractEntity());
  }

  protected hasEntityParent(cell: Cell) {
    return !this.maxgraphService.resolveParents(cell)?.some(cell => MaxGraphHelper.getModelElement(cell) instanceof DefaultEntity);
  }
}
