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

import {Page, Route, expect, test} from '@playwright/test';
import {MODELS_API_ROUTE, setUpDefaultRoutes} from '../../support/api-mocks';
import {AppHelper} from '../../support/app-helper';
import {SettingsDialogSelectors} from '../../support/constants';
import {TauriHelper} from '../../support/tauri-helper';

interface SessionModel {
  namespace: string;
  file: string;
  aspectModelUrn: string;
}

const model = (name: string, namespace = 'org.eclipse.session:1.0.0'): SessionModel => ({
  namespace,
  file: `${name}.ttl`,
  aspectModelUrn: `urn:samm:${namespace}#${name}`,
});

const MODEL_A = model('ModelA');
const MODEL_B = model('ModelB');
const MODEL_C = model('ModelC', 'org.eclipse.other:2.0.0');

const turtle = ({aspectModelUrn}: SessionModel) => {
  const [namespace, name] = aspectModelUrn.split('#');
  return `@prefix samm: <urn:samm:org.eclipse.esmf.samm:meta-model:2.2.0#> .
@prefix samm-c: <urn:samm:org.eclipse.esmf.samm:characteristic:2.2.0#> .
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .
@prefix : <${namespace}#> .

:${name} a samm:Aspect ;
   samm:properties ( :${name}Property ) ;
   samm:operations ( ) ;
   samm:events ( ) .

:${name}Property a samm:Property ;
   samm:characteristic samm-c:Text .
`;
};

type ModelResponse = 'ok' | 'missing' | 'error';

const tabs = (page: Page) => page.getByTestId('editor-tab');
const activeTab = (page: Page) => page.locator('[data-testid="editor-tab"].active');
const toast = (page: Page, text: string | RegExp) => page.locator('.ngx-toastr').filter({hasText: text});

/**
 * Starts the app like the desktop shell does (through the loading route, without the e2e flag)
 * with the given window data and backend answers per model.
 */
async function startWindow(
  page: Page,
  options: {
    windowData: {id: string; options: any} | null;
    responses?: Record<string, ModelResponse>;
    isFirstWindow?: boolean;
  },
): Promise<{tauri: TauriHelper; requestedUrns: string[]}> {
  const tauri = new TauriHelper(page);
  await tauri.initTauriMock({windowData: options.windowData, isFirstWindow: options.isFirstWindow});
  await setUpDefaultRoutes(page);

  const all = [MODEL_A, MODEL_B, MODEL_C];
  const requestedUrns: string[] = [];
  await page.route(MODELS_API_ROUTE, async (route: Route) => {
    if (route.request().method() !== 'GET') {
      await route.fulfill({status: 200, contentType: 'text/plain', body: 'ok'});
      return;
    }
    const urn = route.request().headers()['aspect-model-urn'];
    requestedUrns.push(urn);
    const sessionModel = all.find(m => m.aspectModelUrn === urn);
    const response = options.responses?.[urn] ?? 'ok';

    if (!sessionModel || response === 'missing') {
      await route.fulfill({status: 404, contentType: 'application/json', body: JSON.stringify({error: {code: 404, message: 'Not found'}})});
    } else if (response === 'error') {
      await route.fulfill({status: 500, contentType: 'application/json', body: JSON.stringify({error: {code: 500, message: 'Boom'}})});
    } else {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({content: turtle(sessionModel), sourceLocation: `/workspace/${sessionModel.namespace}/${sessionModel.file}`}),
      });
    }
  });

  await page.goto('/');
  return {tauri, requestedUrns};
}

const sessionWindow = (models: SessionModel[], activeIndex = 0, id = 'main') => ({id, options: {session: {models, activeIndex}}});

async function waitUntilLoaded(page: Page): Promise<void> {
  await expect(page).toHaveURL(/\/editor/, {timeout: 20000});
  await page
    .locator('ame-loading-screen')
    .waitFor({state: 'detached', timeout: 20000})
    .catch(() => {});
  await expect(page.locator('#graph')).toBeVisible({timeout: 20000});
}

