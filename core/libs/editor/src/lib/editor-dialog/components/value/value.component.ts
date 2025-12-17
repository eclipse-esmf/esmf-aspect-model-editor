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

import {AsyncPipe} from '@angular/common';
import {Component, Input, inject} from '@angular/core';
import {FormGroup} from '@angular/forms';
import {DefaultValue} from '@esmf/aspect-model-loader';
import {TranslatePipe} from '@ngx-translate/core';
import {EditorModelService} from '../../editor-model.service';
import {ElementListComponent} from '../element-list';
import {BaseInputComponent, ValueInputFieldComponent} from '../fields';
import {ModelElementEditorComponent} from '../model-element-editor-component';

@Component({
  selector: 'ame-value',
  templateUrl: './value.component.html',
  imports: [BaseInputComponent, ElementListComponent, AsyncPipe, TranslatePipe, ValueInputFieldComponent],
})
export class ValueComponent extends ModelElementEditorComponent<DefaultValue> {
  @Input() parentForm: FormGroup;
  public metaModelDialogService = inject(EditorModelService);
  public element$ = this.metaModelDialogService.getMetaModelElement();
}
