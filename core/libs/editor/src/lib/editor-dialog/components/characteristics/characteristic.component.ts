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
import {LoadedFilesService} from '@ame/cache';
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
import {Component, computed, DestroyRef, inject, input, OnInit, signal} from '@angular/core';
import {takeUntilDestroyed, toSignal} from '@angular/core/rxjs-interop';
import {MatIcon} from '@angular/material/icon';
import {MatSlideToggle} from '@angular/material/slide-toggle';
import {TranslocoDirective} from '@jsverse/transloco';
import {StateCharacteristicComponent} from '../../components/characteristics/state-characteristic/state-characteristic.component';
import {StructuredValueComponent} from '../../components/characteristics/structured-value/structured-value.component';
import {EditorModelService} from '../../editor-model.service';
import {EditorSignalFormContext} from '../../forms/editor-signal-form-context';
import {PreviousFormDataSnapshot} from '../../interfaces';

@Component({
  selector: 'ame-characteristic',
  templateUrl: './characteristic.component.html',
  styleUrls: ['../fields/field.scss'],
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
    TranslocoDirective,
    MatSlideToggle,
    MatIcon,
  ],
})
export class CharacteristicComponent implements OnInit {
  readonly signalForm = input.required<EditorSignalFormContext>();

  private destroyRef = inject(DestroyRef);
  private loadedFilesService = inject(LoadedFilesService);

  public metaModelDialogService = inject(EditorModelService);

  public property = signal(false);
  public selectedCharacteristic = signal<CharacteristicClassType>(undefined);
  public previousData = signal<PreviousFormDataSnapshot>({});
  public element = toSignal(this.metaModelDialogService.getMetaModelElement());

  public isAnonymous = signal(false);
  public canBeAnonymous = computed(() => {
    const el = this.element();
    return Boolean(el && !el.isPredefined && !this.loadedFilesService.isElementExtern(el) && el.parents && el.parents.length > 0);
  });

  public characteristicClassType = signal(CharacteristicClassType);
  allowedClassesForElementCharacteristic = signal<CharacteristicClassType[]>([
    this.characteristicClassType().Collection,
    this.characteristicClassType().Set,
    this.characteristicClassType().SortedSet,
    this.characteristicClassType().List,
    this.characteristicClassType().TimeSeries,
  ]);
  allowedClassesForUnit = signal<CharacteristicClassType[]>([
    this.characteristicClassType().Measurement,
    this.characteristicClassType().Quantifiable,
    this.characteristicClassType().Duration,
  ]);

  ngOnInit(): void {
    this.metaModelDialogService
      .getMetaModelElement()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(el => {
        if (el) {
          this.isAnonymous.set(Boolean(el.isAnonymous?.()));
          this.property.set(true);
        }
      });
  }

  onAnonymousToggleChange(checked: boolean) {
    this.isAnonymous.set(checked);
    const elem = this.element();
    if (elem) {
      elem.anonymous = checked;
      const typeName = elem.className ? elem.className.replace('Default', '') : 'Characteristic';
      if (checked) {
        elem.name = `[${typeName}]`;
        this.signalForm().set('name', `[${typeName}]`);
        this.signalForm().set('isAnonymous', true);
      } else {
        elem.name = typeName;
        this.signalForm().set('name', typeName);
        this.signalForm().set('isAnonymous', false);
      }
      this.metaModelDialogService.updateMetaModelElement(elem);
    }
  }

  onPreviousDataChange(previousData: PreviousFormDataSnapshot) {
    this.previousData.set(previousData);
  }

  onClassChange(characteristic: CharacteristicClassType) {
    if (this.selectedCharacteristic() === characteristic) {
      return;
    }
    this.selectedCharacteristic.set(characteristic);
  }

  isElementCharacteristicAllowed(): boolean {
    return this.allowedClassesForElementCharacteristic().includes(this.selectedCharacteristic());
  }

  isUnitAllowed(): boolean {
    return this.allowedClassesForUnit().includes(this.selectedCharacteristic());
  }
}
