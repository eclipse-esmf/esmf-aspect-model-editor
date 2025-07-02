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
import {CharacteristicClassType} from '@ame/editor';
import {ChangeDetectorRef, Component, Input, OnDestroy, OnInit, inject} from '@angular/core';
import {FormGroup} from '@angular/forms';
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
  public selectedCharacteristic: CharacteristicClassType;
  public previousData: PreviousFormDataSnapshot = {};
  public metaModelDialogService = inject(EditorModelService);
  public element$ = this.metaModelDialogService.getMetaModelElement();

  public characteristicClassType = CharacteristicClassType;
  allowedClassesForElementCharacteristic: CharacteristicClassType[] = [
    this.characteristicClassType.Collection,
    this.characteristicClassType.Set,
    this.characteristicClassType.SortedSet,
    this.characteristicClassType.List,
    this.characteristicClassType.TimeSeries,
  ];
  allowedClassesForUnit: CharacteristicClassType[] = [
    this.characteristicClassType.Measurement,
    this.characteristicClassType.Quantifiable,
    this.characteristicClassType.Duration,
  ];

  @Input() parentForm: FormGroup;

  constructor(private changeDetector: ChangeDetectorRef) {}

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

  onClassChange(characteristic: CharacteristicClassType) {
    this.selectedCharacteristic = characteristic;
  }

  isElementCharacteristicAllowed(): boolean {
    return this.allowedClassesForElementCharacteristic.includes(this.selectedCharacteristic);
  }

  isUnitAllowed(): boolean {
    return this.allowedClassesForUnit.includes(this.selectedCharacteristic);
  }
}