async function sessionUpdates(tauri: TauriHelper): Promise<{models: SessionModel[]; activeIndex: number}[]> {
  return (await tauri.getSentEvents('UPDATE_SESSION')).map(event => event.args[0]);
}

async function lastSessionUpdate(tauri: TauriHelper): Promise<{models: SessionModel[]; activeIndex: number}> {
  let last: {models: SessionModel[]; activeIndex: number} | undefined;
  await expect(async () => {
    const updates = await sessionUpdates(tauri);
    expect(updates.length).toBeGreaterThan(0);
    last = updates[updates.length - 1];
  }).toPass({timeout: 10000});
  return last as {models: SessionModel[]; activeIndex: number};
}

test.describe('Session restore - reopening the models of the last session', () => {
  test('reopens all models of the window as tabs in their original order', async ({page}) => {
    const {requestedUrns} = await startWindow(page, {windowData: sessionWindow([MODEL_A, MODEL_B, MODEL_C])});
    await waitUntilLoaded(page);

    await expect(tabs(page)).toHaveCount(3, {timeout: 20000});
    await expect(tabs(page).locator('.tab-title')).toHaveText(['ModelA.ttl', 'ModelB.ttl', 'ModelC.ttl']);
    expect(requestedUrns).toEqual(expect.arrayContaining([MODEL_A.aspectModelUrn, MODEL_B.aspectModelUrn, MODEL_C.aspectModelUrn]));
    await expect(tabs(page).nth(2)).toHaveAttribute('title', `${MODEL_C.namespace}:${MODEL_C.file}`);
  });

  test('activates the tab which was active when the session was saved', async ({page}) => {
    await startWindow(page, {windowData: sessionWindow([MODEL_A, MODEL_B, MODEL_C], 1)});
    await waitUntilLoaded(page);

    await expect(tabs(page)).toHaveCount(3, {timeout: 20000});
    await expect(activeTab(page).locator('.tab-title')).toHaveText('ModelB.ttl');
    await expect(new AppHelper(page).getHTMLCell('ModelB')).toBeVisible();
  });

  test('falls back to the first restored model when the saved active index is out of range', async ({page}) => {
    await startWindow(page, {windowData: sessionWindow([MODEL_A, MODEL_B], 7)});
    await waitUntilLoaded(page);

    await expect(tabs(page)).toHaveCount(2, {timeout: 20000});
    await expect(activeTab(page)).toHaveCount(1);
  });

  test('restores a single model without opening additional tabs', async ({page}) => {
    await startWindow(page, {windowData: sessionWindow([MODEL_B])});
    await waitUntilLoaded(page);

    await expect(tabs(page)).toHaveCount(1, {timeout: 20000});
    await expect(activeTab(page).locator('.tab-title')).toHaveText('ModelB.ttl');
  });

  test('restored models are not marked as changed', async ({page}) => {
    await startWindow(page, {windowData: sessionWindow([MODEL_A, MODEL_B])});
    await waitUntilLoaded(page);

    await expect(tabs(page)).toHaveCount(2, {timeout: 20000});
    await expect(page.locator('[data-testid="editor-tab"] .tab-dirty-indicator')).toHaveCount(0);
  });
});

