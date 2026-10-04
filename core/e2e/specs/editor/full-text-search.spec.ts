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

import {Page, expect, test} from '@playwright/test';
import {AppHelper} from '../../support/app-helper';
import {FIELD_name, SELECTOR_editorSaveButton, SELECTOR_searchInputField} from '../../support/constants';

const PREFIXES = `@prefix samm: <urn:samm:org.eclipse.esmf.samm:meta-model:2.2.0#> .
@prefix samm-c: <urn:samm:org.eclipse.esmf.samm:characteristic:2.2.0#> .
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .
@prefix : <urn:samm:org.eclipse.examples.search:1.0.0#> .
`;

const SEARCH_MODEL = `${PREFIXES}
:BatteryAspect a samm:Aspect ;
   samm:properties ( :capacityThresholdExhaustion :remainingEnergy :temperature :stateOfHealth ) ;
   samm:operations ( ) ;
   samm:events ( ) .

:capacityThresholdExhaustion a samm:Property ;
   samm:preferredName "Exhaustion limit"@en ;
   samm:description "Capacity threshold for exhaustion of the battery."@en ;
   samm:characteristic :Percentage .

:remainingEnergy a samm:Property ;
   samm:preferredName "Remaining capacity"@en ;
   samm:description "Energy which is still stored."@en ;
   samm:characteristic :Percentage .

:temperature a samm:Property ;
   samm:preferredName "Zelltemperatur"@de ;
   samm:description "Measured cell temperature."@en ;
   samm:description "Gemessene Temperatur der Zelle für die Größe der Lüftung."@de ;
   samm:characteristic :Percentage .

:stateOfHealth a samm:Property ;
   samm:description "Threshold based health indicator."@en ;
   samm:characteristic :Percentage .

:Percentage a samm:Characteristic ;
   samm:dataType xsd:float .
`;

function largeModel(count: number): string {
  const names = Array.from({length: count}, (_, i) => `measurementValue${i}`);
  const properties = names
    .map(
      (name, i) => `:${name} a samm:Property ;
   samm:preferredName "Measurement ${i}"@en ;
   samm:description "${i === count - 1 ? 'The very last needle in the haystack.' : `Generic measurement number ${i}.`}"@en ;
   samm:characteristic :Value .`,
    )
    .join('\n\n');
  return `${PREFIXES}
:LargeAspect a samm:Aspect ;
   samm:properties ( ${names.map(name => `:${name}`).join(' ')} ) ;
   samm:operations ( ) ;
   samm:events ( ) .

${properties}

:Value a samm:Characteristic ;
   samm:dataType xsd:float .
`;
}

async function openSearch(page: Page) {
  const input = page.locator(SELECTOR_searchInputField);
  if (!(await input.isVisible())) {
    // the shortcut toggles the element search
    await page.keyboard.press('Control+f');
  }
  await expect(input).toBeVisible();
  return input;
}

async function search(page: Page, query: string) {
  const input = await openSearch(page);
  await input.fill(query);
  return page.locator('mat-option.list-option');
}

function option(page: Page, name: string) {
  return page.locator('mat-option.list-option').filter({has: page.locator(`text="${name}"`)});
}

