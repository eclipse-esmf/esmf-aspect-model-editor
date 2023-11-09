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

import {Component, Inject} from '@angular/core';
import {NamespacesSessionInterface} from '../../models';
import {NAMESPACES_SESSION} from '../../services';
import {NotificationsService} from '@ame/shared';
import {first} from 'rxjs';

enum ERROR_TYPES {
  UNKNOWN,
  VALIDATION,
}

@Component({
  templateUrl: './error.component.html',
  styleUrls: ['./error.component.scss'],
})
export class ErrorComponent {
  public errorTypes = ERROR_TYPES;
  public error = {
    message: 'An error has occurred while processing namespaces!',
    type: ERROR_TYPES.UNKNOWN,
  };

  constructor(@Inject(NAMESPACES_SESSION) private session: NamespacesSessionInterface, private notificationService: NotificationsService) {
    this.session.state.validating$.pipe(first()).subscribe({
      error: (error: any) => {
        this.error.message = error?.error?.error?.message || this.error.message;
        this.error.type = ERROR_TYPES.VALIDATION;
        this.notificationService.error({title: 'Package validation error', message: this.error.message});
      },
    });
  }
}
