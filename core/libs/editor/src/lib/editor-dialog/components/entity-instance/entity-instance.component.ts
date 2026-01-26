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
import {AsyncPipe} from '@angular/common';
import {Component, Input, inject} from '@angular/core';
import {FormGroup} from '@angular/forms';
import {TranslatePipe} from '@ngx-translate/core';
import {EditorModelService} from '../../editor-model.service';
import {ElementListComponent} from '../element-list';
import {NameInputFieldComponent} from '../fields';
import {EntityInstanceTableComponent} from './entity-instance-table/entity-instance-table.component';

@Component({
  selector: 'ame-entity-instance',
  templateUrl: './entity-instance.component.html',
  imports: [NameInputFieldComponent, EntityInstanceTableComponent, ElementListComponent, AsyncPipe, TranslatePipe],
})
export class EntityInstanceComponent {
  @Input() parentForm: FormGroup;

  public metaModelDialogService = inject(EditorModelService);
  public element$ = this.metaModelDialogService.getMetaModelElement();
}
