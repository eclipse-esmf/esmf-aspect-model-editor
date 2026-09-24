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

import {ModelInfo} from '@ame/max-graph';
import {NotificationsService} from '@ame/shared';
import {inject, Injectable} from '@angular/core';
import {DefaultProperty, Operation} from '@esmf/aspect-model-loader';
import {Cell} from '@maxgraph/core';
import {map, of, shareReplay} from 'rxjs';
import {BaseConnectionHandler} from '../base-connection-handler.service';
import {SingleShapeConnector} from '../models';

@Injectable({providedIn: 'root'})
export class OperationConnectionHandler extends BaseConnectionHandler implements SingleShapeConnector<Operation> {
  private notificationsService = inject(NotificationsService);

  public connect(operation: Operation, source: Cell, modelInfo: ModelInfo) {
    if (ModelInfo.IS_OPERATION_OUTPUT === modelInfo && operation.output) {
      this.notificationsService.warning({title: 'Operation output is already defined'});
      return of(undefined);
    }

    const defaultProperty = this.elementCreator.createEmptyElement(DefaultProperty, {
      resolveNaming: false,
      cached: false,
    });
    const connect$ = this.modelElementNamingService.resolveMetaModelElement$(defaultProperty).pipe(
      map(() => {
        if (ModelInfo.IS_OPERATION_OUTPUT === modelInfo) {
          operation.output = defaultProperty;
        } else if (ModelInfo.IS_OPERATION_INPUT === modelInfo) {
          operation.input.push(defaultProperty);
        }

        const child = this.renderTree(defaultProperty, source);
        this.refreshPropertiesLabel(child, defaultProperty);
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
