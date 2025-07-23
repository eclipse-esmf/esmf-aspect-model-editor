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
import {Component, Input} from '@angular/core';
import {DefaultEntity, DefaultState} from '@esmf/aspect-model-loader';
import {PreviousFormDataSnapshot} from '../../../interfaces';
import {ModelElementEditorComponent} from '../../model-element-editor-component';

@Component({
  selector: 'ame-state-characteristic',
  templateUrl: './state-characteristic.component.html',
})
export class StateCharacteristicComponent extends ModelElementEditorComponent<DefaultState> {
  @Input() previousData: PreviousFormDataSnapshot = {};
  @Input() parentForm: any;

  get hasEntityType(): boolean {
    return this.metaModelElement?.dataType instanceof DefaultEntity;
  }
}
