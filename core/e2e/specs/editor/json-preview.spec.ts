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

import {expect, Page, test} from '@playwright/test';
import {AppHelper} from '../../support/app-helper';
import {TauriHelper} from '../../support/tauri-helper';

/**
 * JSON payload and JSON Schema previews: a large editing area, no upfront language dialog for the JSON Schema,
 * a language switch inside the preview for multilingual models and copying via the shared clipboard service.
 */

const PREFIXES = `@prefix samm: <urn:samm:org.eclipse.esmf.samm:meta-model:2.2.0#> .
@prefix samm-c: <urn:samm:org.eclipse.esmf.samm:characteristic:2.2.0#> .
@prefix : <urn:samm:org.eclipse.examples.aspect:1.0.0#> .
`;

function modelWithLanguages(...languages: string[]): string {
  const names = languages.map(lang => `"Aspect ${lang}"@${lang}`).join(', ');
  return `${PREFIXES}
:AspectDefault a samm:Aspect ;
    samm:preferredName ${names} ;
    samm:properties ( :property1 ) ;
    samm:operations () .

:property1 a samm:Property ;
    samm:characteristic samm-c:Text .`;
}

/** A schema long enough to need many lines; its description echoes the requested language. */
function schemaFor(language: string | null): string {
  const properties = Object.fromEntries(Array.from({length: 40}, (_, i) => [`p${i}`, {type: 'string'}]));
  return JSON.stringify({type: 'object', description: `lang=${language}`, properties});
}

async function mockJsonSchema(page: Page, delayMs = 0): Promise<string[]> {
  const requested: string[] = [];
  await page.route('**/ame/api/generate/json-schema**', async route => {
    const language = new URL(route.request().url()).searchParams.get('language');
    requested.push(language);
    if (delayMs) await new Promise(resolve => setTimeout(resolve, delayMs));
    await route.fulfill({status: 200, contentType: 'application/json', body: schemaFor(language)});
  });
  return requested;
}

const preview = (page: Page, name: RegExp) => page.getByRole('dialog', {name});
const content = (page: Page) => page.getByTestId('dialogContent');

