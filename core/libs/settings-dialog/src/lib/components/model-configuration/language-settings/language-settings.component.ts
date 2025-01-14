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
import {LanguageTranslationService} from '@ame/translation';
import {Component, OnInit} from '@angular/core';
import {AbstractControl, FormArray, FormGroup} from '@angular/forms';
import * as locale from 'locale-codes';
import {Observable, map, startWith} from 'rxjs';
import {Langcode} from '../../../model';
import {SettingsFormService} from '../../../services';

@Component({
  selector: 'ame-language-settings',
  templateUrl: './language-settings.component.html',
  styleUrls: ['./language-settings.component.scss'],
})
export class LanguageSettingsComponent implements OnInit {
  form: FormGroup;
  filteredOptions: Observable<Langcode[]>[] = [];

  constructor(
    private translate: LanguageTranslationService,
    private formService: SettingsFormService,
  ) {}

  ngOnInit(): void {
    this.form = this.formService.getForm().get('languageConfiguration') as FormGroup;
    this.initializeFilteredOptions();
  }

  get aspectModelFormArray(): FormArray {
    return this.form.get('aspectModel') as FormArray;
  }

  get supportedLanguages(): {code: string; language: string}[] {
    return this.translate.supportedLanguages;
  }

  getLanguageFormGroup(index: number): FormGroup {
    return this.aspectModelFormArray.controls[index] as FormGroup;
  }

  addLanguage(): void {
    this.formService.addNewLanguage();
    this.initializeFilteredOptions();
    this.markLanguagesAsTouched();
  }

  private initializeFilteredOptions(): void {
    this.filteredOptions = this.aspectModelFormArray.controls.map(control => this.getFilteredOptionsObservable(control.get('language')));
  }

  private getFilteredOptionsObservable(control: AbstractControl): Observable<Langcode[]> {
    return control.valueChanges.pipe(
      startWith(''),
      map(value => this.filterOptions(this.getLanguageName(value))),
    );
  }

  filterOptions(value: string): Langcode[] {
    if (!value) {
      return [];
    }

    const filterValue = value.toLowerCase();

    return locale.all
      .filter(locale => this.isLocaleMatch(locale, filterValue))
      .map(locale => ({
        name: locale.name,
        tag: locale.tag,
      }));
  }

  private isLocaleMatch(locale: locale.ILocale, filterValue: string): boolean {
    return locale.tag.toLowerCase().includes(filterValue) || locale.name.toLowerCase().includes(filterValue);
  }

  private getLanguageName(value: string | Langcode): string {
    return typeof value === 'object' ? value.name : value;
  }

  displayLanguageWithTag(languageTag: Langcode): string {
    if (!languageTag) {
      return '';
    }

    const language = locale.all.find((locale: locale.ILocale): boolean => locale.tag === languageTag.tag);
    return language ? `${language.local ? language.local : language.name} (${language.tag})` : '';
  }

  removeLanguage(index: number): void {
    this.formService.addLanguageToBeRemove(this.aspectModelFormArray.at(index).value.language.tag);
    this.aspectModelFormArray.removeAt(index);
    this.filteredOptions.splice(index, 1);
  }

  private markLanguagesAsTouched(): void {
    this.aspectModelFormArray.controls.forEach(control => control.get('language').markAsTouched());
  }
}
