/*
 * Copyright (c) 2023 Robert Bosch Manufacturing Solutions GmbH
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

import {CachedFile} from '@ame/cache';
import {EditorService} from '@ame/editor';
import {NamespaceModel} from '@ame/shared';
import {Injectable, Injector} from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class SidebarService {
  private _namespaces: NamespaceModel[] = [];

  public get namespaces() {
    return this._namespaces;
  }

  constructor(private injector: Injector) {}

  resetNamespaces() {
    this._namespaces = [];
  }

  loadNamespaceFiles(namespace: string, currentFile?: CachedFile) {
    const namespaceModel = this.namespaces.find(ns => namespace.includes(ns.name));
    const editorService = this.injector.get(EditorService);
    for (const file of namespaceModel.files) {
      const fileWithoutExtension = file.substring(0, file.length - 4);
      if (currentFile?.aspect?.aspectModelUrn === `${namespace}#${fileWithoutExtension}`) {
        continue;
      }
      editorService.loadExternalAspectModel(`${namespaceModel.name}:${file}`);
    }
  }
}