test.describe('Editor - full text element search', () => {
  let helper: AppHelper;

  test.beforeEach(async ({page}) => {
    helper = new AppHelper(page);
    await helper.visitDefault();
    await helper.loadModel(SEARCH_MODEL);
  });

  test('finds an element by a word in the middle or at the end of its camelCase name', async ({page}) => {
    for (const term of ['threshold', 'exhaustion', 'Exhaustion', 'EXHAUST']) {
      const options = await search(page, term);
      await expect(option(page, 'capacityThresholdExhaustion'), `term "${term}"`).toBeVisible();
      await expect(options.first()).toContainText('capacityThresholdExhaustion');
    }
  });

  test('finds an element by its full name', async ({page}) => {
    const options = await search(page, 'capacityThresholdExhaustion');
    await expect(options.first()).toContainText('capacityThresholdExhaustion');
    await expect(page.getByTestId('searchApproximateResults')).toHaveCount(0);
  });

  test('finds elements by their preferredName and shows the matching field', async ({page}) => {
    await search(page, 'remaining capacity');
    const result = option(page, 'remainingEnergy');
    await expect(result).toBeVisible();
    await expect(result).toContainText('Preferred name (en): Remaining capacity');
  });

  test('finds elements by their description', async ({page}) => {
    await search(page, 'still stored');
    const result = option(page, 'remainingEnergy');
    await expect(result).toBeVisible();
    await expect(result).toContainText('Description (en): Energy which is still stored.');
  });

  test('requires all terms of a sentence and ignores filler words', async ({page}) => {
    const options = await search(page, 'Capacity threshold for exhaustion');
    await expect(option(page, 'capacityThresholdExhaustion')).toBeVisible();
    // stateOfHealth only contains "threshold", remainingEnergy only "capacity"
    await expect(option(page, 'stateOfHealth')).toHaveCount(0);
    await expect(option(page, 'remainingEnergy')).toHaveCount(0);
    await expect(options).toHaveCount(1);
  });

  test('ranks name matches before description matches', async ({page}) => {
    const options = await search(page, 'threshold');
    await expect(options.first()).toContainText('capacityThresholdExhaustion');
    await expect(option(page, 'stateOfHealth')).toBeVisible();
  });

  test('searches all languages and shows the language of the match', async ({page}) => {
    await search(page, 'zelltemperatur');
    const result = option(page, 'temperature');
    await expect(result).toBeVisible();
    await expect(result).toContainText('Preferred name (de): Zelltemperatur');
  });

  test('ignores accents and umlauts', async ({page}) => {
    for (const term of ['grosse', 'Größe', 'luftung', 'LÜFTUNG']) {
      await search(page, term);
      await expect(option(page, 'temperature'), `term "${term}"`).toBeVisible();
    }
  });

  test('keeps a quoted phrase together', async ({page}) => {
    const options = await search(page, '"cell temperature"');
    await expect(option(page, 'temperature')).toBeVisible();
    await expect(options).toHaveCount(1);

    // the words exist, but not as this phrase: only approximate matches are shown
    await search(page, '"temperature cell"');
    await expect(page.getByTestId('searchApproximateResults')).toBeVisible();
  });

  test('shows the closest matches when no element contains all terms', async ({page}) => {
    await search(page, 'exhaustion banana');
    await expect(page.getByTestId('searchApproximateResults')).toContainText('No element contains all terms');
    await expect(option(page, 'capacityThresholdExhaustion')).toBeVisible();
  });

  test('falls back to a typo tolerant search', async ({page}) => {
    await search(page, 'exhuastion');
    await expect(page.getByTestId('searchApproximateResults')).toContainText('No exact match');
    await expect(option(page, 'capacityThresholdExhaustion')).toBeVisible();
  });

  test('shows nothing for unknown terms and for an empty query', async ({page}) => {
    const options = await search(page, 'qqqqzzzzxxxx');
    await expect(options).toHaveCount(0);

    await page.locator(SELECTOR_searchInputField).fill('');
    await expect(options).toHaveCount(0);
  });

  test('accepts the legacy "*" include syntax', async ({page}) => {
    await search(page, '*exhaustion');
    await expect(option(page, 'capacityThresholdExhaustion')).toBeVisible();
  });

  test('opens the element editor when a result is selected and closes the search', async ({page}) => {
    await search(page, 'exhaustion');
    await option(page, 'capacityThresholdExhaustion').click();

    await expect(page.locator(SELECTOR_searchInputField)).toHaveCount(0);
    await expect(page.locator(SELECTOR_editorSaveButton)).toBeVisible();
    await expect(page.locator(FIELD_name)).toHaveValue('capacityThresholdExhaustion');
  });

  test('finds renamed elements by their new name', async ({page}) => {
    await helper.renameElement('remainingEnergy', 'storedChargeLevel');
    await search(page, 'charge');
    await expect(option(page, 'storedChargeLevel')).toBeVisible();
  });
});

test.describe('Editor - full text element search in large models', () => {
  test.setTimeout(120_000);

  test('finds an element by its description in a model with 300 properties', async ({page}) => {
    const helper = new AppHelper(page);
    await helper.visitDefault();
    const loading = helper.loadModel(largeModel(300));
    // models with more than 99 elements ask before they are rendered (the loading dialog lies above the warning)
    await page.getByRole('button', {name: 'Continue'}).dispatchEvent('click');
    await loading;

    const start = Date.now();
    const options = await search(page, 'needle haystack');
    await expect(options).toHaveCount(1);
    await expect(options.first()).toContainText('measurementValue299');
    // includes the debounce and rendering; only guards against pathological slowness
    expect(Date.now() - start).toBeLessThan(5000);

    await page.locator(SELECTOR_searchInputField).fill('measurement');
    await expect(page.locator('mat-option.list-option').first()).toBeVisible();
  });
});
