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

import {LoadedFilesService} from '@ame/cache';
import {SammLanguageSettingsService} from '@ame/settings-dialog';
import {ChangeDetectorRef, Component, EventEmitter, HostListener, Input, OnChanges, OnDestroy, OnInit, Output} from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import {DefaultCharacteristic, DefaultConstraint, NamedElement, Unit} from '@esmf/aspect-model-loader';
import {Subscription} from 'rxjs';
import {EditorModelService} from '../../editor-model.service';

@Component({
  selector: 'ame-shape-settings',
  templateUrl: './shape-settings.component.html',
  styleUrls: ['./shape-settings.component.scss'],
})
export class ShapeSettingsComponent implements OnInit, OnChanges, OnDestroy {
  public metaModelClassName: string;
  public metaModelElement: NamedElement;
  public selectedMetaModelElement: NamedElement;
  public tmpCharacteristic: DefaultCharacteristic | DefaultConstraint;
  public units: Unit[] = [];
  public formGroup: FormGroup = new FormGroup({
    changedMetaModel: new FormControl(null),
  });

  private subscription = new Subscription();

  @Input() isOpened = false;
  @Input() modelElement: NamedElement = null;

  @Output() save = new EventEmitter<FormGroup>();
  @Output() afterClose = new EventEmitter();

  @HostListener('window:keydown.control.enter')
  saveOnKeyControlEnterEvent() {
    if (this.isOpened) {
      this.onSave();
    }
  }

  constructor(
    public metaModelDialogService: EditorModelService,
    public loadedFilesService: LoadedFilesService,
    private languageSettings: SammLanguageSettingsService,
    private changeDetector: ChangeDetectorRef,
  ) {}

  ngOnChanges(): void {
    if (!this.modelElement) {
      return;
    }

    this.onEdit(this.modelElement);
  }

  ngOnInit() {
    const sub = this.metaModelDialogService.getMetaModelElement().subscribe(metaModelElement => {
      this.metaModelElement = metaModelElement;
      this.formGroup == new FormGroup({});
      this.changeDetector.detectChanges();
    });
    this.subscription.add(sub);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  onSave(): void {
    if (this.formGroup?.valid) {
      this.save.emit(this.formGroup.getRawValue());
      this.formGroup.reset();
      this.onClose();
    }
  }

  onClose(): void {
    this.formGroup.reset();
    this.afterClose.emit();
  }

  isOfType(types: string[]): boolean {
    return types.includes(this.metaModelElement.className);
  }

  onEdit(selectedModelElement: NamedElement) {
    if (selectedModelElement) {
      this.metaModelElement = selectedModelElement;
      this.selectedMetaModelElement = selectedModelElement;
      this.addLanguageSettings(selectedModelElement);
      this.metaModelDialogService.updateMetaModelElement(this.metaModelElement);
      if (this.metaModelElement instanceof DefaultCharacteristic || this.metaModelElement instanceof DefaultConstraint) {
        this.tmpCharacteristic = this.metaModelElement;
      }
    } else {
      console.warn('Selected element is null. The dialog will not shown.');
    }
  }

  addLanguageSettings(metaModelElement: NamedElement) {
    if (this.languageSettings.getSammLanguageCodes()) {
      this.languageSettings.getSammLanguageCodes().forEach(languageCode => {
        if (!metaModelElement.getPreferredName(languageCode) && !metaModelElement.getDescription(languageCode)) {
          metaModelElement.preferredNames.set(languageCode, '');
          metaModelElement.descriptions.set(languageCode, '');
        }
      });
    }
  }

  isCharacteristic(): boolean {
    return this.isOpened && this.metaModelElement instanceof DefaultCharacteristic;
  }

  isConstraint(): boolean {
    return this.metaModelElement instanceof DefaultConstraint;
  }
}
