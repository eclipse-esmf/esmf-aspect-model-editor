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
import {FORMAT_API_URL} from '../../support/api-mocks';
import {AppHelper} from '../../support/app-helper';
import {SELECTOR_tbDeleteButton, SettingsDialogSelectors} from '../../support/constants';
import {
  countOccurrences,
  getTextViewText,
  openGraphView,
  openTextView,
  routeShufflingFormatter,
  subjectOrder,
} from '../../support/serialization-utils';

const HEADER = `# Copyright (c) 2026 Example Corp
# SPDX-License-Identifier: MPL-2.0`;

const PREFIXES = `@prefix samm: <urn:samm:org.eclipse.esmf.samm:meta-model:2.2.0#> .
@prefix samm-c: <urn:samm:org.eclipse.esmf.samm:characteristic:2.2.0#> .
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .
@prefix : <urn:samm:org.eclipse.examples.aspect:1.0.0#> .
@prefix ex: <http://example.com#> .`;

/** Hand written file: characteristics first, the aspect in the middle, attributes in a non canonical order. */
const HAND_WRITTEN_MODEL = `${HEADER}

${PREFIXES}

# Characteristics
:Characteristic1 a samm:Characteristic ;
   samm:dataType xsd:string .

:property1 a samm:Property ;
   samm:characteristic :Characteristic1 ;
   samm:description "First property"@en ;
   samm:preferredName "Property 1"@en .

:AspectDefault a samm:Aspect ;
   samm:see <http://example.com/docs> ;
   samm:description "An aspect"@en ;
   samm:preferredName "Aspect"@en ;
   samm:properties ( :property1 :property2 ) ;
   samm:operations ( ) ;
   samm:events ( ) .

:property2 a samm:Property ;
   samm:characteristic :Characteristic1 .
`;

const EDITOR_SETTINGS = /^\s*Editor\s*$/;

const ORIGINAL_ORDER = [':Characteristic1', ':property1', ':AspectDefault', ':property2'];

async function selectElementOrder(app: AppHelper, page: Page, option: RegExp): Promise<void> {
  await app.openSettings(EDITOR_SETTINGS);
  await page.getByTestId('elementOrderSelect').click();
  await page.locator('mat-option').filter({hasText: option}).click();
  await expect(page.getByTestId('elementOrderSelect')).toContainText(option);
  // the closing select panel would otherwise swallow the click on OK (WebKit)
  await expect(page.locator('mat-option')).toHaveCount(0);
  await expect(page.locator('.cdk-overlay-transparent-backdrop')).toHaveCount(0);
  await app.closeDialog(SettingsDialogSelectors.settingsDialogOkButton);
}

async function addPropertyToAspect(app: AppHelper, page: Page): Promise<string[]> {
  const before = new Set(subjectOrder(await getTextViewText(page)));
  await openGraphView(page);
  await app.clickAddShapePlusIcon('AspectDefault');
  await openTextView(page);
  await expect.poll(async () => subjectOrder(await getTextViewText(page)).length).toBeGreaterThan(before.size);
  return subjectOrder(await getTextViewText(page)).filter(subject => !before.has(subject));
}

test.describe('Serialization - default element order (ESMF SDK formatter)', () => {
  let app: AppHelper;

  test.beforeEach(async ({page}) => {
    app = new AppHelper(page);
    await app.visitDefault();
    await routeShufflingFormatter(page);
    await app.loadModel(HAND_WRITTEN_MODEL);
  });

  test('the ESMF SDK formatter is the default element order', async ({page}) => {
    await app.openSettings(EDITOR_SETTINGS);
    await expect(page.getByTestId('elementOrderSelect')).toContainText(/ESMF SDK formatter/i);
    await page.getByTestId('elementOrderSelect').click({force: true});
    // the default is offered first
    await expect(page.locator('mat-option').first()).toContainText(/ESMF SDK formatter/i);
    await page.keyboard.press('Escape');
    await expect(page.locator('mat-option')).toHaveCount(0);
    await app.closeDialog(SettingsDialogSelectors.settingsDialogCancelButton);
  });

  test('uses the order of the formatter and disables sorting', async ({page}) => {
    await openTextView(page);
    // the simulated formatter writes the statements in reverse alphabetical order
    expect(subjectOrder(await getTextViewText(page))).toEqual([':property2', ':property1', ':Characteristic1', ':AspectDefault']);
    await expect(page.getByTestId('text-view-sort')).toBeDisabled();
  });

  test('still keeps the header, the custom prefixes and writes no duplicates', async ({page}) => {
    await openTextView(page);
    const text = await getTextViewText(page);
    expect(text.startsWith(HEADER)).toBe(true);
    expect(text).toContain('@prefix ex: <http://example.com#>');
    expect(countOccurrences(text, 'samm:properties')).toBe(1);
  });

  test('new elements are placed by the formatter', async ({page}) => {
    await openTextView(page);
    await addPropertyToAspect(app, page);
    const order = subjectOrder(await getTextViewText(page));
    // reverse alphabetical like the simulated formatter
    expect(order).toEqual([...order].sort((a, b) => b.localeCompare(a)));
  });
});

