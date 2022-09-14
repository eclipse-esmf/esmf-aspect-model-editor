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

import {ChangeDetectorRef, Component, EventEmitter, HostListener, Input, OnChanges, OnDestroy, OnInit, Output} from '@angular/core';
import {FormGroup} from '@angular/forms';
import {
  BaseMetaModelElement,
  Characteristic,
  DefaultAspect,
  DefaultCharacteristic,
  DefaultConstraint,
  DefaultEntity,
  DefaultEvent,
  DefaultOperation,
  DefaultProperty,
  DefaultTrait,
  DefaultUnit,
  Unit,
} from '@ame/meta-model';
import {EditorModelService} from '../../editor-model.service';
import {LanguageSettingsService} from '@ame/settings-dialog';
import {LogService} from '@ame/shared';
import {ModelService} from '@ame/rdf/services';
import {RdfModelUtil} from '@ame/rdf/utils';
import {Subscription} from 'rxjs';

@Component({
  selector: 'ame-shape-settings',
  templateUrl: './shape-settings.component.html',
  styleUrls: ['./shape-settings.component.scss'],
})
export class ShapeSettingsComponent implements OnInit, OnChanges, OnDestroy {
  public metaModelClassName: string;
  public metaModelElement: BaseMetaModelElement;
  public selectedMetaModelElement: BaseMetaModelElement;
  public listConstraintNames: string[];
  public listCharacteristics: Map<string, Function> = new Map();
  public tmpCharacteristic: Characteristic;
  public units: Unit[] = [];
  public formGroup: FormGroup = new FormGroup({});

  private subscription = new Subscription();

  @Input() isOpened = false;
  @Input() modelElement: BaseMetaModelElement = null;

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
    private modelService: ModelService,
    private loggerService: LogService,
    private languageSettings: LanguageSettingsService,
    private changeDetector: ChangeDetectorRef
  ) {}

  ngOnChanges(): void {
    if (!this.modelElement) {
      return;
    }

    this.onEdit(this.modelElement);
  }

  ngOnInit() {
    this.metaModelDialogService.getMetaModelElement().subscribe(metaModelElement => {
      this.metaModelElement = metaModelElement;
      this.changeDetector.detectChanges();
    });
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

  onEdit(selectedModelElement: BaseMetaModelElement) {
    if (selectedModelElement) {
      this.metaModelElement = selectedModelElement;
      this.selectedMetaModelElement = selectedModelElement;
      this.addLanguageSettings(selectedModelElement);
      this.metaModelDialogService._updateMetaModelElement(this.metaModelElement);
      if (this.metaModelElement instanceof DefaultCharacteristic || this.metaModelElement instanceof DefaultConstraint) {
        this.tmpCharacteristic = this.metaModelElement;
      }
      if (
        RdfModelUtil.isCharacteristicInstance(
          selectedModelElement.aspectModelUrn,
          this.modelService.getLoadedAspectModel().rdfModel.BAMMC()
        )
      ) {
        this.metaModelClassName = selectedModelElement.aspectModelUrn.split('#')[1].replace('Default', '');
      } else {
        this.metaModelClassName = selectedModelElement.className.replace('Default', '');
      }
    } else {
      this.loggerService.logWarn('Selected element is null. The dialog will not shown.');
    }
  }

  getTitle(): string {
    if (this.metaModelElement === undefined || this.metaModelElement === null) {
      return 'Edit';
    }
    let name = `${this.metaModelElement.getPreferredName('en') || this.metaModelElement.name}`;
    name = name.length > 150 ? `${name.substring(0, 100)}...` : name;
    return this.metaModelElement.isExternalReference() ? name : `Edit ${this.metaModelClassName} ${name}`;
  }

  addLanguageSettings(metaModelElement: BaseMetaModelElement) {
    if (this.languageSettings.getLanguageCodes()) {
      this.languageSettings.getLanguageCodes().forEach(languageCode => {
        if (!metaModelElement.getPreferredName(languageCode) && !metaModelElement.getDescription(languageCode)) {
          metaModelElement.addPreferredName(languageCode, '');
          metaModelElement.addDescription(languageCode, '');
        }
      });
    }
  }

  isAspect(): boolean {
    return this.isOpened && this.metaModelElement instanceof DefaultAspect;
  }

  isProperty(): boolean {
    return this.isOpened && this.metaModelElement instanceof DefaultProperty;
  }

  isOperation(): boolean {
    return this.isOpened && this.metaModelElement instanceof DefaultOperation;
  }

  isEntity(): boolean {
    return this.isOpened && this.metaModelElement instanceof DefaultEntity;
  }

  isUnit(): boolean {
    return this.isOpened && this.metaModelElement instanceof DefaultUnit;
  }

  isCharacteristic(): boolean {
    return this.isOpened && this.metaModelElement instanceof DefaultCharacteristic;
  }

  isTrait(): boolean {
    return this.isOpened && this.metaModelElement instanceof DefaultTrait;
  }

  isConstraint(): boolean {
    return this.metaModelElement instanceof DefaultConstraint;
  }

  isEvent(): boolean {
    return this.isOpened && this.metaModelElement instanceof DefaultEvent;
  }
}
