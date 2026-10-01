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
import {SettingsDialogSelectors} from '../../support/constants';

const MODEL = `@prefix samm: <urn:samm:org.eclipse.esmf.samm:meta-model:2.2.0#> .
@prefix samm-c: <urn:samm:org.eclipse.esmf.samm:characteristic:2.2.0#> .
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .
@prefix : <urn:samm:org.eclipse.examples:1.0.0#> .

:LabelAspect a samm:Aspect ;
    samm:properties ( :status :choice ) ;
    samm:operations ( :doIt ) ;
    samm:events () .

:doIt a samm:Operation ;
    samm:input ( :inProp ) ;
    samm:output :outProp .

:inProp a samm:Property ; samm:characteristic samm-c:Text .
:outProp a samm:Property ; samm:characteristic samm-c:Text .

:choice a samm:Property ; samm:characteristic :LeftOrRight .
:LeftOrRight a samm-c:Either ;
    samm-c:left :LeftChar ;
    samm-c:right :RightChar .
:LeftChar a samm:Characteristic ; samm:dataType xsd:string .
:RightChar a samm:Characteristic ; samm:dataType xsd:int .

:status a samm:Property ; samm:characteristic :StatusEnum .
:StatusEnum a samm-c:Enumeration ;
    samm:dataType :StatusEntity ;
    samm-c:values ( :Active ) .
:StatusEntity a samm:Entity ;
    samm:properties ( :code [ samm:property :label ; samm:notInPayload true ] ) .
:code a samm:Property ; samm:characteristic samm-c:Text .
:label a samm:Property ; samm:characteristic samm-c:Text .
:Active a :StatusEntity ; :code "A" .
`;

test.describe('Display disambiguation labels setting', () => {
  test('shows labels for operation input/output, either left/right and notInPayload and hides them when disabled', async ({page}) => {
    const app = new AppHelper(page);
    await app.visitDefault();
    await app.loadModel(MODEL);

    const labels = page.locator('#graph .edge-label');
    await expect(labels.filter({hasText: /^input$/})).toHaveCount(1);
    await expect(labels.filter({hasText: /^output$/})).toHaveCount(1);
    await expect(labels.filter({hasText: /^left$/})).toHaveCount(1);
    await expect(labels.filter({hasText: /^right$/})).toHaveCount(1);
    await expect(labels.filter({hasText: /^not in payload$/})).toHaveCount(1);

    await app.openSettings(/^Editor$/);
    const toggle = page.locator('[data-testid="connectionLabelsToggle"] button[role="switch"]');
    await expect(toggle).toHaveAttribute('aria-checked', 'true');
    await toggle.click();
    await app.closeDialog(SettingsDialogSelectors.settingsDialogOkButton);
    await expect(labels).toHaveCount(0);

    await app.openSettings(/^Editor$/);
    await expect(toggle).toHaveAttribute('aria-checked', 'false');
    await toggle.click();
    await app.closeDialog(SettingsDialogSelectors.settingsDialogOkButton);
    await expect(labels).toHaveCount(5);
  });
});
