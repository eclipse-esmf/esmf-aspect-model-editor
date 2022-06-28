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

import {Component, OnInit} from '@angular/core';
import {FormControl} from '@angular/forms';
import {BaseMetaModelElement, DefaultEntity} from '@ame/meta-model';
import {EditorModelService} from '../../../../editor-model.service';
import {EditorDialogValidators} from '../../../../validators';
import {InputFieldComponent} from '../../input-field.component';

@Component({
  selector: 'ame-see-input-field',
  templateUrl: './see-input-field.component.html',
})
export class SeeInputFieldComponent extends InputFieldComponent<BaseMetaModelElement> implements OnInit {
  constructor(public metaModelDialogService: EditorModelService) {
    super(metaModelDialogService);
    this.fieldName = 'see';
  }

  ngOnInit(): void {
    this.subscription = this.getMetaModelData().subscribe(() => this.setSeeControl());
  }

  getCurrentValue() {
    return (
      this.previousData?.[this.fieldName] ||
      ((this.metaModelElement as DefaultEntity)?.extendedSee || this.metaModelElement?.getSeeReferences())?.join(',') ||
      ''
    );
  }

  private setSeeControl() {
    if (this.parentForm.get(this.fieldName)?.value) {
      return;
    }
    this.parentForm.setControl(
      this.fieldName,
      new FormControl(
        {
          value: this.decodeUriComponent(this.getCurrentValue()),
          disabled:
            this.metaModelDialogService.isReadOnly() ||
            (this.metaModelElement as DefaultEntity).extendedSee ||
            this.metaModelElement?.isExternalReference(),
        },
        {
          validators: [EditorDialogValidators.seeURI],
        }
      )
    );
  }

  private decodeUriComponent(seeReference: string): string {
    return seeReference ? decodeURIComponent(seeReference) : null;
  }
}
