/*
 * Copyright (c) 2024 Robert Bosch Manufacturing Solutions GmbH
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

import {CUSTOM_ELEMENTS_SCHEMA, NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FooterComponent} from './footer.component';
import {LanguageTranslateModule} from '@ame/translation';

@NgModule({
  imports: [CommonModule, LanguageTranslateModule],
  exports: [FooterComponent],
  declarations: [FooterComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class FooterModule {}
