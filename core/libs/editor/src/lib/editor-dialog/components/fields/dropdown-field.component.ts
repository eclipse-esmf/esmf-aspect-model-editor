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
import {ModelService} from '@ame/rdf/services';
import {RdfModelUtil} from '@ame/rdf/utils';
import {SammLanguageSettingsService} from '@ame/settings-dialog';
import {Directive, EventEmitter, Input, OnDestroy, Output} from '@angular/core';
import {FormGroup} from '@angular/forms';
import {DefaultCharacteristic, DefaultConstraint, NamedElement} from '@esmf/aspect-model-loader';
import {Subscription} from 'rxjs';
import {tap} from 'rxjs/operators';
import {EditorModelService} from '../../editor-model.service';
import {PreviousFormDataSnapshot} from '../../interfaces';

@Directive()
export abstract class DropdownFieldComponent<T extends DefaultCharacteristic | DefaultConstraint> implements OnDestroy {
  @Input() parentForm: FormGroup;
  @Input() previousDataSnapshot: PreviousFormDataSnapshot = {};

  public metaModelElement: T;
  public subscription: Subscription = new Subscription();
  public selectedMetaModelElement: T;
  public metaModelClassName: string;
  public get originalCharacteristic(): NamedElement {
    return this.editorModelService.originalMetaModel;
  }

  protected _previousData: PreviousFormDataSnapshot = {};

  @Output() previousData = new EventEmitter<PreviousFormDataSnapshot>();

  protected constructor(
    public editorModelService: EditorModelService,
    public modelService: ModelService,
    public languageSettings: SammLanguageSettingsService,
    public loadedFilesService: LoadedFilesService,
  ) {}

  protected setPreviousData() {
    if (this.metaModelElement instanceof DefaultCharacteristic && this.metaModelElement.isPredefined) {
      return;
    }

    this._previousData = {
      ...this.previousDataSnapshot,
      ...this._previousData,
      ...(this.parentForm.value || {}),
      value: {
        ...(this.previousDataSnapshot.value || {}),
        ...(this._previousData.value || {}),
        [this.metaModelElement.className]: this.parentForm.value?.value || '',
      },
      minValue: {
        ...(this.previousDataSnapshot.minValue || {}),
        ...(this._previousData.minValue || {}),
        [this.metaModelElement.className]: this.parentForm.value?.minValue || '',
      },
      maxValue: {
        ...(this.previousDataSnapshot.maxValue || {}),
        ...(this._previousData.maxValue || {}),
        [this.metaModelElement.className]: this.parentForm.value?.maxValue || '',
      },
    };

    this.previousData.emit(this._previousData);
  }

  public getMetaModelData() {
    return this.editorModelService.getMetaModelElement().pipe(
      tap(metaModelElement => {
        this.metaModelElement = <T>metaModelElement;
      }),
    );
  }

  public setMetaModelClassName(): void {
    if (
      RdfModelUtil.isCharacteristicInstance(
        this.selectedMetaModelElement.aspectModelUrn,
        this.loadedFilesService.currentLoadedFile.rdfModel.sammC,
      )
    ) {
      this.metaModelClassName = this.selectedMetaModelElement.aspectModelUrn.split('#')[1].replace('Default', '');
    } else {
      this.metaModelClassName = this.selectedMetaModelElement.className.replace('Default', '');
    }
  }

  public addLanguageSettings(metaModelElement: T) {
    if (this.languageSettings.getSammLanguageCodes()) {
      this.languageSettings.getSammLanguageCodes().forEach(languageCode => {
        if (!metaModelElement.getPreferredName(languageCode) && !metaModelElement.getDescription(languageCode)) {
          metaModelElement.preferredNames.set(languageCode, '');
          metaModelElement.descriptions.set(languageCode, '');
        }
      });
    }
  }

  public updateFields(modelElement: T) {
    this.metaModelElement.metaModelVersion = this.loadedFilesService.currentLoadedFile.rdfModel.getMetaModelVersion();
    this.editorModelService.updateMetaModelElement(this.metaModelElement);
    this.parentForm.get('changedMetaModel').setValue(modelElement);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
