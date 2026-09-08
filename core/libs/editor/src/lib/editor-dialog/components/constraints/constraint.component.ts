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
import {AfterViewInit, ChangeDetectorRef, Component, computed, effect, inject, input, OnDestroy, signal} from '@angular/core';
import {toSignal} from '@angular/core/rxjs-interop';
import {MatIcon} from '@angular/material/icon';
import {MatSlideToggle} from '@angular/material/slide-toggle';
import {TranslocoDirective} from '@jsverse/transloco';
import {EditorModelService} from '../../editor-model.service';
import {EditorFormModel, EditorSignalFormContext} from '../../forms/editor-signal-form-context';
import {PreviousFormDataSnapshot} from '../../interfaces';
import {ElementListComponent} from '../element-list';
import {
  BaseInputComponent,
  ConstraintNameDropdownFieldComponent,
  EncodingInputFieldComponent,
  IntegerInputFieldComponent,
  LanguageCodeInputFieldComponent,
  LocaleCodeInputFieldComponent,
  LowerBoundInputFieldComponent,
  MaxLengthInputFieldComponent,
  MaxValueInputFieldComponent,
  MinLengthInputFieldComponent,
  MinValueInputFieldComponent,
  RegularExpressionValueInputFieldComponent,
  ScaleInputFieldComponent,
  UpperBoundInputFieldComponent,
} from '../fields';

@Component({
  selector: 'ame-constraint',
  templateUrl: './constraint.component.html',
  styleUrls: ['../fields/field.scss'],
  imports: [
    ElementListComponent,
    TranslocoDirective,
    ConstraintNameDropdownFieldComponent,
    BaseInputComponent,
    EncodingInputFieldComponent,
    IntegerInputFieldComponent,
    ScaleInputFieldComponent,
    LanguageCodeInputFieldComponent,
    MinLengthInputFieldComponent,
    MaxLengthInputFieldComponent,
    LocaleCodeInputFieldComponent,
    MinValueInputFieldComponent,
    MaxValueInputFieldComponent,
    UpperBoundInputFieldComponent,
    LowerBoundInputFieldComponent,
    RegularExpressionValueInputFieldComponent,
    MatSlideToggle,
    MatIcon,
  ],
})
export class ConstraintComponent implements OnDestroy, AfterViewInit {
  readonly signalForm = input(new EditorSignalFormContext<EditorFormModel>({changedMetaModel: null}));

  private changeDetector = inject(ChangeDetectorRef);
  private loadedFilesService = inject(LoadedFilesService);

  public metaModelDialogService = inject(EditorModelService);

  public selectedConstraint = signal<string>(undefined);
  public previousData = signal<PreviousFormDataSnapshot>({});
  public element = toSignal(this.metaModelDialogService.getMetaModelElement());

  public isAnonymous = signal(false);
  public canBeAnonymous = computed(() => {
    const el = this.element();
    return Boolean(el && !el.isPredefined && !this.loadedFilesService.isElementExtern(el) && el.parents && el.parents.length > 0);
  });

  constructor() {
    effect(() => {
      const el = this.element();
      if (el) {
        this.isAnonymous.set(Boolean(el.isAnonymous?.()));
      }
    });
  }

  ngAfterViewInit(): void {
    this.changeDetector.detectChanges();
  }

  ngOnDestroy() {
    this.previousData.set({});
  }

  onAnonymousToggleChange(checked: boolean) {
    this.isAnonymous.set(checked);
    const elem = this.element();
    if (elem) {
      elem.anonymous = checked;
      const typeName = elem.className ? elem.className.replace('Default', '') : 'Constraint';
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
    this.changeDetector.detectChanges();
  }

  onClassChange(constraint: string) {
    this.selectedConstraint.set(constraint);
    if (this.isAnonymous()) {
      const elem = this.element();
      if (elem) {
        const typeName = constraint || (elem.className ? elem.className.replace('Default', '') : 'Constraint');
        elem.name = `[${typeName}]`;
        this.signalForm().set('name', `[${typeName}]`);
        this.signalForm().set('isAnonymous', true);
      }
    }
    this.changeDetector.detectChanges();
  }
}
