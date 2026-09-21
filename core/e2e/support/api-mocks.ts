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

import {Page, Route} from '@playwright/test';

export const API_BASE_URL = 'http://localhost:9090/ame/api';
export const MODELS_API_URL = `${API_BASE_URL}/models`;
export const NAMESPACES_URL = `${API_BASE_URL}/models/namespaces*`;
export const VALIDATE_API_URL = `${API_BASE_URL}/models/validate`;
export const FORMAT_API_URL = `${API_BASE_URL}/models/format`;
export const CHECK_ELEMENT_API_URL = `${API_BASE_URL}/models/check-element*`;
export const MODELS_BATCH_API_URL = `${API_BASE_URL}/models/batch`;

export const SAMM_VERSION_ACTUAL = '2.2.0';

export async function setUpDefaultRoutes(page: Page): Promise<void> {
  await page.route(CHECK_ELEMENT_API_URL, async (route: Route) => {
    await route.fulfill({status: 200, contentType: 'application/json', body: 'false'});
  });

  await page.route(VALIDATE_API_URL, async (route: Route) => {
    await route.fulfill({status: 200, contentType: 'application/json', body: JSON.stringify({violationErrors: []})});
  });

  await page.route(FORMAT_API_URL, async (route: Route) => {
    await route.fulfill({status: 200, contentType: 'text/plain', body: ''});
  });

  await page.route(MODELS_API_URL, async (route: Route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({status: 200, contentType: 'application/json', body: JSON.stringify({content: '', sourceLocation: null})});
    } else {
      await route.fulfill({status: 200, contentType: 'text/plain', body: 'ok'});
    }
  });

  await page.route(MODELS_BATCH_API_URL, async (route: Route) => {
    await route.fulfill({status: 200, contentType: 'application/json', body: '[]'});
  });

  await page.route(NAMESPACES_URL, async (route: Route) => {
    await route.fulfill({status: 200, contentType: 'application/json', body: '{}'});
  });
}
