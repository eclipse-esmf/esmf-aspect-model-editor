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

import {GlobalConfig} from 'ngx-toastr';

/**
 * Toasts are shown at the bottom center of the window. There they cover neither the toolbar, the tab bar with the view
 * toggle and the minimap at the top nor the Save/Cancel buttons of the edit dialog docked on the right.
 */
export const TOAST_CONFIG: Partial<GlobalConfig> = {positionClass: 'toast-top-center'};
