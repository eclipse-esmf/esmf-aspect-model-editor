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

import {exec} from 'child_process';
import {promisify} from 'util';

const execAsync = promisify(exec);

export async function execPromise(cmd: string): Promise<{stdout: string; stderr: string}> {
  try {
    const {stdout, stderr} = await execAsync(cmd);
    return {stdout, stderr};
  } catch (error) {
    throw error;
  }
}

export default {
  exec: execPromise,
};
