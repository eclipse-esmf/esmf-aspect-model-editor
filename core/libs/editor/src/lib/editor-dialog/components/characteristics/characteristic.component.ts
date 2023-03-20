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
import {ChangeDetectorRef, Component, Input, OnDestroy, OnInit} from '@angular/core';
import {Subscription} from 'rxjs';
import {EditorModelService} from '../../editor-model.service';
import {PreviousFormDataSnapshot} from '../../interfaces';

@Component({
  selector: 'ame-characteristic',
  templateUrl: './characteristic.component.html',
})
export class CharacteristicComponent implements OnInit, OnDestroy {
  private subscription: Subscription;

  public property = false;
  public selectedCharacteristic: string;
  public previousData: PreviousFormDataSnapshot = {};

  @Input() parentForm;

  constructor(public metaModelDialogService: EditorModelService, private changeDetector: ChangeDetectorRef) {}

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }

  ngOnInit(): void {
    this.subscription = this.metaModelDialogService.getMetaModelElement().subscribe(() => {
      // TODO Should be solved better. Form does not seem to update correctly.
      this.property = false;
      requestAnimationFrame(() => (this.property = true));
      this.changeDetector.detectChanges();
    });
  }

  onPreviousDataChange(previousData: PreviousFormDataSnapshot) {
    requestAnimationFrame(() => {
      this.previousData = previousData;
      this.changeDetector.detectChanges();
    });
  }

  onClassChange(characteristic: string) {
    this.selectedCharacteristic = characteristic;
  }
}
