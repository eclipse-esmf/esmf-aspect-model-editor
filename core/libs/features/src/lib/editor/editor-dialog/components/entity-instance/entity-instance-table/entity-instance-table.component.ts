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

import {Component, computed, effect, inject, input, viewChild} from '@angular/core';
import {toSignal} from '@angular/core/rxjs-interop';
import {DefaultEntity, DefaultEntityInstance} from '@esmf/aspect-model-loader';
import {EditorModelService} from '../../../editor-model.service';
import {EditorSignalFormContext} from '../../../forms/editor-signal-form-context';
import {EntityInstanceModalTableComponent} from '../entity-instance-modal-table/entity-instance-modal-table.component';

@Component({
  selector: 'ame-entity-instance-table',
  templateUrl: './entity-instance-table.component.html',
  styleUrls: ['./entity-instance-table.component.scss'],
  imports: [EntityInstanceModalTableComponent],
})
export class EntityInstanceTableComponent {
  readonly signalForm = input.required<EditorSignalFormContext>();

  private editorModelService = inject(EditorModelService);
  private table = viewChild(EntityInstanceModalTableComponent);

  private readonly modelElement = toSignal(this.editorModelService.getMetaModelElement(), {initialValue: null});
  readonly entityValue = computed(() => {
    const element = this.modelElement();
    return element instanceof DefaultEntityInstance ? element : null;
  });
  readonly entity = computed(() => {
    const type = this.entityValue()?.type;
    return type instanceof DefaultEntity ? type : null;
  });

  constructor() {
    effect(onCleanup => {
      const table = this.table();
      const context = this.signalForm();
      if (!table || !context || !(this.entityValue() instanceof DefaultEntityInstance)) return;

      const unregisterProperties = context.register('entityValueProperties', table.propertiesForm);
      context.set('newEntityValues', table.newEntityValues());
      onCleanup(() => {
        unregisterProperties();
        context.remove('newEntityValues');
      });
    });
  }
}