test.describe('JSON previews', () => {
  let app: AppHelper;
  let tauri: TauriHelper;

  test.beforeEach(async ({page}) => {
    await page.setViewportSize({width: 1440, height: 900});
    app = new AppHelper(page);
    tauri = new TauriHelper(page);
    await tauri.initTauriMock();
    await app.startModelling();
  });

  test.describe('size', () => {
    for (const [name, signal, title] of [
      ['JSON payload', 'GENERATE_JSON_PAYLOAD', /JSON Payload preview|Sample JSON/i],
      ['JSON Schema', 'GENERATE_JSON_SCHEMA', /JSON Schema preview/i],
    ] as const) {
      test(`${name} preview uses most of the window and its text area fills the dialog`, async ({page}) => {
        await mockJsonSchema(page);
        await page.route('**/ame/api/generate/json-sample**', route =>
          route.fulfill({status: 200, contentType: 'application/json', body: schemaFor('sample')}),
        );

        await tauri.emitSignal(signal);
        const dialog = preview(page, title);
        await expect(dialog).toBeVisible();

        await expect.poll(async () => (await dialog.boundingBox()).height).toBeGreaterThan(900 * 0.75);
        const [dialogBox, textBox] = await Promise.all([dialog.boundingBox(), content(page).boundingBox()]);
        expect(textBox.height).toBeGreaterThan(dialogBox.height * 0.55);

        // At least 20 lines are visible without scrolling.
        const visibleLines = await content(page).evaluate(el => {
          const lineHeight = parseFloat(getComputedStyle(el).lineHeight);
          return el.clientHeight / lineHeight;
        });
        expect(visibleLines).toBeGreaterThan(20);
        await expect(content(page)).toHaveCSS('font-family', /mono|Menlo|Consolas/i);
      });
    }

    test('the preview fits into a small window and keeps its buttons reachable', async ({page}) => {
      await mockJsonSchema(page);
      await page.setViewportSize({width: 900, height: 560});

      await tauri.emitSignal('GENERATE_JSON_SCHEMA');
      const dialog = preview(page, /JSON Schema preview/i);
      await expect(dialog).toBeVisible();

      const box = await dialog.boundingBox();
      expect(box.y).toBeGreaterThanOrEqual(0);
      expect(box.y + box.height).toBeLessThanOrEqual(560);
      await expect(page.getByTestId('downloadFileButton')).toBeInViewport();
      await expect(page.getByTestId('previewCopyButton')).toBeInViewport();
    });
  });

  test.describe('JSON Schema language', () => {
    test('generates directly in English without a language dialog', async ({page}) => {
      const requested = await mockJsonSchema(page);
      await app.loadModel(modelWithLanguages('en', 'de'));

      await tauri.emitSignal('GENERATE_JSON_SCHEMA');
      await expect(preview(page, /JSON Schema preview/i)).toBeVisible();

      await expect(page.getByTestId('language-selector')).toHaveCount(0);
      await expect(page.locator('mat-dialog-container')).toHaveCount(1);
      expect(requested).toEqual(['en']);
      await expect(content(page)).toHaveValue(/"lang=en"/);
    });

    test('switching the language inside the preview regenerates the schema', async ({page}) => {
      const requested = await mockJsonSchema(page, 400);
      await app.loadModel(modelWithLanguages('en', 'de'));

      await tauri.emitSignal('GENERATE_JSON_SCHEMA');
      const select = page.getByTestId('previewLanguageSelect');
      await expect(select).toContainText('(en)');

      await select.click();
      await expect(page.getByTestId('previewLanguage-en')).toBeVisible();
      await page.getByTestId('previewLanguage-de').click();

      await expect(page.getByTestId('previewRegenerating')).toBeVisible();
      await expect(content(page)).toHaveJSProperty('readOnly', true);
      await expect(content(page)).toHaveValue(/"lang=de"/);
      await expect(page.getByTestId('previewRegenerating')).toHaveCount(0);
      await expect(content(page)).toHaveJSProperty('readOnly', false);
      await expect(select).toContainText('(de)');
      expect(requested).toEqual(['en', 'de']);
      await expect(page.locator('mat-dialog-container')).toHaveCount(1);
    });

    test('shows no language switch for a model with a single language', async ({page}) => {
      const requested = await mockJsonSchema(page);
      await app.loadModel(modelWithLanguages('en'));

      await tauri.emitSignal('GENERATE_JSON_SCHEMA');
      await expect(preview(page, /JSON Schema preview/i)).toBeVisible();

      await expect(page.getByTestId('previewLanguageSelect')).toHaveCount(0);
      expect(requested).toEqual(['en']);
    });

    test('a failing generation shows an error and opens no preview', async ({page}) => {
      await page.route('**/ame/api/generate/json-schema**', route => route.fulfill({status: 500, body: 'error'}));

      await tauri.emitSignal('GENERATE_JSON_SCHEMA');

      await expect(page.locator('mat-dialog-container')).toHaveCount(0);
      await expect(page.locator('ame-loading-screen')).toHaveCount(0);
    });
  });

  test.describe('actions', () => {
    test('copy uses the desktop clipboard and confirms it', async ({page}) => {
      await mockJsonSchema(page);
      await tauri.emitSignal('GENERATE_JSON_SCHEMA');
      await expect(content(page)).toHaveValue(/"lang=en"/);
      await tauri.clearSentEvents();

      await page.getByTestId('previewCopyButton').click();

      await expect.poll(async () => (await tauri.getSentEvents('copyToClipboard')).length).toBe(1);
      const [event] = await tauri.getSentEvents('copyToClipboard');
      expect(event.args[0]).toContain('"lang=en"');
      await expect(page.getByText(/copied/i).first()).toBeVisible();
    });

    test('reset restores the generated content after editing', async ({page}) => {
      await mockJsonSchema(page);
      await tauri.emitSignal('GENERATE_JSON_SCHEMA');
      await expect(content(page)).toHaveValue(/"lang=en"/);

      await content(page).fill('changed');
      await expect(content(page)).toHaveValue('changed');
      await page.getByTestId('previewResetButton').click();

      await expect(content(page)).toHaveValue(/"lang=en"/);
    });
  });
});
