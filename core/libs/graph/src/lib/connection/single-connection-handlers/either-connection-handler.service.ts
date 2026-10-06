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

import {NotificationsService} from '@ame/shared';
import {inject, Injectable} from '@angular/core';
import {DefaultCharacteristic, DefaultEither} from '@esmf/aspect-model-loader';
import {Cell} from '@maxgraph/core';
import {map, of, shareReplay} from 'rxjs';
import {ModelInfo} from '../../max-graph';
import {BaseConnectionHandler} from '../base-connection-handler.service';
import {SingleShapeConnector} from '../models';

@Injectable({providedIn: 'root'})
export class EitherConnectionHandler extends BaseConnectionHandler implements SingleShapeConnector<DefaultEither> {
  private notificationsService = inject(NotificationsService);

  public connect(either: DefaultEither, source: Cell, modelInfo: ModelInfo) {
    if (ModelInfo.IS_EITHER_LEFT === modelInfo && either.left) {
      this.notificationsService.warning({title: 'Either left is already defined'});
      return of(undefined);
    } else if (ModelInfo.IS_EITHER_RIGHT === modelInfo && either.right) {
      this.notificationsService.warning({title: 'Either right is already defined'});
      return of(undefined);
    }

    const defaultCharacteristic = this.elementCreator.createEmptyElement(DefaultCharacteristic, {
      resolveNaming: false,
      cached: false,
    });
    const connect$ = this.modelElementNamingService.resolveMetaModelElement$(defaultCharacteristic).pipe(
      map(() => {
        if (ModelInfo.IS_EITHER_LEFT === modelInfo) {
          either.left = defaultCharacteristic;
        } else if (ModelInfo.IS_EITHER_RIGHT === modelInfo) {
          either.right = defaultCharacteristic;
        }

        const child = this.renderTree(defaultCharacteristic, source);
        this.refreshPropertiesLabel(child, defaultCharacteristic);
        this.maxgraphService.assignToParent(child, source);
        this.maxgraphService.formatCell(source);
        this.maxgraphService.formatShapes();
      }),
      shareReplay(1),
    );
    connect$.subscribe();
    return connect$;
  }
}
