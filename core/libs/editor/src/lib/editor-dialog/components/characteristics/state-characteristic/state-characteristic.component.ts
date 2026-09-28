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
import {Component, inject, input} from '@angular/core';
import {toSignal} from '@angular/core/rxjs-interop';
import {DefaultEntity, DefaultState} from '@esmf/aspect-model-loader';
import {filter, of} from 'rxjs';
import {EditorModelService} from '../../../editor-model.service';
import {EditorSignalFormContext} from '../../../forms/editor-signal-form-context';
import {PreviousFormDataSnapshot} from '../../../interfaces';
import {DefaultValueEntityInputFieldComponent, DefaultValueInputFieldComponent, ValuesInputFieldComponent} from '../../fields';

@Component({
  selector: 'ame-state-characteristic',
  templateUrl: './state-characteristic.component.html',
  imports: [ValuesInputFieldComponent, DefaultValueEntityInputFieldComponent, DefaultValueInputFieldComponent],
})
export class StateCharacteristicComponent {
  private metaModelDialogService = inject(EditorModelService, {optional: true});

  readonly previousData = input<PreviousFormDataSnapshot>({});
  readonly signalForm = input.required<EditorSignalFormContext>();

  public metaModelElement = toSignal(
    (this.metaModelDialogService?.getMetaModelElement() ?? of(undefined)).pipe(
      filter((element): element is DefaultState => element instanceof DefaultState),
    ),
  );

  get hasEntityType(): boolean {
    const formEntity = this.signalForm()?.get('dataTypeEntity');
    if (formEntity !== undefined && formEntity !== null) {
      return formEntity instanceof DefaultEntity;
    }
    return this.metaModelElement()?.dataType instanceof DefaultEntity;
  }
}
