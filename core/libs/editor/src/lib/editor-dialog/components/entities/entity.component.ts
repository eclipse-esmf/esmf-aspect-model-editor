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
import {FormControl, FormGroup} from '@angular/forms';
import {EditorModelService} from '../../editor-model.service';
import {UpdatedProperties} from '../properties';

@Component({
  selector: 'ame-entity',
  templateUrl: './entity.component.html',
})
export class EntityComponent {
  @Input() parentForm: FormGroup;
  public metaModelDialogService = inject(EditorModelService);
  public element$ = this.metaModelDialogService.getMetaModelElement();

  overwriteProperties(data: UpdatedProperties) {
    this.parentForm.setControl('editedProperties', new FormControl(data));
  }
}
