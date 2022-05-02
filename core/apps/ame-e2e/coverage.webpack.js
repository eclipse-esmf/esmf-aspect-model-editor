/*
 * Copyright (c) 2022 Robert Bosch Manufacturing Solutions GmbH
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

const path = require('path');
const fs = require('fs');

module.exports = {
  module: {
    rules: [
      {
        test: /\.(js|ts)$/,
        loader: 'coverage-istanbul-loader',
        options: {esModules: true},
        enforce: 'post',
        include: [
          path.join(__dirname, '..', 'ame', 'src'),
          ...fs
            .readdirSync(path.join(__dirname, '..', '..', 'libs'), {withFileTypes: true})
            .filter(dirent => dirent.isDirectory())
            .map(dirent => path.join(__dirname, '..', '..', 'libs', 'src', 'lib', dirent.name)),
        ],
        exclude: [/\.(e2e|spec)\.ts$/, /node_modules/, /(ngfactory|ngstyle)\.js/],
      },
    ],
  },
};
