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

import {Component, inject, OnInit} from '@angular/core';
import {FormGroup, ReactiveFormsModule} from '@angular/forms';
import {MatError} from '@angular/material/input';
import {TranslatePipe} from '@ngx-translate/core';
import {SettingsFormService} from '../../../services';

@Component({
  selector: 'ame-copyright',
  templateUrl: './header-copyright.component.html',
  styleUrls: ['./header-copyright.component.scss'],
  imports: [ReactiveFormsModule, MatError, TranslatePipe],
})
export class HeaderCopyrightComponent implements OnInit {
  private formService = inject(SettingsFormService);

  public form: FormGroup;

  ngOnInit(): void {
    this.form = this.formService.getForm().get('copyrightHeaderConfiguration') as FormGroup;
  }

  get copyrightControl() {
    return this.form.get('copyright');
  }

  onTextChange() {
    this.copyrightControl.updateValueAndValidity();
  }
}
