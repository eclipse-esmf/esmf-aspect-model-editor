/*
 * Copyright (c) 2022 Robert Bosch Manufacturing Solutions GmbH
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
import {UpdatedProperties} from '../properties';
import {EditorModelService} from '../../editor-model.service';
import {FormControl} from '@angular/forms';

@Component({
  selector: 'ame-abstract-entity',
  templateUrl: './abstract-entity.component.html',
})
export class AbstractEntityComponent {
  @Input() parentForm;

  constructor(public metaModelDialogService: EditorModelService) {}

  overwriteProperties(data: UpdatedProperties) {
    this.parentForm.setControl('editedProperties', new FormControl(data));
  }
}
