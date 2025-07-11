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

import {Injectable} from '@angular/core';
import {DefaultEntityInstance} from '@esmf/aspect-model-loader';
import {mxgraph} from 'mxgraph-factory';

@Injectable({
  providedIn: 'root',
})
export class MxGraphCharacteristicHelper {
  /**
   * When we delete the edge between enumeration and entity,
   * entity values or the edges between enumeration and entity value must be deleted.
   *
   * @param edge the edge between enumeration and entity.
   */
  static findObsoleteEntityValues(edge: mxgraph.mxCell): Array<mxgraph.mxCell> {
    const obsoleteCells = [];
    edge.source.edges
      .filter(enumerationEdge => enumerationEdge.target.style.includes('entityValue'))
      .forEach(enumerationEntityValueEdge => {
        // if it has more than 2 edges this entity value is referenced into another enumeration too.
        const entityValue = enumerationEntityValueEdge.target;
        if (entityValue.edges.length > 2) {
          obsoleteCells.push(enumerationEntityValueEdge);
        } else {
          obsoleteCells.push(entityValue);
        }
      });

    return obsoleteCells;
  }

  static getChildEntityValuesToDelete(entityValue: DefaultEntityInstance, notInclude: DefaultEntityInstance[]): DefaultEntityInstance[] {
    let entityValues = [];
    entityValue.getTuples().forEach(([, value]) => {
      if (value instanceof DefaultEntityInstance && !notInclude.includes(value)) {
        notInclude.push(value);
        entityValues = [...entityValues, value, ...this.getChildEntityValuesToDelete(value, notInclude)];
      }
    });
    return entityValues;
  }
}
