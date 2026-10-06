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

import {Locator, Page, expect, test} from '@playwright/test';
import {AppHelper} from '../../support/app-helper';
import {SELECTOR_ecProperty} from '../../support/constants';
import {SELECTOR_referencePrefixDialog, setupAndDragExternalReference} from '../../support/drag-drop-utils';
import {getTextViewText, openGraphView, openTextView, routeShufflingFormatter} from '../../support/serialization-utils';

const DIFFERENT_NS = 'urn:samm:org.eclipse.different:1.0.0#';

const MODEL_WITH_CUSTOM_PREFIXES = `@prefix samm: <urn:samm:org.eclipse.esmf.samm:meta-model:2.2.0#> .
@prefix samm-c: <urn:samm:org.eclipse.esmf.samm:characteristic:2.2.0#> .
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .
@prefix : <urn:samm:org.eclipse.examples.aspect:1.0.0#> .
@prefix ex: <http://example.com#> .
@prefix custom: <http://example.org/custom#> .

:AspectDefault a samm:Aspect ;
   samm:see ex:docs ;
   samm:properties ( :property1 ) ;
   samm:operations ( ) ;
   samm:events ( ) .

:property1 a samm:Property ;
   samm:see ex:propertyDocs ;
   samm:characteristic :Characteristic1 .

:Characteristic1 a samm:Characteristic ;
   samm:dataType xsd:string .
`;

const managementDialog = (page: Page) => page.locator('ame-prefix-management-dialog');
const row = (page: Page, alias: string) => managementDialog(page).getByTestId(`prefix-row-${alias || 'default'}`);

async function openPrefixManagement(page: Page): Promise<Locator> {
  await page.getByTestId('tbPrefixesButton').click();
  await expect(managementDialog(page)).toBeVisible();
  return managementDialog(page);
}

async function closePrefixManagement(page: Page): Promise<void> {
  await managementDialog(page).getByTestId('prefix-management-close').click();
  await expect(managementDialog(page)).toHaveCount(0);
}

async function rename(page: Page, from: string, to: string): Promise<void> {
  await row(page, from).getByTestId('prefix-rename').click();
  const input = managementDialog(page).getByTestId('prefix-rename-input');
  await input.fill(to);
  await managementDialog(page).getByTestId('prefix-rename-save').click();
}

async function addPrefix(page: Page, alias: string, namespace: string): Promise<void> {
  await managementDialog(page).getByTestId('prefix-add-alias').fill(alias);
  await managementDialog(page).getByTestId('prefix-add-namespace').fill(namespace);
  await managementDialog(page).getByTestId('prefix-add').click();
}

/** All quads of the current file which use the IRI as subject or object (the semantics, independent of prefixes). */
async function countIriUsages(page: Page, iri: string): Promise<number> {
  return page.evaluate(value => {
    const store = (window as any)['angular.LoadedFilesService'].currentLoadedFile.rdfModel.store;
    return store.getQuads(null, null, value, null).length + store.getQuads(value, null, null, null).length;
  }, iri);
}

async function prefixes(page: Page): Promise<Record<string, string>> {
  return page.evaluate(() => ({...(window as any)['angular.LoadedFilesService'].currentLoadedFile.rdfModel.getPrefixes()}));
}

