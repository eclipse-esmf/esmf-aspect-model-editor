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
import {AfterViewInit, Component, OnInit} from '@angular/core';
import {MatDialogRef} from '@angular/material/dialog';
import {FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';
import * as locale from 'locale-codes';
import {Observable, of} from 'rxjs';
import {ShapeLanguageRemover, MxGraphAttributeService, MxGraphService, MxGraphShapeSelectorService} from '@ame/mx-graph';
import {LanguageSettingsService} from '../../services';
import {AlertService, LoadingScreenService, LogService} from '@ame/shared';
import {ModelService} from '@ame/rdf/services';

@Component({
  selector: 'ame-language-settings',
  templateUrl: './language-settings.component.html',
  styleUrls: ['./language-settings.component.scss'],
})
export class LanguageSettingsComponent implements OnInit, AfterViewInit {
  allLanguage: Array<locale.ILocale>;
  filteredLanguageList: Observable<locale.ILocale[]>;
  form: FormGroup;
  languageList: FormArray;
  deletedLanguages: Array<any> = [];

  constructor(
    private dialogRef: MatDialogRef<LanguageSettingsComponent>,
    private fb: FormBuilder,
    private alertService: AlertService,
    private logService: LogService,
    private modelService: ModelService,
    private mxGraphService: MxGraphService,
    private languageSettingsService: LanguageSettingsService,
    private mxGraphAttributeService: MxGraphAttributeService,
    private mxGraphShapeSelectorService: MxGraphShapeSelectorService,
    private loadingScreen: LoadingScreenService
  ) {}

  ngOnInit() {
    this.form = new FormGroup({
      languages: new FormArray([]),
    });
    this.languageList = this.form.get('languages') as FormArray;
    this.languageSettingsService.getLanguageCodes().forEach(languageCode => {
      this.languageList.push(this.createLanguage(locale.getByTag(languageCode).tag, true));
    });
    // Create an additional empty input field
    if (this.languageSettingsService.getLanguageCodes().length <= 0) {
      this.addLanguage();
    }
  }

  ngAfterViewInit() {
    this.allLanguage = locale.all;
  }

  getLanguageFormGroup() {
    return this.form.get('languages') as FormArray;
  }

  private createLanguage(language: string = null, restored: boolean = false): FormGroup {
    return this.fb.group({
      languageCode: [language, Validators.compose([Validators.required])],
      restored: restored,
    });
  }

  addLanguage() {
    this.languageList.push(this.createLanguage());
  }

  deleteLanguage(index: number) {
    if (this.languageList.controls[index].value.languageCode) {
      this.deletedLanguages.push(this.languageList.controls[index].value);
    }
    this.languageList.removeAt(index);
  }

  displayLanguageWithTag(languageTag: string) {
    if (languageTag) {
      const language = locale.all.find((localeSelect: locale.ILocale) => localeSelect.tag === languageTag);
      if (language && language.local) {
        return `${language.local} (${language.tag})`;
      } else {
        return `${language.name} (${language.tag})`;
      }
    }

    return '';
  }

  getLanguagesFormGroup(index: number): FormGroup {
    return this.languageList.controls[index] as FormGroup;
  }

  onSubmit() {
    const selectedLanguages = this.form.value.languages.map(languageCode => languageCode.languageCode);
    this.deletedLanguages = this.deletedLanguages.filter(entry => !selectedLanguages.includes(entry.languageCode));
    const deletedRestoredLanguages = this.deletedLanguages.filter(entry => entry.restored);
    if (deletedRestoredLanguages.length > 0) {
      this.openConfirmBox();
    } else {
      this.submitAndCloseDialog();
    }
  }

  submitAndCloseDialog() {
    if (this.modelService.getLoadedAspectModel().aspect !== null) {
      this.dialogRef.close();
      const loadingScreen = this.loadingScreen.open({
        title: 'Saving changes',
        content: 'Changing the languages in application',
      });

      try {
        this.mxGraphService.updateGraph(() => {
          new ShapeLanguageRemover(
            this.deletedLanguages.map(entry => entry.languageCode),
            this.mxGraphService,
            this.mxGraphShapeSelectorService,
            this.logService,
            this.mxGraphAttributeService
          ).removeUnnecessaryLanguages();
        });
      } finally {
        loadingScreen.close();
      }
    }
    this.languageSettingsService.setLanguageCodes(this.form.value.languages.map(languageCode => languageCode.languageCode));
  }

  doFilterLanguage(value: string) {
    const addedLanguages: Array<string> = this.form.value.languages.map(languageCode => languageCode.languageCode);
    this.filteredLanguageList = value
      ? of(
          this.allLanguage.filter(
            (unit: locale.ILocale) =>
              !addedLanguages.includes(unit.tag) &&
              (unit.tag.toLowerCase().includes(value.toLowerCase()) || unit.name.toLowerCase().includes(value.toLowerCase()))
          )
        )
      : null;
  }

  onClose(): void {
    this.dialogRef.close();
  }

  openConfirmBox() {
    this.alertService.open({
      data: {
        title: 'Deleting all language related information',
        content: `Click 'Continue' to remove the language${this.deletedLanguages.length > 1 ? 's' : ''} "${this.deletedLanguages
          .map(entry => `${locale.getByTag(entry.languageCode).name} (${locale.getByTag(entry.languageCode).tag})`) //NOSONAR
          .join(', ')}" from the settings and delete all preferredNames and descriptions in ${
          this.deletedLanguages.length > 1 ? 'these languages' : 'this language'
        }.`,
        rightButtonText: 'Continue',
        leftButtonText: 'Cancel',
        rightButtonAction: () => {
          this.submitAndCloseDialog();
        },
        hasLeftButton: true,
        hasRightButton: true,
      },
    });
  }
}
