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
import {useUpdater} from '@ame/utils';
import {Injectable} from '@angular/core';
import {DefaultCharacteristic, DefaultConstraint, DefaultTrait} from '@esmf/aspect-model-loader';
import {Cell} from '@maxgraph/core';
import {map, shareReplay} from 'rxjs';
import {BaseConnectionHandler} from '../base-connection-handler.service';
import {SingleShapeConnector} from '../models';

@Injectable({providedIn: 'root'})
export class TraitConnectionHandler extends BaseConnectionHandler implements SingleShapeConnector<DefaultTrait> {
  public connect(trait: DefaultTrait, source: Cell) {
    const isBaseChar = trait.getBaseCharacteristic() == null;
    const defaultElement = isBaseChar
      ? this.elementCreator.createEmptyElement(DefaultCharacteristic, {resolveNaming: false, cached: false})
      : this.elementCreator.createEmptyElement(DefaultConstraint, {resolveNaming: false, cached: false});

    const connect$ = this.modelElementNamingService.resolveMetaModelElement$(defaultElement).pipe(
      map(() => {
        const child = this.maxgraphService.renderModelElement(
          this.filtersService.createNode(defaultElement, {parent: MaxGraphHelper.getModelElement(source)}),
        );

        useUpdater(trait).update(defaultElement);
        this.refreshPropertiesLabel(child, defaultElement);

        this.maxgraphService.assignToParent(child, source);
        this.maxgraphService.moveCells([child], source.getGeometry().x + 30, source.getGeometry().y + 60);
        this.maxgraphService.formatCell(child);
        this.maxgraphService.formatShapes();
      }),
      shareReplay(1),
    );
    connect$.subscribe();
    return connect$;
  }
}
