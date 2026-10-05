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
import {API_BASE_URL, NAMESPACES_URL, REFERENCES_API_URL, SAMM_VERSION_ACTUAL, setUpDefaultRoutes} from '../../support/api-mocks';
import {AppHelper} from '../../support/app-helper';
import {SELECTOR_workspaceBtn} from '../../support/constants';
import {readFixture} from '../../support/drag-drop-utils';
import {TauriHelper} from '../../support/tauri-helper';

interface ReferenceReport {
  deletable: boolean;
  references: {namespace: string; version: string; fileName: string; referencedElements: string[]}[];
  unreadableFiles: {namespace: string; version: string; fileName: string; message: string}[];
}

const DELETABLE: ReferenceReport = {deletable: true, references: [], unreadableFiles: []};
const USED_BY_B1: ReferenceReport = {
  deletable: false,
  references: [{namespace: 'org.b', version: '1.0.0', fileName: 'B1.ttl', referencedElements: ['urn:samm:org.a:1.0.0#sharedProperty']}],
  unreadableFiles: [],
};

type Files = Record<string, string[]>;

const WORKSPACE: Files = {'org.a:1.0.0': ['A1.ttl', 'A2.ttl'], 'org.b:1.0.0': ['B1.ttl']};

/** Records the deletion requests and answers them like the backend. */
class BackendMock {
  readonly referenceChecks: URL[] = [];
  readonly deletes: URL[] = [];
  references: ReferenceReport = DELETABLE;
  deleteStatus = 200;
  deleteBody: unknown = DELETABLE;

  constructor(private readonly page: Page) {}

  async install(files: Files): Promise<void> {
    await setUpDefaultRoutes(this.page);
    await this.page.route(`**${NAMESPACES_URL}`, route => route.fulfill({json: namespacesOf(files)}));
    await this.page.route(`**${API_BASE_URL}/models/batch`, route => route.fulfill({json: batchOf(files)}));
    await this.page.route(REFERENCES_API_URL, route => {
      this.referenceChecks.push(new URL(route.request().url()));
      return route.fulfill({json: this.references});
    });
    await this.page.route(`${API_BASE_URL}/models/namespace*`, route => this.answerDelete(route));
    await this.page.route(`${API_BASE_URL}/models/workspace*`, route => this.answerDelete(route, {deletedFiles: 3, backupCreated: true}));
    await this.page.route(`${API_BASE_URL}/models`, route =>
      route.request().method() === 'DELETE' ? this.answerDelete(route, null) : route.fallback(),
    );
  }

  private answerDelete(route: Route, okBody: unknown = this.deleteBody): Promise<void> {
    if (route.request().method() !== 'DELETE') return route.fallback();
    this.deletes.push(new URL(route.request().url()));
    return this.deleteStatus === 200 ? route.fulfill({json: okBody}) : route.fulfill({status: this.deleteStatus, json: this.deleteBody});
  }
}

function namespacesOf(files: Files) {
  const result: Record<string, unknown[]> = {};
  for (const [key, names] of Object.entries(files)) {
    const [namespace, version] = key.split(':');
    result[namespace] = [
      ...(result[namespace] ?? []),
      {
        version,
        models: names.map(name => ({
          name,
          model: name,
          aspectModelUrn: `urn:samm:${namespace}:${version}#${name.replace('.ttl', '')}`,
          version: SAMM_VERSION_ACTUAL,
          existing: true,
        })),
      },
    ];
  }
  return result;
}

function batchOf(files: Files) {
  return Object.entries(files).flatMap(([key, names]) =>
    names.map(name => {
      const [namespace, version] = key.split(':');
      return {
        aspectModelUrn: `urn:samm:${namespace}:${version}#${name.replace('.ttl', '')}`,
        aspectModel: readFixture('default-models/aspect-default.txt'),
        absoluteName: `${key}:${name}`,
        fileName: name,
        modelVersion: SAMM_VERSION_ACTUAL,
      };
    }),
  );
}

