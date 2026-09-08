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
import {ModelService} from '@ame/rdf/services';
import {SammLanguageSettingsService} from '@ame/settings-dialog';
import {Directive, inject, input, output} from '@angular/core';
import {DefaultCharacteristic, DefaultConstraint, NamedElement} from '@esmf/aspect-model-loader';
import {filter, tap} from 'rxjs/operators';
import {EditorModelService} from '../../editor-model.service';
import {EditorSignalFormContext} from '../../forms/editor-signal-form-context';
import {PreviousFormDataSnapshot} from '../../interfaces';

@Directive()
export abstract class DropdownFieldComponent<T extends DefaultCharacteristic | DefaultConstraint> {
  readonly signalForm = input.required<EditorSignalFormContext>();
  readonly previousDataSnapshot = input<PreviousFormDataSnapshot>({});

  public editorModelService = inject(EditorModelService);
  public modelService = inject(ModelService);
  public languageSettings = inject(SammLanguageSettingsService);
  public loadedFilesService = inject(LoadedFilesService);

  public metaModelElement: T;
  public selectedMetaModelElement: T;
  public metaModelClassName: string;
  public get originalCharacteristic(): NamedElement {
    return this.editorModelService.originalMetaModel;
  }

  protected _previousData: PreviousFormDataSnapshot = {};

  readonly previousData = output<PreviousFormDataSnapshot>();

  protected setPreviousData() {
    if (this.metaModelElement instanceof DefaultCharacteristic && this.metaModelElement.isPredefined) {
      return;
    }

    const formValue = this.signalForm().value();
    this._previousData = {
      ...this.previousDataSnapshot(),
      ...this._previousData,
      ...formValue,
      value: {
        ...(this.previousDataSnapshot().value || {}),
        ...(this._previousData.value || {}),
        [this.metaModelElement.className]: formValue.value || '',
      },
      minValue: {
        ...(this.previousDataSnapshot().minValue || {}),
        ...(this._previousData.minValue || {}),
        [this.metaModelElement.className]: formValue.minValue || '',
      },
      maxValue: {
        ...(this.previousDataSnapshot().maxValue || {}),
        ...(this._previousData.maxValue || {}),
        [this.metaModelElement.className]: formValue.maxValue || '',
      },
    };

    this.previousData.emit(this._previousData);
  }

  public getMetaModelData() {
    return this.editorModelService.getMetaModelElement().pipe(
      filter((metaModelElement): metaModelElement is T => Boolean(metaModelElement)),
      tap(metaModelElement => {
        this.metaModelElement = <T>metaModelElement;
      }),
    );
  }

  public setMetaModelClassName(): void {
    if (!this.selectedMetaModelElement) {
      this.metaModelClassName = '';
      return;
    }

    if ((this.selectedMetaModelElement as DefaultCharacteristic).isPredefined) {
      this.metaModelClassName =
        this.selectedMetaModelElement.name || this.selectedMetaModelElement.aspectModelUrn?.split('#')?.[1]?.replace('Default', '') || '';
    } else {
      this.metaModelClassName = this.selectedMetaModelElement.className?.replace('Default', '') || '';
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
    this.signalForm().set('changedMetaModel', modelElement);
  }
}