test.describe('Serialization - structure preservation', () => {
  let app: AppHelper;

  test.beforeEach(async ({page}) => {
    // loading and configuring the strategy takes longer under parallel load
    test.setTimeout(60000);
    app = new AppHelper(page);
    await app.visitDefault();
    await routeShufflingFormatter(page);
    await app.loadModel(HAND_WRITTEN_MODEL);
    // the settings can only be saved with a loaded model
    await selectElementOrder(app, page, /insert new elements after their parent/i);
  });

  test('keeps the element order of the file although the formatter reorders the statements', async ({page}) => {
    await openTextView(page);
    const text = await getTextViewText(page);
    expect(subjectOrder(text)).toEqual(ORIGINAL_ORDER);
    await expect(page.getByTestId('text-view-unformatted')).toHaveCount(0);
  });

  test('keeps the header comment of the file', async ({page}) => {
    await openTextView(page);
    const text = await getTextViewText(page);
    expect(text.startsWith(HEADER)).toBe(true);
    expect(countOccurrences(text, '# Copyright')).toBe(1);
  });

  test('keeps custom prefixes even if they are not used', async ({page}) => {
    await openTextView(page);
    const text = await getTextViewText(page);
    expect(text).toContain('@prefix ex: <http://example.com#>');
    expect(text).toContain('@prefix : <urn:samm:org.eclipse.examples.aspect:1.0.0#>');
  });

  test('writes the attributes of an element in the canonical SAMM order', async ({page}) => {
    // Force the raw serialization: a failing formatter must not depend on whether a local backend is running.
    await page.unroute(FORMAT_API_URL);
    await page.route(`**${FORMAT_API_URL}`, route => route.abort());
    await openTextView(page);
    await expect(page.getByTestId('text-view-unformatted')).toBeVisible();
    const text = await getTextViewText(page);
    const aspect = text.slice(text.indexOf(':AspectDefault a samm:Aspect'));
    const positions = ['samm:preferredName', 'samm:description', 'samm:see', 'samm:properties', 'samm:operations', 'samm:events'].map(
      predicate => aspect.indexOf(predicate),
    );
    expect(positions.every(position => position >= 0)).toBe(true);
    expect([...positions].sort((a, b) => a - b)).toEqual(positions);

    const property = text.slice(text.indexOf(':property1 a samm:Property'));
    expect(property.indexOf('samm:preferredName')).toBeLessThan(property.indexOf('samm:description'));
    expect(property.indexOf('samm:description')).toBeLessThan(property.indexOf('samm:characteristic'));
  });

  test('writes every statement and every list exactly once', async ({page}) => {
    await openTextView(page);
    const text = await getTextViewText(page);
    expect(countOccurrences(text, 'samm:properties')).toBe(1);
    expect(countOccurrences(text, 'samm:operations')).toBe(1);
    expect(countOccurrences(text, 'samm:events')).toBe(1);
    expect(countOccurrences(text, /:AspectDefault a samm:Aspect/g)).toBe(1);
    expect(text).toMatch(/samm:properties \(\s*:property1 :property2\s*\)/);

    const raw = await app.getUpdatedRDF();
    expect(countOccurrences(raw, 'samm:properties')).toBe(1);
    expect(countOccurrences(raw, ':property1 :property2')).toBe(1);
  });

  test('writes no duplicates after editing and repeated serialization', async ({page}) => {
    await app.renameElement('property2', 'renamedProperty');
    await app.getUpdatedRDF();
    await app.getUpdatedRDF();
    await openTextView(page);
    const text = await getTextViewText(page);

    expect(countOccurrences(text, 'samm:properties')).toBe(1);
    expect(text).toMatch(/samm:properties \(\s*:property1 :renamedProperty\s*\)/);
    expect(countOccurrences(text, /^:renamedProperty a samm:Property/gm)).toBe(1);
  });

  test('is stable when the shown text is loaded again (load - save - load)', async ({page}) => {
    await openTextView(page);
    const first = await getTextViewText(page);

    await openGraphView(page);
    await app.loadModel(first);
    await openTextView(page);
    const second = await getTextViewText(page);

    expect(second).toEqual(first);
    expect(countOccurrences(second, 'samm:properties')).toBe(1);
  });

  test('keeps the position of a renamed element', async ({page}) => {
    await app.renameElement('property1', 'firstProperty');
    await openTextView(page);
    expect(subjectOrder(await getTextViewText(page))).toEqual([':Characteristic1', ':firstProperty', ':AspectDefault', ':property2']);
  });

  test('removes a deleted element and keeps the order of the others', async ({page}) => {
    await app.clickShape('property2');
    await page.locator(SELECTOR_tbDeleteButton).click({force: true});
    await openTextView(page);
    const text = await getTextViewText(page);
    expect(subjectOrder(text)).toEqual([':Characteristic1', ':property1', ':AspectDefault']);
    expect(text).toMatch(/samm:properties \(\s*:property1\s*\)/);
  });

  test('inserts new elements directly after their parent with the "after parent" strategy', async ({page}) => {
    await openTextView(page);
    const added = await addPropertyToAspect(app, page);
    expect(added.length).toBeGreaterThan(0);

    const order = subjectOrder(await getTextViewText(page));
    const aspectIndex = order.indexOf(':AspectDefault');
    // the new property follows the aspect, its characteristic follows the property
    expect(order.slice(aspectIndex + 1, aspectIndex + 1 + added.length)).toEqual(added);
    expect(order.slice(0, aspectIndex + 1)).toEqual([':Characteristic1', ':property1', ':AspectDefault']);
    expect(order[order.length - 1]).toBe(':property2');
  });

  test('appends new elements at the end with the "append" strategy', async ({page}) => {
    await selectElementOrder(app, page, /append new elements/i);
    await openTextView(page);
    const added = await addPropertyToAspect(app, page);

    const order = subjectOrder(await getTextViewText(page));
    expect(order.slice(0, ORIGINAL_ORDER.length)).toEqual(ORIGINAL_ORDER);
    expect(order.slice(ORIGINAL_ORDER.length)).toEqual(added);
  });

  test('switching back to the "formatter" strategy uses the order of the formatter and disables sorting', async ({page}) => {
    await selectElementOrder(app, page, /ESMF SDK formatter/i);
    await openTextView(page);
    const order = subjectOrder(await getTextViewText(page));
    // the simulated formatter writes the statements in reverse alphabetical order
    expect(order).toEqual([':property2', ':property1', ':Characteristic1', ':AspectDefault']);
    await expect(page.getByTestId('text-view-sort')).toBeDisabled();
  });

  test('sorts the elements alphabetically with the aspect first on demand', async ({page}) => {
    await openTextView(page);
    await expect(page.getByTestId('text-view-sort')).toBeEnabled();
    await page.getByTestId('text-view-sort').click();

    await expect
      .poll(async () => subjectOrder(await getTextViewText(page)))
      .toEqual([':AspectDefault', ':Characteristic1', ':property1', ':property2']);
    // the new order is kept when the model is edited afterwards
    await app.renameElement('property1', 'zProperty');
    await openTextView(page);
    expect(subjectOrder(await getTextViewText(page))).toEqual([':AspectDefault', ':Characteristic1', ':zProperty', ':property2']);
  });

  test('the element order setting is persisted', async ({page}) => {
    await selectElementOrder(app, page, /append new elements/i);
    await app.openSettings(EDITOR_SETTINGS);
    await expect(page.getByTestId('elementOrderSelect')).toContainText(/append new elements/i);
    await app.closeDialog(SettingsDialogSelectors.settingsDialogCancelButton);

    await page.reload();
    await page
      .locator('ame-loading-screen')
      .waitFor({state: 'detached', timeout: 20000})
      .catch(() => {});
    await app.openSettings(EDITOR_SETTINGS);
    await expect(page.getByTestId('elementOrderSelect')).toContainText(/append new elements/i);
  });
});

