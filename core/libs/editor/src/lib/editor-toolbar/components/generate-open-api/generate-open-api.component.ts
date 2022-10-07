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

import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {ModelApiService} from '@ame/api';

@Component({
  selector: 'ame-generate-open-api',
  templateUrl: './generate-open-api.component.html',
  styleUrls: ['./generate-open-api.component.scss'],
})
export class GenerateOpenApiComponent implements OnInit {
  constructor(
    private dialogRef: MatDialogRef<GenerateOpenApiComponent>,
    private modelApiService: ModelApiService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {}
}
