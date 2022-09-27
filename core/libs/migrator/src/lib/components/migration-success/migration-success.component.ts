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

import {Component} from '@angular/core';
import {MigratorService} from '../../migrator.service';

@Component({
  selector: 'ame-migration-success',
  templateUrl: './migration-success.component.html',
  styleUrls: ['./migration-success.component.scss'],
})
export class MigrationSuccessComponent {
  constructor(private migratorService: MigratorService) {}

  closeModal() {
    this.migratorService.dialogRef.close();
  }
}