test.describe('Serialization - file header', () => {
  let app: AppHelper;

  test.beforeEach(async ({page}) => {
    app = new AppHelper(page);
    await app.visitDefault();
    await routeShufflingFormatter(page);
  });

  test('shows the header of the loaded file in the copyright settings and applies changes to this file', async ({page}) => {
    await app.loadModel(HAND_WRITTEN_MODEL);
    await app.openSettings(/copyright/i);
    const field = page.locator('[data-testid="copyright"]');
    await expect(field).toHaveValue(HEADER);

    await field.fill('# Changed header');
    await app.closeDialog(SettingsDialogSelectors.settingsDialogOkButton);

    await openTextView(page);
    const text = await getTextViewText(page);
    expect(text.startsWith('# Changed header')).toBe(true);
    expect(text).not.toContain('Example Corp');
  });

  test('every file keeps its own header', async ({page}) => {
    await app.loadModel(HAND_WRITTEN_MODEL);
    await openTextView(page);
    expect((await getTextViewText(page)).startsWith(HEADER)).toBe(true);

    await openGraphView(page);
    await app.loadModel(HAND_WRITTEN_MODEL.replace(HEADER, '# Another company'));
    await openTextView(page);
    const text = await getTextViewText(page);
    expect(text.startsWith('# Another company')).toBe(true);
    expect(text).not.toContain('Example Corp');
  });

  test('a file without header stays without header', async ({page}) => {
    await app.loadModel(HAND_WRITTEN_MODEL.replace(`${HEADER}\n\n`, ''));
    await openTextView(page);
    const text = await getTextViewText(page);
    expect(text.startsWith('@prefix')).toBe(true);
  });
});
