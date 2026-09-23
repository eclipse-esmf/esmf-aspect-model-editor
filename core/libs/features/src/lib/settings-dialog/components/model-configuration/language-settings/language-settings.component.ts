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
import {LanguageTranslationService} from '@ame/translation';
import {Component, inject} from '@angular/core';
import {FormField} from '@angular/forms/signals';
import {MatAutocomplete, MatAutocompleteSelectedEvent, MatAutocompleteTrigger} from '@angular/material/autocomplete';
import {MatButton, MatIconButton} from '@angular/material/button';
import {MatDivider} from '@angular/material/divider';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatInput, MatLabel} from '@angular/material/input';
import {MatOption, MatSelect} from '@angular/material/select';
import {TranslocoDirective} from '@jsverse/transloco';
import * as locale from 'locale-codes';
import {AspectModelLanguageEntry, Langcode} from '../../../model';
import {SettingsFormService} from '../../../services';

@Component({
  selector: 'ame-language-settings',
  templateUrl: './language-settings.component.html',
  styleUrls: ['./language-settings.component.scss'],
  imports: [
    FormField,
    MatFormFieldModule,
    MatLabel,
    MatSelect,
    MatOption,
    MatDivider,
    MatAutocompleteTrigger,
    MatInput,
    MatAutocomplete,
    MatIconModule,
    MatIconButton,
    MatButton,
    TranslocoDirective,
  ],
})
export class LanguageSettingsComponent {
  private readonly translate = inject(LanguageTranslationService);
  protected readonly formService = inject(SettingsFormService);

  readonly form = this.formService.settingsForm;

  get aspectModelLanguages(): AspectModelLanguageEntry[] {
    return this.formService.settingsModel().languageConfiguration.aspectModel;
  }

  get supportedLanguages(): {code: string; language: string}[] {
    return this.translate.supportedLanguages;
  }

  addLanguage(): void {
    this.formService.addNewLanguage();
  }

  filterOptions(value: string | Langcode | null): Langcode[] {
    const query = typeof value === 'object' && value ? value.name : String(value || '');
    if (!query) {
      return [];
    }

    const filterValue = query.toLowerCase();
    return locale.all
      .filter((loc: locale.ILocale) => loc.tag.toLowerCase().includes(filterValue) || loc.name.toLowerCase().includes(filterValue))
      .map((loc: locale.ILocale) => ({
        name: loc.name,
        tag: loc.tag,
      }));
  }

  displayLanguageWithTag = (languageTag: Langcode | string | null): string => {
    if (!languageTag) {
      return '';
    }
    const tag = typeof languageTag === 'object' ? languageTag.tag : languageTag;
    const language = locale.all.find((loc: locale.ILocale): boolean => loc.tag === tag);
    return language
      ? `${language.local ? language.local : language.name} (${language.tag})`
      : typeof languageTag === 'object'
        ? `${languageTag.name} (${languageTag.tag})`
        : tag;
  };

  onLanguageInput(index: number, event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.value;
    this.formService.settingsModel.update(model => {
      const aspectModel = [...model.languageConfiguration.aspectModel];
      aspectModel[index] = {language: value};
      return {
        ...model,
        languageConfiguration: {
          ...model.languageConfiguration,
          aspectModel,
        },
      };
    });
  }

  onOptionSelected(index: number, event: MatAutocompleteSelectedEvent): void {
    const lang = event.option.value as Langcode;
    this.formService.settingsModel.update(model => {
      const aspectModel = [...model.languageConfiguration.aspectModel];
      aspectModel[index] = {language: lang};
      return {
        ...model,
        languageConfiguration: {
          ...model.languageConfiguration,
          aspectModel,
        },
      };
    });
  }

  removeLanguage(index: number): void {
    this.formService.removeLanguage(index);
  }
}
