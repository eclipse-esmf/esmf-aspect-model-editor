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

import {Component, OnInit} from '@angular/core';
import {FormControl} from '@angular/forms';
import {DefaultUnit} from '@ame/meta-model';
import {EditorModelService} from '../../../../editor-model.service';
import {InputFieldComponent} from '../../input-field.component';

@Component({
  selector: 'ame-symbol-input-field',
  templateUrl: './symbol-input-field.component.html',
})
export class SymbolInputFieldComponent extends InputFieldComponent<DefaultUnit> implements OnInit {
  constructor(public metaModelDialogService: EditorModelService) {
    super(metaModelDialogService);
  }

  ngOnInit(): void {
    this.subscription = this.getMetaModelData().subscribe(() => this.initSymbolControl());
  }

  initSymbolControl() {
    this.parentForm.setControl(
      'symbol',
      new FormControl({
        value: this.metaModelElement?.symbol,
        disabled: this.metaModelDialogService.isReadOnly() || this.metaModelElement?.isExternalReference(),
      })
    );
  }
}
