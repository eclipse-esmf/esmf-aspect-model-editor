/*
 *  Copyright (c) 2020 Robert Bosch Manufacturing Solutions GmbH, Germany. All rights reserved.
 */
import {AfterViewInit, Component, OnInit} from '@angular/core';
import {MatDialogRef} from '@angular/material/dialog';
import {FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {AlertService, AlertType, BciLoaderService, PrimaryButton} from '@bci-web-core/core';
import * as locale from 'locale-codes';
import {Observable, of} from 'rxjs';
import {DeleteLanguageInformationVisitor, MxGraphAttributeService, MxGraphService, MxGraphShapeSelectorService} from '@bame/mx-graph';
import {LanguageSettingsService} from '../../services';
import {LogService} from '@bame/shared';
import {ModelService} from '@bame/rdf/services';

@Component({
  selector: 'bci-language-settings',
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
    private loaderService: BciLoaderService,
    private logService: LogService,
    private modelService: ModelService,
    private mxGraphService: MxGraphService,
    private languageSettingsService: LanguageSettingsService,
    private mxGraphAttributeService: MxGraphAttributeService,
    private mxGraphShapeSelectorService: MxGraphShapeSelectorService
  ) {}

  ngOnInit() {
    this.form = this.fb.group({
      languages: this.fb.array([]),
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

  deleteLanguage(index) {
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

  getLanguagesFormGroup(index): FormGroup {
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
      const loaderRef = this.loaderService.showProgressBar();
      try {
        this.mxGraphService.updateGraph(() => {
          new DeleteLanguageInformationVisitor(
            this.deletedLanguages.map(entry => entry.languageCode),
            this.mxGraphService,
            this.mxGraphShapeSelectorService,
            this.logService,
            this.mxGraphAttributeService
          ).visit();
        });
      } finally {
        this.loaderService.hideProgressBar(loaderRef);
      }
    }
    this.languageSettingsService.setLanguageCodes(this.form.value.languages.map(languageCode => languageCode.languageCode));
    this.dialogRef.close();
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
    const ref = this.alertService.openAlertBox({
      type: AlertType.Warning,
      title: 'Deleting all language related information',
      description: `Click 'Continue' to remove the language${this.deletedLanguages.length > 1 ? 's' : ''} "${this.deletedLanguages
        .map(entry => `${locale.getByTag(entry.languageCode).name} (${locale.getByTag(entry.languageCode).tag})`) //NOSONAR
        .join(', ')}" from the settings and delete all preferredNames and descriptions in ${
        this.deletedLanguages.length > 1 ? 'these languages' : 'this language'
      }.`,
      leftButtonTitle: 'Continue',
      rightButtonTitle: 'Cancel',
      primaryButton: PrimaryButton.RightButton,
    });
    ref.afterClosed().subscribe(res => {
      if (res === 'left') {
        this.submitAndCloseDialog();
      }
    });
  }
}