test.describe('Session restore - models which no longer exist', () => {
  test('skips a deleted model, informs the user and opens the others', async ({page}) => {
    await startWindow(page, {
      windowData: sessionWindow([MODEL_A, MODEL_B, MODEL_C]),
      responses: {[MODEL_B.aspectModelUrn]: 'missing'},
    });
    await waitUntilLoaded(page);

    await expect(toast(page, 'The required Aspect Model ModelB.ttl could not be found.')).toBeVisible({timeout: 20000});
    await expect(toast(page, `${MODEL_B.namespace}:${MODEL_B.file}`)).toBeVisible();
    await expect(tabs(page).locator('.tab-title')).toHaveText(['ModelA.ttl', 'ModelC.ttl']);
  });

  test('reports every missing model separately', async ({page}) => {
    await startWindow(page, {
      windowData: sessionWindow([MODEL_A, MODEL_B, MODEL_C]),
      responses: {[MODEL_A.aspectModelUrn]: 'missing', [MODEL_C.aspectModelUrn]: 'missing'},
    });
    await waitUntilLoaded(page);

    await expect(toast(page, 'ModelA.ttl could not be found')).toBeVisible({timeout: 20000});
    await expect(toast(page, 'ModelC.ttl could not be found')).toBeVisible();
    await expect(tabs(page).locator('.tab-title')).toHaveText(['ModelB.ttl']);
  });

  test('activates another model when the saved active model is missing', async ({page}) => {
    await startWindow(page, {
      windowData: sessionWindow([MODEL_A, MODEL_B], 1),
      responses: {[MODEL_B.aspectModelUrn]: 'missing'},
    });
    await waitUntilLoaded(page);

    await expect(tabs(page)).toHaveCount(1, {timeout: 20000});
    await expect(activeTab(page).locator('.tab-title')).toHaveText('ModelA.ttl');
  });

  test('distinguishes models which could not be restored because of an error from missing ones', async ({page}) => {
    await startWindow(page, {
      windowData: sessionWindow([MODEL_A, MODEL_B]),
      responses: {[MODEL_A.aspectModelUrn]: 'error'},
    });
    await waitUntilLoaded(page);

    await expect(toast(page, 'The Aspect Model ModelA.ttl could not be restored.')).toBeVisible({timeout: 20000});
    await expect(toast(page, 'could not be found')).toHaveCount(0);
    await expect(tabs(page).locator('.tab-title')).toHaveText(['ModelB.ttl']);
  });

  test('opens an empty model in the main window when no model of the session exists anymore', async ({page}) => {
    const {tauri} = await startWindow(page, {
      windowData: sessionWindow([MODEL_A, MODEL_B]),
      responses: {[MODEL_A.aspectModelUrn]: 'missing', [MODEL_B.aspectModelUrn]: 'missing'},
    });

    // the warnings disappear after 10s, so check them before waiting for the empty model
    await expect(toast(page, 'ModelA.ttl could not be found')).toBeVisible({timeout: 20000});
    await expect(toast(page, 'ModelB.ttl could not be found')).toBeVisible();
    await waitUntilLoaded(page);
    await expect(tabs(page)).toHaveCount(1);
    await expect(tabs(page).locator('.tab-title')).not.toHaveText(/Model[AB]\.ttl/);
    expect(await tauri.getSentEvents('CLOSE_WINDOW')).toEqual([]);
  });

  test('closes an additional window when none of its models exists anymore', async ({page}) => {
    const {tauri} = await startWindow(page, {
      windowData: sessionWindow([MODEL_C], 0, 'window-2'),
      responses: {[MODEL_C.aspectModelUrn]: 'missing'},
      isFirstWindow: false,
    });

    await expect(async () => {
      expect(await tauri.getSentEvents('CLOSE_WINDOW')).toEqual([{channel: 'CLOSE_WINDOW', args: ['window-2']}]);
    }).toPass({timeout: 20000});
  });

  test('keeps an additional window open when at least one of its models exists', async ({page}) => {
    const {tauri} = await startWindow(page, {
      windowData: sessionWindow([MODEL_B, MODEL_C], 0, 'window-2'),
      responses: {[MODEL_C.aspectModelUrn]: 'missing'},
      isFirstWindow: false,
    });
    await waitUntilLoaded(page);

    await expect(tabs(page).locator('.tab-title')).toHaveText(['ModelB.ttl'], {timeout: 20000});
    expect(await tauri.getSentEvents('CLOSE_WINDOW')).toEqual([]);
  });
});

