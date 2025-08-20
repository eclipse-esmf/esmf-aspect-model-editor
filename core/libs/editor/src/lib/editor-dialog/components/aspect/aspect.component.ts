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
import {FormControl} from '@angular/forms';
import {DefaultAspect} from '@esmf/aspect-model-loader';
import {ModelElementEditorComponent} from '../model-element-editor-component';
import {UpdatedProperties} from '../properties';

@Component({
  selector: 'ame-aspect',
  templateUrl: './aspect.component.html',
})
export class AspectComponent extends ModelElementEditorComponent<DefaultAspect> {
  @Input() parentForm;

  public element$ = this.metaModelDialogService.getMetaModelElement();

  overwriteProperties(data: UpdatedProperties) {
    this.parentForm.setControl('editedProperties', new FormControl(data));
  }
}
