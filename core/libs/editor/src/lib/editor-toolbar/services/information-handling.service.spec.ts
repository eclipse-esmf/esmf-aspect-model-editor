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

import {SettingDialogComponent} from '@ame/settings-dialog';
import {TestBed} from '@angular/core/testing';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {of} from 'rxjs';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {DocumentComponent} from '../components/help/document.component';
import {NotificationsComponent} from '../components/notifications/notifications.component';
import {InformationHandlingService} from './information-handling.service';

describe('InformationHandlingService', () => {
  let service: InformationHandlingService;
  let dialog: MatDialog;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        InformationHandlingService,
        {
          provide: MatDialog,
          useValue: {
            open: vi.fn(),
          },
        },
      ],
    });

    service = TestBed.inject(InformationHandlingService);
    dialog = TestBed.inject(MatDialog);
  });

  it('openSettingsDialog should open SettingDialogComponent', () => {
    service.openSettingsDialog();
    expect(dialog.open).toHaveBeenCalledWith(SettingDialogComponent, {
      panelClass: 'settings-dialog-container',
      width: '60%',
      autoFocus: false,
    });
  });

  it('openHelpDialog should open DocumentComponent', () => {
    service.openHelpDialog();
    expect(dialog.open).toHaveBeenCalledWith(DocumentComponent);
  });

  it('openNotificationDialog should open NotificationsComponent', () => {
    const dialogRefMock = {
      keydownEvents: vi.fn(() => of({key: 'Escape', code: 'Escape'})),
      close: vi.fn(),
    } as unknown as MatDialogRef<any>;

    vi.spyOn(dialog, 'open').mockReturnValue(dialogRefMock);

    service.openNotificationDialog();
    expect(dialog.open).toHaveBeenCalledWith(NotificationsComponent, {
      width: '60%',
      autoFocus: false,
    });
    expect(dialogRefMock.close).toHaveBeenCalled();
  });
});
