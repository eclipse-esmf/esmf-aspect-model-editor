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

import {test} from '@playwright/test';
import {AppHelper} from '../../support/app-helper';
import {SELECTOR_ecProperty} from '../../support/constants';
import {setupAndDragExternalReference} from '../../support/drag-drop-utils';

test.describe('External reference drag and drop renders only reference node without child shapes', () => {
  test('dragging external property with characteristic children renders only property shape', async ({page}) => {
    const helper = new AppHelper(page);
    await helper.visitDefault();

    await setupAndDragExternalReference(helper, {
      fileName: 'external-property-reference.ttl',
      elementName: 'externalPropertyWithChildren',
      elementSelector: SELECTOR_ecProperty,
      isSameNamespace: true,
      hasChildren: true,
      searchTerm: 'externalPropertyWithChildren',
      x: 100,
      y: 300,
    });

    // The external property reference itself should be on the canvas
    await helper.shapeExists('externalPropertyWithChildren', true);

    // Its child elements defined in the reference should NOT be created as separate canvas shapes
    await helper.shapeExists('ChildrenCharacteristic1', false);
    await helper.shapeExists('ChildrenEntity1', false);
    await helper.shapeExists('childrenProperty1', false);
  });
});