test.describe('Session restore - keeping the session up to date', () => {
  test('publishes the restored models once the restore is finished', async ({page}) => {
    const {tauri} = await startWindow(page, {windowData: sessionWindow([MODEL_A, MODEL_B, MODEL_C], 2)});
    await waitUntilLoaded(page);
    await expect(tabs(page)).toHaveCount(3, {timeout: 20000});

    const session = await lastSessionUpdate(tauri);
    expect(session).toEqual({models: [MODEL_A, MODEL_B, MODEL_C], activeIndex: 2});

    // A restore in progress must never overwrite the stored session with an incomplete state.
    for (const update of await sessionUpdates(tauri)) {
      expect(update.models).toEqual([MODEL_A, MODEL_B, MODEL_C]);
    }
  });

  test('removes a missing model from the stored session', async ({page}) => {
    const {tauri} = await startWindow(page, {
      windowData: sessionWindow([MODEL_A, MODEL_B, MODEL_C]),
      responses: {[MODEL_B.aspectModelUrn]: 'missing'},
    });
    await waitUntilLoaded(page);
    await expect(tabs(page)).toHaveCount(2, {timeout: 20000});

    await expect(async () => {
      expect((await lastSessionUpdate(tauri)).models).toEqual([MODEL_A, MODEL_C]);
    }).toPass({timeout: 10000});
  });

  test('removes a model from the session when its tab is closed', async ({page}) => {
    const {tauri} = await startWindow(page, {windowData: sessionWindow([MODEL_A, MODEL_B, MODEL_C])});
    await waitUntilLoaded(page);
    await expect(tabs(page)).toHaveCount(3, {timeout: 20000});
    await expect(async () => expect((await lastSessionUpdate(tauri)).models).toHaveLength(3)).toPass({timeout: 10000});

    await tabs(page).filter({hasText: 'ModelC.ttl'}).getByTestId('editor-tab-close').click();
    await expect(tabs(page)).toHaveCount(2);

    await expect(async () => {
      expect((await lastSessionUpdate(tauri)).models).toEqual([MODEL_A, MODEL_B]);
    }).toPass({timeout: 10000});
  });

  test('stores the newly active tab when the user switches tabs', async ({page}) => {
    const {tauri} = await startWindow(page, {windowData: sessionWindow([MODEL_A, MODEL_B, MODEL_C], 0)});
    await waitUntilLoaded(page);
    await expect(tabs(page)).toHaveCount(3, {timeout: 20000});
    await expect(async () => expect((await lastSessionUpdate(tauri)).activeIndex).toBe(0)).toPass({timeout: 10000});

    await tabs(page).filter({hasText: 'ModelC.ttl'}).click();
    await expect(activeTab(page).locator('.tab-title')).toHaveText('ModelC.ttl');

    await expect(async () => {
      expect(await lastSessionUpdate(tauri)).toEqual({models: [MODEL_A, MODEL_B, MODEL_C], activeIndex: 2});
    }).toPass({timeout: 10000});
  });

  test('does not publish the same session twice', async ({page}) => {
    const {tauri} = await startWindow(page, {windowData: sessionWindow([MODEL_A, MODEL_B])});
    await waitUntilLoaded(page);
    await expect(tabs(page)).toHaveCount(2, {timeout: 20000});
    await lastSessionUpdate(tauri);

    await page.waitForTimeout(1000);
    const updates = await sessionUpdates(tauri);
    const serialized = updates.map(update => JSON.stringify(update));
    for (let i = 1; i < serialized.length; i++) {
      expect(serialized[i]).not.toBe(serialized[i - 1]);
    }
  });

  test('does not store new, unsaved models in the session', async ({page}) => {
    const {tauri} = await startWindow(page, {windowData: {id: 'main', options: null}});
    await waitUntilLoaded(page);

    await expect(tabs(page)).toHaveCount(1, {timeout: 20000});
    expect(await lastSessionUpdate(tauri)).toEqual({models: [], activeIndex: 0});
  });

  test('a window without a saved session starts with an empty model', async ({page}) => {
    const {requestedUrns} = await startWindow(page, {windowData: {id: 'main', options: null}});
    await waitUntilLoaded(page);

    await expect(tabs(page)).toHaveCount(1, {timeout: 20000});
    expect(requestedUrns).toEqual([]);
    await expect(toast(page, /could not be (found|restored)/)).toHaveCount(0);
  });

  test('an empty session is treated like no session', async ({page}) => {
    const {requestedUrns} = await startWindow(page, {windowData: sessionWindow([])});
    await waitUntilLoaded(page);

    await expect(tabs(page)).toHaveCount(1, {timeout: 20000});
    expect(requestedUrns).toEqual([]);
  });

  test('does not track the session in the e2e/browser mode', async ({page}) => {
    const tauri = new TauriHelper(page);
    await tauri.initTauriMock();
    await new AppHelper(page).visitDefault();

    await page.waitForTimeout(1000);
    expect(await tauri.getSentEvents('UPDATE_SESSION')).toEqual([]);
    expect(await tauri.getSentEvents('SET_SESSION_RESTORE')).toEqual([]);
  });
});

