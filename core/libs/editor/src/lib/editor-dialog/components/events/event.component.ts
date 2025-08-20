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

import {Component, Input, inject} from '@angular/core';
import {FormGroup} from '@angular/forms';
import {DefaultEvent} from '@esmf/aspect-model-loader';
import {EditorModelService} from '../../editor-model.service';
import {ModelElementEditorComponent} from '../model-element-editor-component';

@Component({
  selector: 'ame-event',
  templateUrl: './event.component.html',
})
export class EventComponent extends ModelElementEditorComponent<DefaultEvent> {
  @Input() parentForm: FormGroup;
  public metaModelDialogService = inject(EditorModelService);
  public element$ = this.metaModelDialogService.getMetaModelElement();
}
