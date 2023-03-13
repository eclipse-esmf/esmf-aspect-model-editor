/*
 * Copyright (c) 2023 Robert Bosch Manufacturing Solutions GmbH
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
import {DefaultEvent} from '@ame/meta-model';
import {ModelElementEditorComponent} from '..';
import {EditorModelService} from '../../editor-model.service';

@Component({
  selector: 'ame-event',
  templateUrl: './event.component.html',
})
export class EventComponent extends ModelElementEditorComponent<DefaultEvent> {
  @Input() parentForm;

  constructor(public metaModelDialogService: EditorModelService) {
    super(metaModelDialogService);
  }
}