test.describe('Prefixes - loading and saving', () => {
  let app: AppHelper;

  test.beforeEach(async ({page}) => {
    app = new AppHelper(page);
    await app.visitDefault();
  });

  test('loads a model with custom prefixes', async ({page}) => {
    await app.loadModel(MODEL_WITH_CUSTOM_PREFIXES);
    await app.shapeExists('AspectDefault');
    await app.shapeExists('property1');
    await expect(page.getByText('Please wait until the model is loaded')).toHaveCount(0);

    const loaded = await prefixes(page);
    expect(loaded['ex']).toBe('http://example.com#');
    expect(loaded['custom']).toBe('http://example.org/custom#');
  });

  test('keeps used and unused custom prefixes in the serialization', async () => {
    await app.loadModel(MODEL_WITH_CUSTOM_PREFIXES);
    const rdf = await app.getUpdatedRDF();
    expect(rdf).toMatch(/@prefix ex: <http:\/\/example\.com#>/);
    expect(rdf).toMatch(/@prefix custom: <http:\/\/example\.org\/custom#>/);
    expect(rdf).toContain('ex:docs');
    expect(rdf).toContain('ex:propertyDocs');
    expect(rdf).not.toContain('<http://example.com#docs>');
  });

  test('keeps the prefixes after editing the model', async () => {
    await app.loadModel(MODEL_WITH_CUSTOM_PREFIXES);
    await app.renameElement('property1', 'renamedProperty');
    const rdf = await app.getUpdatedRDF();
    expect(rdf).toMatch(/@prefix ex: <http:\/\/example\.com#>/);
    expect(rdf).toMatch(/@prefix custom: <http:\/\/example\.org\/custom#>/);
    expect(rdf).toContain('ex:propertyDocs');
  });

  test('shows the prefixes of the file in the text view', async ({page}) => {
    await routeShufflingFormatter(page);
    await app.loadModel(MODEL_WITH_CUSTOM_PREFIXES);
    await openTextView(page);
    const text = await getTextViewText(page);
    expect(text).toContain('@prefix ex: <http://example.com#>');
    expect(text).toContain('@prefix custom: <http://example.org/custom#>');
    expect(text).toContain('samm:see ex:docs');
  });

  test('a new model starts with the default prefixes only', async ({page}) => {
    await app.startModelling();
    const current = await prefixes(page);
    expect(current['']).toBe('urn:samm:org.eclipse.examples.aspect:1.0.0#');
    expect(current['ex']).toBeUndefined();
  });
});

test.describe('Prefixes - management dialog', () => {
  let app: AppHelper;

  test.beforeEach(async ({page}) => {
    app = new AppHelper(page);
    await app.visitDefault();
    await routeShufflingFormatter(page);
    await app.loadModel(MODEL_WITH_CUSTOM_PREFIXES);
  });

  test('lists all prefixes with namespace and usage', async ({page}) => {
    const dialog = await openPrefixManagement(page);
    await expect(dialog.getByTestId('prefix-table')).toBeVisible();

    await expect(row(page, 'ex')).toContainText('ex:');
    await expect(row(page, 'ex')).toContainText('http://example.com#');
    await expect(row(page, 'ex')).toContainText('Used');
    await expect(row(page, 'custom')).toContainText('http://example.org/custom#');
    await expect(row(page, 'custom')).toContainText('Not used');
    await expect(row(page, '')).toContainText('(default)');
    await expect(row(page, '')).toContainText('urn:samm:org.eclipse.examples.aspect:1.0.0#');
  });

  test('protects the default prefix and the SAMM / RDF prefixes', async ({page}) => {
    await openPrefixManagement(page);
    for (const alias of ['', 'samm', 'samm-c', 'xsd']) {
      await expect(row(page, alias).locator('mat-icon', {hasText: 'lock'}), `prefix "${alias}"`).toBeVisible();
      await expect(row(page, alias).getByTestId('prefix-rename')).toHaveCount(0);
      await expect(row(page, alias).getByTestId('prefix-remove')).toHaveCount(0);
    }
  });

  test('renaming a prefix only changes the notation, not the IRIs', async ({page}) => {
    const usagesBefore = await countIriUsages(page, 'http://example.com#docs');
    expect(usagesBefore).toBe(1);

    await openPrefixManagement(page);
    await rename(page, 'ex', 'example');
    await expect(row(page, 'example')).toContainText('http://example.com#');
    await expect(row(page, 'ex')).toHaveCount(0);
    await closePrefixManagement(page);

    expect(await countIriUsages(page, 'http://example.com#docs')).toBe(usagesBefore);
    expect(await countIriUsages(page, 'http://example.com#propertyDocs')).toBe(1);

    const rdf = await app.getUpdatedRDF();
    expect(rdf).toMatch(/@prefix example: <http:\/\/example\.com#>/);
    expect(rdf).not.toMatch(/@prefix ex: /);
    expect(rdf).toContain('example:docs');
    expect(rdf).toContain('example:propertyDocs');
    expect(rdf).not.toMatch(/[\s(]ex:docs/);
  });

  test('a renamed prefix is shown in the text view and kept after loading the text again', async ({page}) => {
    await openPrefixManagement(page);
    await rename(page, 'ex', 'docs');
    await closePrefixManagement(page);

    await openTextView(page);
    const text = await getTextViewText(page);
    expect(text).toContain('@prefix docs: <http://example.com#>');
    expect(text).toContain('samm:see docs:docs');

    await openGraphView(page);
    await app.loadModel(text);
    expect((await prefixes(page))['docs']).toBe('http://example.com#');
    expect(await countIriUsages(page, 'http://example.com#docs')).toBe(1);
  });

  test('marks the model as changed when a prefix is renamed', async ({page}) => {
    const dirtyDot = page.locator('[data-testid="editor-tab"].active .tab-dirty-indicator');
    await openPrefixManagement(page);
    await rename(page, 'custom', 'cst');
    await closePrefixManagement(page);
    await expect(dirtyDot).toBeVisible();
  });

  test('rejects invalid, reserved and already used prefixes when renaming', async ({page}) => {
    await openPrefixManagement(page);
    const dialog = managementDialog(page);

    for (const [alias, error] of <[string, string | RegExp][]>[
      ['1abc', 'must start with a letter'],
      ['with space', 'must start with a letter'],
      ['samm', /Reserved prefixes|already used/],
      ['custom', 'already used'],
    ]) {
      await row(page, 'ex').getByTestId('prefix-rename').click();
      await dialog.getByTestId('prefix-rename-input').fill(alias);
      await dialog.getByTestId('prefix-rename-save').click();
      await expect(dialog.getByTestId('prefix-rename-error'), `alias "${alias}"`).toContainText(error);
      await dialog.getByTestId('prefix-rename-input').press('Escape');
      await expect(dialog.getByTestId('prefix-rename-input')).toHaveCount(0);
    }

    await expect(row(page, 'ex')).toBeVisible();
    await closePrefixManagement(page);
    expect((await prefixes(page))['ex']).toBe('http://example.com#');
  });

  test('cancels a rename with escape and keeps the dialog open', async ({page}) => {
    await openPrefixManagement(page);
    await row(page, 'ex').getByTestId('prefix-rename').click();
    await managementDialog(page).getByTestId('prefix-rename-input').fill('other');
    await managementDialog(page).getByTestId('prefix-rename-input').press('Escape');
    await page.waitForTimeout(500);
    await expect(managementDialog(page)).toBeVisible();
    await expect(row(page, 'ex')).toBeVisible();
    await expect(row(page, 'other')).toHaveCount(0);
    await expect(managementDialog(page).getByTestId('prefix-rename-input')).toHaveCount(0);
  });

  test('applies changes also when the dialog is closed with escape', async ({page}) => {
    const dirtyDot = page.locator('[data-testid="editor-tab"].active .tab-dirty-indicator');
    await openTextView(page);
    await page.getByTestId('text-view-prefixes').click();
    await expect(managementDialog(page)).toBeVisible();
    await rename(page, 'custom', 'mine');
    // the first escape may only close the tooltip of the focused button (Material behaviour)
    await expect(async () => {
      await page.keyboard.press('Escape');
      await expect(managementDialog(page)).toHaveCount(0, {timeout: 500});
    }).toPass({timeout: 5000});

    await expect(dirtyDot).toBeVisible();
    await expect.poll(() => getTextViewText(page)).toContain('@prefix mine: <http://example.org/custom#>');
  });

  test('adds a new prefix', async ({page}) => {
    const dialog = await openPrefixManagement(page);
    await expect(dialog.getByTestId('prefix-add')).toBeDisabled();

    await addPrefix(page, 'battery', 'https://example.org/battery#');
    await expect(row(page, 'battery')).toContainText('https://example.org/battery#');
    await expect(row(page, 'battery')).toContainText('Not used');
    await expect(dialog.getByTestId('prefix-add-error')).toHaveCount(0);
    await closePrefixManagement(page);

    const rdf = await app.getUpdatedRDF();
    expect(rdf).toMatch(/@prefix battery: <https:\/\/example\.org\/battery#>/);
  });

  test('rejects invalid new prefixes', async ({page}) => {
    await openPrefixManagement(page);
    const error = managementDialog(page).getByTestId('prefix-add-error');

    await addPrefix(page, 'ex', 'https://example.org/other#');
    await expect(error).toContainText('already used');

    await addPrefix(page, 'other', 'http://example.com#');
    await expect(error).toContainText('already has a prefix');

    await addPrefix(page, 'other', 'not a namespace');
    await expect(error).toContainText('valid namespace');

    await addPrefix(page, '9lives', 'https://example.org/other#');
    await expect(error).toContainText('must start with a letter');

    await addPrefix(page, 'xsd', 'https://example.org/other#');
    await expect(error).toBeVisible();

    await expect(row(page, 'other')).toHaveCount(0);
    await expect(row(page, '9lives')).toHaveCount(0);
  });

  test('removes unused prefixes but not used ones', async ({page}) => {
    await openPrefixManagement(page);
    await expect(row(page, 'ex').getByTestId('prefix-remove')).toBeDisabled();

    await row(page, 'custom').getByTestId('prefix-remove').click();
    await expect(row(page, 'custom')).toHaveCount(0);
    await closePrefixManagement(page);

    const rdf = await app.getUpdatedRDF();
    expect(rdf).not.toContain('custom:');
    expect(rdf).toMatch(/@prefix ex: <http:\/\/example\.com#>/);
  });

  test('is available in the text view and refreshes the text', async ({page}) => {
    await openTextView(page);
    expect(await getTextViewText(page)).toContain('@prefix custom: <http://example.org/custom#>');

    await page.getByTestId('text-view-prefixes').click();
    await expect(managementDialog(page)).toBeVisible();
    await rename(page, 'custom', 'mine');
    await closePrefixManagement(page);

    await expect.poll(() => getTextViewText(page)).toContain('@prefix mine: <http://example.org/custom#>');
    expect(await getTextViewText(page)).not.toContain('@prefix custom:');
  });
});

test.describe('Prefixes - referenced elements of other namespaces', () => {
  let app: AppHelper;
  const referenceDialog = (page: Page) => page.locator(SELECTOR_referencePrefixDialog);

  const dragExternalProperty = (baseModel?: string, prefixDialog: 'keep-open' | 'skip' = 'keep-open') =>
    setupAndDragExternalReference(app, {
      fileName: 'external-property-reference.ttl',
      elementName: 'externalProperty',
      elementSelector: SELECTOR_ecProperty,
      isSameNamespace: false,
      searchTerm: 'property',
      x: 100,
      y: 300,
      prefixDialog,
      baseModel,
    });

  test.beforeEach(async ({page}) => {
    app = new AppHelper(page);
    await app.visitDefault();
  });

  test('asks for a prefix and suggests one derived from the namespace', async ({page}) => {
    await dragExternalProperty();
    const dialog = referenceDialog(page);
    await expect(dialog).toBeVisible();
    await expect(dialog.getByTestId('reference-namespace')).toContainText(DIFFERENT_NS);
    await expect(dialog.getByTestId('reference-prefix-input')).toHaveValue('different');
    await expect(dialog.getByTestId('reference-example')).toContainText('different:externalProperty');

    await dialog.getByTestId('reference-prefix-confirm').click();
    await expect(dialog).toHaveCount(0);

    await app.clickConnectShapes('AspectDefault', 'externalProperty');
    const rdf = await app.getUpdatedRDF();
    expect(rdf).toContain(`@prefix different: <${DIFFERENT_NS}>`);
    expect(rdf).toContain('samm:properties (:property1 different:externalProperty)');
    expect(rdf).not.toContain('ext-different');
  });

  test('uses the prefix chosen by the user', async ({page}) => {
    await dragExternalProperty();
    const dialog = referenceDialog(page);
    await dialog.getByTestId('reference-prefix-input').fill('bp');
    await expect(dialog.getByTestId('reference-example')).toContainText('bp:externalProperty');
    await dialog.getByTestId('reference-prefix-input').press('Enter');
    await expect(dialog).toHaveCount(0);

    await app.clickConnectShapes('AspectDefault', 'externalProperty');
    const rdf = await app.getUpdatedRDF();
    expect(rdf).toContain(`@prefix bp: <${DIFFERENT_NS}>`);
    expect(rdf).toContain('bp:externalProperty');
    expect(rdf).not.toContain('ext-different');
    expect(rdf).not.toContain('different:externalProperty');
    expect(await countIriUsages(page, `${DIFFERENT_NS}externalProperty`)).toBeGreaterThan(0);
  });

  test('keeps the automatic prefix when the user does not choose one', async () => {
    await dragExternalProperty(undefined, 'skip');
    await app.clickConnectShapes('AspectDefault', 'externalProperty');
    const rdf = await app.getUpdatedRDF();
    expect(rdf).toContain(`@prefix ext-different: <${DIFFERENT_NS}>`);
  });

  test('does not accept invalid, reserved or already used prefixes', async ({page}) => {
    await dragExternalProperty(MODEL_WITH_CUSTOM_PREFIXES);
    const dialog = referenceDialog(page);
    const input = dialog.getByTestId('reference-prefix-input');
    const confirm = dialog.getByTestId('reference-prefix-confirm');

    const error = dialog.getByTestId('reference-prefix-error');

    await input.fill('1bad');
    await expect(confirm).toBeDisabled();
    await expect(error).toContainText('must start with a letter');
    await expect(dialog.getByTestId('reference-example')).toHaveCount(0);

    await input.fill('samm');
    await expect(confirm).toBeDisabled();
    await expect(error).toContainText('Reserved prefixes');

    // "ex" already stands for http://example.com# in this model: the namespaces must not be merged
    await input.fill('ex');
    await expect(confirm).toBeDisabled();
    await expect(error).toContainText('already used for http://example.com#');

    await input.fill('ex2');
    await expect(confirm).toBeEnabled();
    await expect(error).toHaveCount(0);
    await confirm.click();
    await expect(dialog).toHaveCount(0);

    await expect.poll(async () => (await prefixes(page))['ex2']).toBe(DIFFERENT_NS);
    const current = await prefixes(page);
    expect(current['ex']).toBe('http://example.com#');
    expect(current['ex2']).toBe(DIFFERENT_NS);
  });

  test('reuses an existing prefix of the namespace without asking', async ({page}) => {
    const baseModel = MODEL_WITH_CUSTOM_PREFIXES.replace('@prefix custom:', `@prefix bat: <${DIFFERENT_NS}> .\n@prefix custom:`);
    await dragExternalProperty(baseModel);
    await page.waitForTimeout(1000);
    await expect(referenceDialog(page)).toHaveCount(0);

    await app.clickConnectShapes('AspectDefault', 'externalProperty');
    const rdf = await app.getUpdatedRDF();
    expect(rdf).toContain(`@prefix bat: <${DIFFERENT_NS}>`);
    expect(rdf).toContain('bat:externalProperty');
    expect(rdf).not.toContain('ext-different');
  });

  test('does not ask for elements of the own namespace', async ({page}) => {
    await setupAndDragExternalReference(app, {
      fileName: 'external-property-reference.ttl',
      elementName: 'externalProperty',
      elementSelector: SELECTOR_ecProperty,
      isSameNamespace: true,
      searchTerm: 'property',
      prefixDialog: 'keep-open',
    });
    await page.waitForTimeout(1000);
    await expect(referenceDialog(page)).toHaveCount(0);
  });

  test('the chosen prefix can be renamed later in the prefix management', async ({page}) => {
    await dragExternalProperty();
    await referenceDialog(page).getByTestId('reference-prefix-confirm').click();
    await expect(referenceDialog(page)).toHaveCount(0);
    await app.clickConnectShapes('AspectDefault', 'externalProperty');

    await openPrefixManagement(page);
    // the reference only exists in the graph so far: the dialog synchronizes the graph before it calculates the usage
    await expect(row(page, 'different')).toContainText('Used');
    await expect(row(page, 'different').getByTestId('prefix-remove')).toBeDisabled();
    await rename(page, 'different', 'diff');
    await closePrefixManagement(page);

    const rdf = await app.getUpdatedRDF();
    expect(rdf).toContain(`@prefix diff: <${DIFFERENT_NS}>`);
    expect(rdf).toContain('samm:properties (:property1 diff:externalProperty)');
  });
});
