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
import {
  FIELD_characteristicName,
  FIELD_constraintName,
  FIELD_descriptionen,
  FIELD_name,
  FIELD_preferredNameen,
  SELECTOR_ecCharacteristic,
  SELECTOR_ecConstraint,
  SELECTOR_elementBtn,
} from '../../support/constants';
import {dragElementToGraph, readFixture} from '../../support/drag-drop-utils';

const constraintClassTypes = [
  'EncodingConstraint',
  'FixedPointConstraint',
  'LanguageConstraint',
  'LengthConstraint',
  'LocaleConstraint',
  'RangeConstraint',
  'RegularExpressionConstraint',
];

const characteristicClassTypes = [
  'Characteristic',
  'Code',
  'Collection',
  'Duration',
  'Either',
  'List',
  'Measurement',
  'Quantifiable',
  'Set',
  'SortedSet',
  'SingleEntity',
  'State',
  'TimeSeries',
];

test.describe('Change class behavior tests', () => {
  test('should preserve field values when changing constraint class types', async ({page}) => {
    test.slow();
    const helper = new AppHelper(page);
    await helper.visitDefault();

    const defaultRdf = readFixture('default-models/aspect-default.txt');
    await helper.loadModel(defaultRdf);

    await page.locator(SELECTOR_elementBtn).click();
    await dragElementToGraph(page, SELECTOR_ecConstraint, 350, 300);

    await helper.dbClickShape('EncodingConstraint1');
    await page.locator(FIELD_name).fill('ChangedConstraintName');
    await page.locator(FIELD_descriptionen).fill('Changed Description');
    await page.locator(FIELD_preferredNameen).fill('Changed Preferred Name');

    for (const classType of constraintClassTypes) {
      await page.locator(FIELD_constraintName).click();
      const option = page.locator(`mat-option[data-testid="${classType}"]`);
      await option.waitFor({state: 'visible'});
      await option.click();
      await option.waitFor({state: 'detached'}).catch(() => {});
      await expect(page.locator(FIELD_name)).toHaveValue('ChangedConstraintName');
      await expect(page.locator(FIELD_descriptionen)).toHaveValue('Changed Description');
      await expect(page.locator(FIELD_preferredNameen)).toHaveValue('Changed Preferred Name');
    }
  });

  test('should preserve field values when changing characteristic class types', async ({page}) => {
    test.slow();
    const helper = new AppHelper(page);
    await helper.visitDefault();

    const defaultRdf = readFixture('default-models/aspect-default.txt');
    await helper.loadModel(defaultRdf);

    await page.locator(SELECTOR_elementBtn).click();
    await dragElementToGraph(page, SELECTOR_ecCharacteristic, 350, 300);

    await helper.dbClickShape('Characteristic1');
    await page.locator(FIELD_name).fill('ChangedCharacteristicName');
    await page.locator(FIELD_descriptionen).fill('Changed Description');
    await page.locator(FIELD_preferredNameen).fill('Changed Preferred Name');

    for (const classType of characteristicClassTypes) {
      await page.locator(FIELD_characteristicName).click();
      const option = page.locator(`mat-option[data-testid="${classType}"]`);
      await option.waitFor({state: 'visible'});
      await option.click();
      await option.waitFor({state: 'detached'}).catch(() => {});
      await expect(page.locator(FIELD_name)).toHaveValue('ChangedCharacteristicName');
      await expect(page.locator(FIELD_descriptionen)).toHaveValue('Changed Description');
      await expect(page.locator(FIELD_preferredNameen)).toHaveValue('Changed Preferred Name');
    }
  });
});
