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

import {expect, Page, Route, test} from '@playwright/test';
import {FORMAT_API_URL, VALIDATE_API_URL} from '../../support/api-mocks';
import {AppHelper} from '../../support/app-helper';
import {SELECTOR_tbDeleteButton, SELECTOR_tbValidateButton} from '../../support/constants';

const NS = 'urn:samm:org.eclipse.examples.aspect:1.0.0#';

const FORMATTED_MODEL = `@prefix samm: <urn:samm:org.eclipse.esmf.samm:meta-model:2.2.0#> .
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .
@prefix : <${NS}> .

:AspectDefault a samm:Aspect ;
   samm:preferredName "AspectDefault"@en ;
   samm:properties ( :property1 ) ;
   samm:operations ( ) ;
   samm:events ( ) .

:property1 a samm:Property ;
   samm:characteristic :Characteristic1 .

:Characteristic1 a samm:Characteristic ;
   samm:dataType xsd:string .
`;

async function routeFormat(page: Page, body: string, delayMs = 0): Promise<void> {
  await page.route(FORMAT_API_URL, async (route: Route) => {
    if (delayMs) {
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
    await route.fulfill({status: 200, contentType: 'text/plain', body});
  });
}

test.describe('Editor - Graph / Aspect Model text view', () => {
  let app: AppHelper;

  const textContent = (page: Page) => page.getByTestId('text-view-content');

  async function openTextView(page: Page): Promise<void> {
    await page.getByTestId('editor-view-text').click();
    await page.mouse.move(400, 400);
    await expect(page.getByTestId('canvas-area')).toHaveAttribute('data-view-mode', 'text');
    await expect(textContent(page)).toBeVisible();
  }

  test.beforeEach(async ({page}) => {
    app = new AppHelper(page);
    await app.startModelling();
  });

  test('switches between graph and read-only Turtle text', async ({page}) => {
    await expect(page.getByTestId('editor-view-toggle')).toBeVisible();
    await openTextView(page);

    await expect(page.locator('#graph')).toBeHidden();
    await expect(textContent(page)).toContainText(':AspectDefault');
    await expect(textContent(page)).toContainText('samm:Aspect');
    await expect(textContent(page)).toHaveAttribute('aria-readonly', 'true');
    await expect(page.locator('.cm-lineNumbers .cm-gutterElement', {hasText: /^1$/})).toBeVisible();
    await expect(page.getByTestId('text-view-readonly')).toBeVisible();
    await expect(page.getByTestId('text-view-line-count')).toBeVisible();
    // The e2e format mock returns nothing, so the raw serialization is shown.
    await expect(page.getByTestId('text-view-unformatted')).toBeVisible();
    const fontFamily = await page
      .locator('.cm-line span')
      .first()
      .evaluate(el => getComputedStyle(el).fontFamily);
    expect(fontFamily).toContain('monospace');

    await page.getByTestId('editor-view-graph').click();
    await expect(page.locator('#graph')).toBeVisible();
    await expect(page.locator('ame-aspect-model-text-view')).toHaveCount(0);
  });

  test('shows the formatted model as it would be saved', async ({page}) => {
    await routeFormat(page, FORMATTED_MODEL);
    await openTextView(page);

    await expect(textContent(page)).toContainText(':property1 a samm:Property ;');
    await expect(page.getByTestId('text-view-unformatted')).toHaveCount(0);
  });

  test('disables graph-only toolbar actions in the text view', async ({page}) => {
    await openTextView(page);

    await expect(page.locator(SELECTOR_tbDeleteButton)).toHaveClass(/disabled/);
    await expect(page.locator('[data-testid="formatButton"]')).toHaveClass(/disabled/);
    await expect(page.locator(SELECTOR_tbValidateButton)).not.toHaveClass(/disabled/);
  });

  test('scrolls to the element selected in the graph', async ({page}) => {
    await routeFormat(page, FORMATTED_MODEL);
    await app.clickShape('property1');
    await openTextView(page);

    await expect(page.locator('.cm-ame-target-line')).toContainText(':property1 a samm:Property');
  });

  test('marks lines with validation errors', async ({page}) => {
    await routeFormat(page, FORMATTED_MODEL);
    await page.route(VALIDATE_API_URL, async (route: Route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          violationErrors: [{message: 'Property1 is broken', focusNode: `${NS}property1`, fix: [], errorCode: 'ERR_TEST'}],
        }),
      });
    });
    await page.locator(SELECTOR_tbValidateButton).click();
    await openTextView(page);

    await expect(page.getByTestId('text-view-violations')).toBeVisible();
    const violationLine = page.locator('.cm-ame-violation-line');
    await expect(violationLine).toHaveCount(1);
    await expect(violationLine).toContainText(':property1 a samm:Property');
    await expect(violationLine).toHaveAttribute('title', 'Property1 is broken');
    await expect(page.locator('.cm-ame-violation-marker')).toHaveCount(1);
  });

  test('shows a loading indicator while the model is formatted', async ({page}) => {
    await routeFormat(page, FORMATTED_MODEL, 1500);
    await page.getByTestId('editor-view-text').click();

    await expect(page.getByTestId('text-view-loading')).toBeVisible();
    await expect(textContent(page)).toContainText(':property1 a samm:Property ;', {timeout: 10000});
    await expect(page.getByTestId('text-view-loading')).toHaveCount(0);
  });

  test('opens the search panel via button and keyboard shortcut', async ({page}) => {
    await openTextView(page);

    await page.getByTestId('text-view-search').click();
    await expect(page.locator('.cm-search')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.locator('.cm-search')).toHaveCount(0);

    await page.keyboard.press('ControlOrMeta+f');
    await expect(page.locator('.cm-search')).toBeVisible();
  });

  test('keeps the graph when deleting from the text view via keyboard', async ({page}) => {
    await app.clickShape('property1');
    await openTextView(page);
    await textContent(page).click();
    await page.keyboard.press('Delete');

    await page.getByTestId('editor-view-graph').click();
    await app.shapeExists('property1');
  });
});
