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

import {Component, EventEmitter, Input, Output} from '@angular/core';
import {NamespacesCacheService} from '@ame/cache';
import {NamespaceModel} from '@ame/shared';

@Component({
  selector: 'ame-sidebar-namespaces',
  templateUrl: './sidebar-namespaces.component.html',
  styleUrls: ['./sidebar-namespaces.component.scss'],
})
export class SidebarNamespacesComponent {
  @Input()
  public namespaces: NamespaceModel[] = [];

  @Output()
  public selectNamespace = new EventEmitter<string>();

  @Output()
  public deleteNamespace = new EventEmitter<string>();

  @Output()
  public loadNamespaceFile = new EventEmitter<string>();

  constructor(public namespaceService: NamespacesCacheService) {}

  public get hasCurrentFile(): boolean {
    return this.namespaces.some(namespace => namespace.files.some(file => this.isCurrentFile(namespace.name, file)));
  }

  private selectedNamespace: string = null;
  private selectedNamespaceFile: string = null;

  public isSelectedNamespace(name: string): boolean {
    return this.selectedNamespace === name;
  }

  public isSelectedNamespaceFile(namespaceName: string, file: string): boolean {
    return this.selectedNamespace === namespaceName && this.selectedNamespaceFile === file;
  }

  public onSelectNamespaceFile(namespace: string, namespaceFile: string) {
    if (this.isCurrentFile(namespace, namespaceFile)) {
      return;
    }
    this.selectedNamespace = namespace;
    this.selectedNamespaceFile = namespaceFile;
    this.selectNamespace.emit(this.selectedNamespaceFile ? `${namespace}:${namespaceFile}` : null);
  }

  public onDeleteNamespace(namespace: string) {
    this.deleteNamespace.emit(namespace);
  }

  public clearSelections() {
    this.selectedNamespace = null;
    this.selectedNamespaceFile = null;
  }

  public copyNamespace(text: string) {
    navigator.clipboard.writeText(text);
  }

  public isCurrentFile(namespace: string, namespaceFile: string): boolean {
    return `${this.namespaceService.getCurrentCachedFile()?.aspect?.aspectModelUrn}.ttl` === `urn:bamm:${namespace}#${namespaceFile}`;
  }

  public onLoadAspectModel(namespace: NamespaceModel, namespaceFile: string) {
    this.loadNamespaceFile.emit(`${namespace.name}:${namespaceFile}`);
  }
}
