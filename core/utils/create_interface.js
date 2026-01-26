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

/**
 * This script created interfaces based on a translation json file
 */

const fs = require('fs');
const prettier = require('prettier');
const path = require('path');

console.log(process.argv);

const from = path.normalize(__dirname + path.sep + process.argv[2]) || '/path/to/en.json'; // or other language.json
const to = path.normalize(__dirname + path.sep + process.argv[3]) || 'path/to/language.interface.ts';

const content = JSON.parse(fs.readFileSync(from));
const interfaces = [];

function createInterfaceName(key) {
  const words = key.split('_');
  let interface = '';
  for (const word of words) {
    let w = word.toLowerCase();
    w = w.charAt(0).toUpperCase() + w.slice(1);
    interface += w;
  }

  return interface;
}

function createInterfaces(object, interface) {
  let exportInterface = 'export interface ' + interface + '{ ';
  for (const key in object) {
    if (typeof object[key] === 'string') {
      exportInterface += `${key}: string; `;
    } else {
      const interfaceName = createInterfaceName(key);
      exportInterface += `${key}: ${interfaceName}; `;
      createInterfaces(object[key], interfaceName);
    }
  }
  exportInterface += '}';
  interfaces.unshift(exportInterface);
}

createInterfaces(content, `Translation`);

interfaces.unshift(`
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

`);

prettier.format(interfaces.join('\n'), {parser: 'typescript'}).then(result => {
  fs.writeFileSync(to, result, 'utf8');
});
