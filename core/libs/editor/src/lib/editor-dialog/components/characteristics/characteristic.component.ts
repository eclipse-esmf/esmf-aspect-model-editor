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
import {
  BaseInputComponent,
  CharacteristicClassType,
  CharacteristicNameDropdownFieldComponent,
  DataTypeInputFieldComponent,
  ElementCharacteristicInputFieldComponent,
  ElementListComponent,
  LeftInputFieldComponent,
  RightInputFieldComponent,
  UnitInputFieldComponent,
  ValuesInputFieldComponent,
} from '@ame/editor';
import {AsyncPipe} from '@angular/common';
import {ChangeDetectorRef, Component, DestroyRef, Input, OnInit, inject} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {FormGroup} from '@angular/forms';
import {TranslatePipe} from '@ngx-translate/core';
import {StateCharacteristicComponent} from '../../components/characteristics/state-characteristic/state-characteristic.component';
import {StructuredValueComponent} from '../../components/characteristics/structured-value/structured-value.component';
import {EditorModelService} from '../../editor-model.service';
import {PreviousFormDataSnapshot} from '../../interfaces';

@Component({
  selector: 'ame-characteristic',
  templateUrl: './characteristic.component.html',
  imports: [
    CharacteristicNameDropdownFieldComponent,
    BaseInputComponent,
    DataTypeInputFieldComponent,
    ElementCharacteristicInputFieldComponent,
    ValuesInputFieldComponent,
    UnitInputFieldComponent,
    StateCharacteristicComponent,
    StructuredValueComponent,
    LeftInputFieldComponent,
    RightInputFieldComponent,
    ElementListComponent,
    AsyncPipe,
    TranslatePipe,
  ],
})
export class CharacteristicComponent implements OnInit {
  @Input() parentForm: FormGroup;

  private destroyRef = inject(DestroyRef);
  private changeDetector = inject(ChangeDetectorRef);

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

  ngOnInit(): void {
    this.metaModelDialogService
      .getMetaModelElement()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
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
