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

import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {describe, expect, it} from 'vitest';

const I18N_DIR = resolve(__dirname, '../../../../../apps/ame/src/assets/i18n');
const LANGUAGES = ['en', 'de', 'zh'] as const;

type Translations = Record<string, unknown>;

function load(language: string): {raw: string; json: Translations} {
  const raw = readFileSync(resolve(I18N_DIR, `${language}.json`), 'utf-8');
  return {raw, json: JSON.parse(raw)};
}

function lookup(json: Translations, key: string): unknown {
  return key.split('.').reduce<unknown>((node, part) => (node as Translations | undefined)?.[part], json);
}

/** Keys introduced for the toolbar property filter, the settings menu item and the Element Library naming. */
const NEW_KEYS = [
  'menu.file.settings',
  'toolbar.propertyFilterActivate',
  'toolbar.propertyFilterDeactivate',
  'declareNameDialog.title',
  'declareNameDialog.infoContent',
  'confirmDialog.createAspect.aspectCreationWarning',
  // dialog (x) button, see chip copy, element list header
  'dialog.close',
  'editorCanvas.shapeSetting.field.seeInput.copy',
  'editorCanvas.shapeSetting.field.seeInput.remove',
  'editorCanvas.shapeSetting.field.seeInput.copied',
  'sidebar.elementList.title',
  'sidebar.elementList.close',
  // settings dialog UX
  'settingsDialog.search.placeholder',
  'settingsDialog.search.clear',
  'settingsDialog.search.noResults',
  'settingsDialog.scope.application',
  'settingsDialog.scope.applicationHint',
  'settingsDialog.scope.model',
  'settingsDialog.scope.noModel',
  'settingsDialog.scope.modelHint',
  'settingsDialog.description.automatedWorkflow',
  'settingsDialog.description.editor',
  'settingsDialog.description.languages',
  'settingsDialog.description.namespaces',
  'settingsDialog.description.copyright',
  'settingsDialog.resetSection',
  'settingsDialog.requiresModel',
  'settingsDialog.sectionHasErrors',
  'settingsDialog.errorsIn',
  'settingsDialog.noChanges',
  'settingsDialog.unsavedChanges.badge',
  'settingsDialog.unsavedChanges.title',
  'settingsDialog.unsavedChanges.content',
  'settingsDialog.unsavedChanges.keepEditing',
  'settingsDialog.unsavedChanges.discard',
];

/** Keys whose translation must keep a Transloco parameter. */
const PARAMETERIZED_KEYS: Record<string, string> = {
  'settingsDialog.scope.model': '{{file}}',
  'settingsDialog.errorsIn': '{{section}}',
};

describe('i18n files', () => {
  for (const language of LANGUAGES) {
    describe(language, () => {
      const {raw, json} = load(language);

      it.each(NEW_KEYS)('translates %s', key => {
        const value = lookup(json, key);
        expect(typeof value).toBe('string');
        expect((value as string).trim().length).toBeGreaterThan(0);
      });

      it.each(Object.entries(PARAMETERIZED_KEYS))('keeps the parameter of %s', (key, parameter) => {
        expect(lookup(json, key)).toContain(parameter);
      });

      it('no longer uses the former "Shared Model" wording', () => {
        expect(raw).not.toMatch(/shared\s*model/i);
      });

      it('uses distinct texts for activating and removing the property filter', () => {
        expect(lookup(json, 'toolbar.propertyFilterActivate')).not.toBe(lookup(json, 'toolbar.propertyFilterDeactivate'));
      });
    });
  }

  it('names the Element Library consistently in English', () => {
    const {json} = load('en');
    expect(lookup(json, 'declareNameDialog.title')).toContain('Element Library');
    expect(lookup(json, 'declareNameDialog.infoContent')).toContain('Element Library');
    expect(lookup(json, 'confirmDialog.createAspect.aspectCreationWarning')).toContain('Element Library');
  });

  it('names the Element Library consistently in German', () => {
    const {json} = load('de');
    expect(lookup(json, 'declareNameDialog.title')).toContain('Elementbibliothek');
    expect(lookup(json, 'declareNameDialog.infoContent')).toContain('Elementbibliothek');
    expect(lookup(json, 'confirmDialog.createAspect.aspectCreationWarning')).toContain('Elementbibliothek');
  });
});
