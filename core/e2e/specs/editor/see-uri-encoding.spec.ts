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

import {expect, test} from '@playwright/test';
import {AppHelper} from '../../support/app-helper';

const MODEL = `@prefix samm: <urn:samm:org.eclipse.esmf.samm:meta-model:2.2.0#> .
@prefix samm-c: <urn:samm:org.eclipse.esmf.samm:characteristic:2.2.0#> .
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .
@prefix : <urn:samm:org.eclipse.examples:1.0.0#> .

:SeeAspect a samm:Aspect ;
   samm:properties ( :seeProperty ) ;
   samm:operations ( ) ;
   samm:events ( ) .

:seeProperty a samm:Property ;
   samm:see <https://example.com/spec%23section-1> ;
   samm:see <https://example.com/list%2Citem> ;
   samm:characteristic :SeeCharacteristic .

:SeeCharacteristic a samm:Characteristic ;
   samm:see <https://example.com/characteristic%23anchor> ;
   samm:dataType xsd:string .
`;

test.describe('samm:see keeps encoded URIs', () => {
  let app: AppHelper;

  test.beforeEach(async ({page}) => {
    app = new AppHelper(page);
    await app.startModelling();
    await app.loadModel(MODEL);
  });

  test('loading and serializing without editing keeps %23 and %2C', async () => {
    const rdf = await app.getUpdatedRDF();
    expect(rdf).toContain('<https://example.com/spec%23section-1>');
    expect(rdf).toContain('<https://example.com/list%2Citem>');
    expect(rdf).toContain('<https://example.com/characteristic%23anchor>');
  });

  test('saving a property in the edit view keeps the encoded see URIs', async ({page}) => {
    await app.dbClickShape('seeProperty');
    await expect(page.locator('[data-testid="chip__https://example.com/spec%23section-1"]')).toBeVisible();
    await app.clickSaveButton();

    const rdf = await app.getUpdatedRDF();
    expect(rdf).toContain('<https://example.com/spec%23section-1>');
    expect(rdf).toContain('<https://example.com/list%2Citem>');
    expect(rdf).not.toContain('<https://example.com/spec#section-1>');
    expect(rdf).not.toContain('<https://example.com/list,item>');
    expect(rdf).not.toMatch(/<https:\/\/example\.com\/list>/);
  });

  test('saving a characteristic in the edit view keeps the encoded see URI', async () => {
    await app.dbClickShape('SeeCharacteristic');
    await app.clickSaveButton();

    const rdf = await app.getUpdatedRDF();
    expect(rdf).toContain('<https://example.com/characteristic%23anchor>');
    expect(rdf).not.toContain('<https://example.com/characteristic#anchor>');
  });

  test('a see URI typed into the edit view keeps its %23 encoding', async ({page}) => {
    const typed = 'https://example.com/new%23fragment';
    await app.dbClickShape('SeeCharacteristic');
    await page.locator('[data-testid="see"]').fill(typed);
    await page.locator(`[data-testid="option__${typed}"]`).click();
    await expect(page.locator(`[data-testid="chip__${typed}"]`)).toBeVisible();
    await app.clickSaveButton();

    const rdf = await app.getUpdatedRDF();
    expect(rdf).toContain(`<${typed}>`);
    expect(rdf).not.toContain('<https://example.com/new#fragment>');
    expect(rdf).toContain('<https://example.com/characteristic%23anchor>');
  });

  test('removing one see URI keeps the remaining encoded URI unchanged', async ({page}) => {
    await app.dbClickShape('seeProperty');
    await page.locator('[data-testid="chip__https://example.com/spec%23section-1"] [data-testid="see-remove-chip"]').click();
    await expect(page.locator('[data-testid="chip__https://example.com/spec%23section-1"]')).toHaveCount(0);
    await app.clickSaveButton();

    const rdf = await app.getUpdatedRDF();
    expect(rdf).not.toContain('spec%23section-1');
    expect(rdf).not.toContain('spec#section-1');
    expect(rdf).toContain('<https://example.com/list%2Citem>');
  });

  test('a real fragment "#" in a see URI is not encoded', async ({page}) => {
    const typed = 'https://example.com/page#real-fragment';
    await app.dbClickShape('SeeCharacteristic');
    await page.locator('[data-testid="see"]').fill(typed);
    await page.locator(`[data-testid="option__${typed}"]`).click();
    await app.clickSaveButton();

    const rdf = await app.getUpdatedRDF();
    expect(rdf).toContain(`<${typed}>`);
    expect(rdf).not.toContain('page%23real-fragment');
  });

  test('the text view shows the encoded see URIs', async ({page}) => {
    await app.dbClickShape('seeProperty');
    await app.clickSaveButton();
    await page.getByTestId('editor-view-text').click();
    const text = page.locator('.cm-content');
    await expect(text).toContainText('https://example.com/spec%23section-1');
    await expect(text).toContainText('https://example.com/characteristic%23anchor');
    await expect(text).not.toContainText('https://example.com/spec#section-1');
  });
});