async function openWorkspace(page: Page, backend: BackendMock, files: Files = WORKSPACE): Promise<void> {
  await backend.install(files);
  await new AppHelper(page).startModelling(false);
  await page.locator(SELECTOR_workspaceBtn).click({force: true});
  await expect(page.getByTestId('workspaceClearButton')).toBeVisible();
}

async function openNamespaceMenu(page: Page, namespaceKey: string): Promise<void> {
  await page.getByTestId(`workspace-namespace-${namespaceKey}`).getByTestId('openNamespaceMenu').click();
}

async function openFileMenu(page: Page, fileName: string): Promise<void> {
  await page.getByTestId(`workspace-file-${fileName}`).getByTestId('openFileMenu').click();
}

const dialog = (page: Page) => page.locator('mat-dialog-container');
const tooltip = (page: Page) => page.locator('.mat-mdc-tooltip-show');

test.describe('Workspace deletion', () => {
  let backend: BackendMock;

  test.beforeEach(async ({page}) => {
    backend = new BackendMock(page);
  });

  test.describe('namespace', () => {
    test.beforeEach(async ({page}) => openWorkspace(page, backend));

    test('every namespace row has its own menu that does not fold the namespace', async ({page}) => {
      await expect(page.getByTestId('openNamespaceMenu')).toHaveCount(2);

      await openNamespaceMenu(page, 'org.a:1.0.0');

      await expect(page.getByTestId('namespaceMenuDeleteButton')).toBeEnabled();
      await expect(page.getByTestId('workspace-file-A1.ttl')).toBeVisible();
    });

    test('a namespace used by another namespace cannot be deleted and the users are listed', async ({page}) => {
      backend.references = USED_BY_B1;

      await openNamespaceMenu(page, 'org.a:1.0.0');
      await page.getByTestId('namespaceMenuDeleteButton').click();

      await expect(dialog(page)).toBeVisible();
      const items = page.getByTestId('references-item');
      await expect(items).toHaveCount(1);
      await expect(items.first()).toContainText('B1.ttl');
      await expect(items.first()).toContainText('org.b:1.0.0');
      await expect(items.first().locator('code')).toHaveText('org.a:1.0.0#sharedProperty');
      await expect(dialog(page).getByTestId('okBtn')).toHaveCount(0);

      expect(backend.referenceChecks).toHaveLength(1);
      expect(backend.referenceChecks[0].searchParams.get('namespace')).toBe('org.a');
      expect(backend.referenceChecks[0].searchParams.get('version')).toBe('1.0.0');
      expect(backend.referenceChecks[0].searchParams.has('fileName')).toBe(false);

      await page.keyboard.press('Escape');
      await expect(dialog(page)).toBeHidden();
      expect(backend.deletes).toHaveLength(0);
      await expect(page.getByTestId('workspace-file-A1.ttl')).toBeVisible();
    });

    test('files that could not be checked block the deletion as well', async ({page}) => {
      backend.references = {
        deletable: false,
        references: [],
        unreadableFiles: [{namespace: 'org.c', version: '1.0.0', fileName: 'Broken.ttl', message: 'Out of place: [KEYWORD:this]'}],
      };

      await openNamespaceMenu(page, 'org.a:1.0.0');
      await page.getByTestId('namespaceMenuDeleteButton').click();

      await expect(page.getByTestId('unreadable-item')).toContainText('Broken.ttl');
      await expect(page.getByTestId('unreadable-item')).toContainText('Out of place');
      await page.getByTestId('references-dialog-close').click();
      expect(backend.deletes).toHaveLength(0);
    });

    test('an unused namespace is deleted after a clear warning', async ({page}) => {
      await openNamespaceMenu(page, 'org.a:1.0.0');
      await page.getByTestId('namespaceMenuDeleteButton').click();

      await expect(dialog(page)).toContainText('org.a:1.0.0');
      await expect(dialog(page)).toContainText('2');
      await dialog(page).getByTestId('okBtn').click();

      await expect.poll(() => backend.deletes.length).toBe(1);
      expect(backend.deletes[0].pathname).toMatch(/\/models\/namespace$/);
      expect(backend.deletes[0].searchParams.get('namespace')).toBe('org.a');
      expect(backend.deletes[0].searchParams.get('version')).toBe('1.0.0');
    });

    for (const dismiss of ['cancel', 'Escape'] as const) {
      test(`dismissing the warning via ${dismiss} deletes nothing`, async ({page}) => {
        await openNamespaceMenu(page, 'org.b:1.0.0');
        await page.getByTestId('namespaceMenuDeleteButton').click();
        await expect(dialog(page)).toBeVisible();

        if (dismiss === 'Escape') await page.keyboard.press('Escape');
        else await dialog(page).getByTestId('cancelBtn').click();

        await expect(dialog(page)).toBeHidden();
        await page.waitForTimeout(300);
        expect(backend.deletes).toHaveLength(0);
      });
    }

    test('a reference added in the meantime (409 of the backend) is shown instead of deleting', async ({page}) => {
      backend.deleteStatus = 409;
      backend.deleteBody = USED_BY_B1;

      await openNamespaceMenu(page, 'org.a:1.0.0');
      await page.getByTestId('namespaceMenuDeleteButton').click();
      await dialog(page).getByTestId('okBtn').click();

      await expect(page.getByTestId('references-item')).toContainText('B1.ttl');
      expect(backend.deletes).toHaveLength(1);
    });
  });

  test.describe('single file', () => {
    test.beforeEach(async ({page}) => openWorkspace(page, backend));

    test('a file used by another file cannot be deleted', async ({page}) => {
      backend.references = USED_BY_B1;

      await openFileMenu(page, 'A1.ttl');
      await page.getByTestId('fileMenuDeleteButton').click();

      await expect(page.getByTestId('references-item')).toContainText('B1.ttl');
      expect(backend.referenceChecks[0].searchParams.get('fileName')).toBe('A1.ttl');
      await expect(dialog(page).getByTestId('okBtn')).toHaveCount(0);

      await page.getByTestId('references-dialog-close').click();
      expect(backend.deletes).toHaveLength(0);
    });

    test('every file that uses the model is listed', async ({page}) => {
      backend.references = {
        deletable: false,
        references: [
          {namespace: 'org.b', version: '1.0.0', fileName: 'B1.ttl', referencedElements: ['urn:samm:org.a:1.0.0#sharedProperty']},
          {namespace: 'org.b', version: '1.0.0', fileName: 'B2.ttl', referencedElements: ['urn:samm:org.a:1.0.0#sharedProperty']},
          {namespace: 'org.c', version: '2.0.0', fileName: 'C1.ttl', referencedElements: ['urn:samm:org.a:1.0.0#Other']},
        ],
        unreadableFiles: [],
      };

      await openFileMenu(page, 'A1.ttl');
      await page.getByTestId('fileMenuDeleteButton').click();

      const items = page.getByTestId('references-item');
      await expect(items).toHaveCount(3);
      await expect(items.nth(0)).toContainText('B1.ttl');
      await expect(items.nth(1)).toContainText('B2.ttl');
      await expect(items.nth(2)).toContainText('C1.ttl');
      await expect(items.nth(2)).toContainText('org.c');
      expect(backend.deletes).toHaveLength(0);
    });

    test('a deletable file shows no tooltip on the delete entry', async ({page}) => {
      await openFileMenu(page, 'B1.ttl');
      await page.getByTestId('fileMenuDeleteTooltip').hover();
      await page.waitForTimeout(300);
      await expect(tooltip(page)).toHaveCount(0);
    });

    test('a file only using others is deleted after the confirmation', async ({page}) => {
      await openFileMenu(page, 'B1.ttl');
      await page.getByTestId('fileMenuDeleteButton').click();
      await dialog(page).getByTestId('okBtn').click();

      await expect.poll(() => backend.deletes.length).toBe(1);
      expect(backend.referenceChecks[0].searchParams.get('namespace')).toBe('org.b');
      expect(backend.referenceChecks[0].searchParams.get('fileName')).toBe('B1.ttl');
    });
  });

  test.describe('clear workspace', () => {
    test.beforeEach(async ({page}) => openWorkspace(page, backend));

    test('needs the typed confirmation and creates a backup by default', async ({page}) => {
      await page.getByTestId('workspaceClearButton').click();

      await expect(page.getByTestId('clear-workspace-warning')).toContainText('3');
      await expect(page.getByTestId('clear-workspace-backup').locator('input')).toBeChecked();
      const ok = page.getByTestId('clear-workspace-ok');
      await expect(ok).toBeDisabled();

      await page.getByTestId('clear-workspace-confirm-input').fill('clear');
      await expect(ok).toBeDisabled();
      await page.getByTestId('clear-workspace-confirm-input').fill('CLEAR');
      await expect(ok).toBeEnabled();
      await ok.click();

      await expect.poll(() => backend.deletes.length).toBe(1);
      expect(backend.deletes[0].pathname).toMatch(/\/models\/workspace$/);
      expect(backend.deletes[0].searchParams.get('backup')).toBe('true');
      await expect(dialog(page)).toBeHidden();
    });

    test('can clear without backup', async ({page}) => {
      await page.getByTestId('workspaceClearButton').click();
      await page.getByTestId('clear-workspace-backup').locator('input').uncheck();
      await page.getByTestId('clear-workspace-confirm-input').fill('CLEAR');
      await page.getByTestId('clear-workspace-confirm-input').press('Enter');

      await expect.poll(() => backend.deletes.length).toBe(1);
      expect(backend.deletes[0].searchParams.get('backup')).toBe('false');
    });

    test('a click outside does not close the dialog; Escape and (x) close it without deleting', async ({page}) => {
      await page.getByTestId('workspaceClearButton').click();
      await page.getByTestId('clear-workspace-confirm-input').fill('CLEAR');

      await page
        .locator('.cdk-overlay-backdrop')
        .last()
        .click({position: {x: 5, y: 5}, force: true});
      await expect(dialog(page)).toBeVisible();

      await page.keyboard.press('Escape');
      await expect(dialog(page)).toBeHidden();

      await page.getByTestId('workspaceClearButton').click();
      await dialog(page).getByTestId('dialog-close-button').click();
      await expect(dialog(page)).toBeHidden();

      await page.waitForTimeout(300);
      expect(backend.deletes).toHaveLength(0);
    });

    test('the dialog stays usable on a small screen', async ({page}) => {
      await page.setViewportSize({width: 480, height: 420});
      await page.getByTestId('workspaceClearButton').click();

      const box = await dialog(page).boundingBox();
      expect(box.x).toBeGreaterThanOrEqual(0);
      expect(box.x + box.width).toBeLessThanOrEqual(480);
      await page.getByTestId('clear-workspace-confirm-input').fill('CLEAR');
      await expect(page.getByTestId('clear-workspace-ok')).toBeInViewport();
      await expect(page.getByTestId('clear-workspace-cancel')).toBeInViewport();
    });
  });

  test.describe('with the opened model in the workspace', () => {
    const files: Files = {...WORKSPACE, 'org.eclipse.examples.aspect:1.0.0': ['AspectDefault.ttl', 'Other.ttl']};

    test.beforeEach(async ({page}) => openWorkspace(page, backend, files));

    test('the namespace of the opened model cannot be deleted, others can', async ({page}) => {
      await openNamespaceMenu(page, 'org.eclipse.examples.aspect:1.0.0');
      await expect(page.getByTestId('namespaceMenuDeleteButton')).toBeDisabled();
      await page.keyboard.press('Escape');

      await openNamespaceMenu(page, 'org.b:1.0.0');
      await expect(page.getByTestId('namespaceMenuDeleteButton')).toBeEnabled();
    });

    test('the namespace delete entry explains why it is disabled', async ({page}) => {
      await openNamespaceMenu(page, 'org.eclipse.examples.aspect:1.0.0');
      await page.getByTestId('namespaceMenuDeleteTooltip').hover();
      await expect(tooltip(page)).toContainText('Close all models of this namespace version in this window');
    });

    test('the workspace cannot be cleared while a workspace model is open', async ({page}) => {
      const clear = page.getByTestId('workspaceClearButton');
      await expect(clear).toBeDisabled();

      await page.locator('.clear-wrapper').hover();
      await expect(tooltip(page)).toContainText('Close all workspace models in this window');
    });

    test('the opened file cannot be deleted and the tooltip explains why', async ({page}) => {
      await openFileMenu(page, 'AspectDefault.ttl');
      await expect(page.getByTestId('fileMenuDeleteButton')).toBeDisabled();

      await page.getByTestId('fileMenuDeleteTooltip').hover();
      await expect(tooltip(page)).toContainText('open in a tab of this window');
    });

    test('other files of the namespace can still be deleted', async ({page}) => {
      await openFileMenu(page, 'Other.ttl');
      await expect(page.getByTestId('fileMenuDeleteButton')).toBeEnabled();
    });
  });

  test.describe('with a model open in another window (desktop app)', () => {
    let tauri: TauriHelper;

    test.beforeEach(async ({page}) => {
      tauri = new TauriHelper(page);
      await tauri.initTauriMock({
        openModels: [
          {label: 'main', models: [{namespace: 'org.b:1.0.0', file: 'B1.ttl'}]},
          {label: 'window-2', models: [{namespace: 'org.a:1.0.0', file: 'A1.ttl', aspectModelUrn: 'urn:samm:org.a:1.0.0#A1'}]},
        ],
      });
      await openWorkspace(page, backend);
    });

    test('the file cannot be deleted and the tooltip names the other window', async ({page}) => {
      await openFileMenu(page, 'A1.ttl');
      await expect(page.getByTestId('fileMenuDeleteButton')).toBeDisabled();

      await page.getByTestId('fileMenuDeleteTooltip').hover();
      await expect(tooltip(page)).toContainText('open in another window');
      expect(backend.referenceChecks).toHaveLength(0);
    });

    test('other files of that namespace stay deletable', async ({page}) => {
      await openFileMenu(page, 'A2.ttl');
      await expect(page.getByTestId('fileMenuDeleteButton')).toBeEnabled();
    });

    test('the namespace cannot be deleted', async ({page}) => {
      await openNamespaceMenu(page, 'org.a:1.0.0');
      await expect(page.getByTestId('namespaceMenuDeleteButton')).toBeDisabled();

      await page.getByTestId('namespaceMenuDeleteTooltip').hover();
      await expect(tooltip(page)).toContainText('open in another window');
    });

    test('models reported for this window itself are ignored', async ({page}) => {
      await openNamespaceMenu(page, 'org.b:1.0.0');
      await expect(page.getByTestId('namespaceMenuDeleteButton')).toBeEnabled();
    });

    test('the workspace cannot be cleared', async ({page}) => {
      await expect(page.getByTestId('workspaceClearButton')).toBeDisabled();

      await page.locator('.clear-wrapper').hover();
      await expect(tooltip(page)).toContainText('open in another window');
    });

    test('everything is deletable again once the other window closes its model', async ({page}) => {
      await expect(page.getByTestId('workspaceClearButton')).toBeDisabled();

      await tauri.emitOpenModels([{label: 'main', models: []}]);

      await expect(page.getByTestId('workspaceClearButton')).toBeEnabled();
      await openFileMenu(page, 'A1.ttl');
      await expect(page.getByTestId('fileMenuDeleteButton')).toBeEnabled();
    });

    test('a model opened later in another window blocks immediately', async ({page}) => {
      await tauri.emitOpenModels([{label: 'window-3', models: [{namespace: 'org.b:1.0.0', file: 'B1.ttl'}]}]);

      await openFileMenu(page, 'B1.ttl');
      await expect(page.getByTestId('fileMenuDeleteButton')).toBeDisabled();
      await page.keyboard.press('Escape');
      await openFileMenu(page, 'A1.ttl');
      await expect(page.getByTestId('fileMenuDeleteButton')).toBeEnabled();
    });
  });

  test('the workspace cannot be cleared when it is empty', async ({page}) => {
    await openWorkspace(page, backend, {});
    await expect(page.getByTestId('workspaceClearButton')).toBeDisabled();

    await page.locator('.clear-wrapper').hover();
    await expect(tooltip(page)).toContainText('The workspace is empty');
  });
});