test.describe('Session restore - setting', () => {
  const EDITOR_SETTINGS = /^\s*Editor\s*$/;

  test('the restore setting is enabled by default and reported to the desktop shell', async ({page}) => {
    const {tauri} = await startWindow(page, {windowData: {id: 'main', options: null}});
    await waitUntilLoaded(page);

    await expect(async () => {
      expect(await tauri.getSentEvents('SET_SESSION_RESTORE')).toEqual([{channel: 'SET_SESSION_RESTORE', args: [true]}]);
    }).toPass({timeout: 10000});

    const app = new AppHelper(page);
    await app.openSettings(EDITOR_SETTINGS);
    await expect(page.getByTestId('restoreSessionToggle').locator('button[role="switch"]')).toHaveAttribute('aria-checked', 'true');
  });

  test('disabling the setting is reported to the desktop shell and persisted', async ({page}) => {
    const {tauri} = await startWindow(page, {windowData: {id: 'main', options: null}});
    await waitUntilLoaded(page);
    await expect(async () => expect(await tauri.getSentEvents('SET_SESSION_RESTORE')).toHaveLength(1)).toPass({timeout: 10000});

    const app = new AppHelper(page);
    await app.openSettings(EDITOR_SETTINGS);
    await page.getByTestId('restoreSessionToggle').locator('button[role="switch"]').click();
    await app.closeDialog(SettingsDialogSelectors.settingsDialogOkButton);

    await expect(async () => {
      const events = await tauri.getSentEvents('SET_SESSION_RESTORE');
      expect(events.map(event => event.args[0])).toEqual([true, false]);
    }).toPass({timeout: 10000});

    await app.openSettings(EDITOR_SETTINGS);
    await expect(page.getByTestId('restoreSessionToggle').locator('button[role="switch"]')).toHaveAttribute('aria-checked', 'false');
    await app.closeDialog(SettingsDialogSelectors.settingsDialogCancelButton);

    // Reopening the window keeps the setting and reports it again.
    await tauri.clearSentEvents();
    await page.goto('/');
    await waitUntilLoaded(page);
    await expect(async () => {
      expect((await tauri.getSentEvents('SET_SESSION_RESTORE')).map(event => event.args[0])).toEqual([false]);
    }).toPass({timeout: 10000});
  });

  test('cancelling the settings dialog does not change the setting', async ({page}) => {
    const {tauri} = await startWindow(page, {windowData: {id: 'main', options: null}});
    await waitUntilLoaded(page);
    await expect(async () => expect(await tauri.getSentEvents('SET_SESSION_RESTORE')).toHaveLength(1)).toPass({timeout: 10000});

    const app = new AppHelper(page);
    await app.openSettings(EDITOR_SETTINGS);
    await page.getByTestId('restoreSessionToggle').locator('button[role="switch"]').click();
    await app.closeDialog(SettingsDialogSelectors.settingsDialogCancelButton);

    await page.waitForTimeout(500);
    expect((await tauri.getSentEvents('SET_SESSION_RESTORE')).map(event => event.args[0])).toEqual([true]);
  });
});
