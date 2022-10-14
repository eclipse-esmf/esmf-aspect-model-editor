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

export interface FileStatus {
  [file: string]: {
    outdated: boolean;
    version: string;
    hasErrors?: boolean;
  };
}

export class NamespaceModel {
  private fileStatus: FileStatus = {};

  public get outdated(): boolean {
    return Object.values(this.fileStatus).reduce((acc: boolean, {outdated}) => acc || outdated, false);
  }

  constructor(public name: string, public files: string[]) {}

  setFileStatus(file: string, version: string, outdated: boolean) {
    this.fileStatus[file] = {version, outdated};
  }

  setFileHasErrors(file: string, hasErrors: boolean) {
    if (this.fileStatus[file]) {
      this.fileStatus[file].hasErrors = hasErrors;
    } else {
      this.fileStatus[file] = {version: null, outdated: false, hasErrors};
    }
  }

  getFileStatus(file: string) {
    return this.fileStatus[file];
  }
}
