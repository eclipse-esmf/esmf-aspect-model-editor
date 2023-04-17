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

import {APP_CONFIG, AppConfig, NamespaceModel} from '@ame/shared';
import {Component, EventEmitter, Inject, Input, OnChanges, Output, SimpleChanges} from '@angular/core';
import {NamespacesCacheService} from '@ame/cache';
import {RdfService} from '@ame/rdf/services';
import {ExporterHelper, MigratorService} from '@ame/migrator';
import {NamespacesManagerService} from '@ame/namespace-manager';

@Component({
  selector: 'ame-sidebar-namespaces',
  templateUrl: './sidebar-namespaces.component.html',
  styleUrls: ['./sidebar-namespaces.component.scss'],
})
export class SidebarNamespacesComponent implements OnChanges {
  @Input()
  public namespaces: NamespaceModel[] = [];

  @Output()
  public selectNamespace = new EventEmitter<string>();

  @Output()
  public deleteNamespace = new EventEmitter<string>();

  @Output()
  public loadNamespaceFile = new EventEmitter<string>();

  @Output()
  public refresh = new EventEmitter<string>();

  public get hasCurrentFile(): boolean {
    return this.namespaces.some(namespace => namespace.files.some(file => this.isCurrentFile(namespace.name, file)));
  }

  public get isWorkspaceOutdated(): boolean {
    return this.namespaces.some(namespace => namespace.outdated);
  }

  private selectedNamespace: string = null;
  private selectedNamespaceFile: string = null;

  constructor(
    public namespaceService: NamespacesCacheService,
    private rdfService: RdfService,
    private migratorService: MigratorService,
    private namespaceManagerService: NamespacesManagerService,
    @Inject(APP_CONFIG) public config: AppConfig
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.namespaces) {
      this.mergeRdfWithNamespaces();
    }
  }

  public migrateWorkspace() {
    this.migratorService.startMigrating().subscribe(() => this.refresh.emit());
  }

  public getTooltip(namespace: NamespaceModel, file: string) {
    if (this.isCurrentFile(namespace.name, file)) {
      return 'Currently loaded file';
    }

    if (namespace.getFileStatus(file)?.outdated) {
      return `Outdated file. Migrate to SAMM ${this.config.currentSammVersion}`;
    }

    if (namespace.getFileStatus(file)?.hasErrors) {
      return `This file loaded with errors`;
    }

    return null;
  }

  public isSelectedNamespace(name: string): boolean {
    return this.selectedNamespace === name;
  }

  public isSelectedNamespaceFile(namespaceName: string, file: string): boolean {
    return this.selectedNamespace === namespaceName && this.selectedNamespaceFile === file;
  }

  public onSelectNamespaceFile(namespace: NamespaceModel, namespaceFile: string) {
    const fileStatus = namespace.getFileStatus(namespaceFile);

    if (this.isCurrentFile(namespace.name, namespaceFile) || fileStatus?.hasErrors || fileStatus?.outdated) {
      return;
    }
    this.selectedNamespace = namespace.name;
    this.selectedNamespaceFile = namespaceFile;
    this.selectNamespace.emit(this.selectedNamespaceFile ? `${namespace.name}:${namespaceFile}` : null);
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
    const cachedFile = this.namespaceService.getCurrentCachedFile();
    return `${cachedFile?.namespace}${cachedFile?.fileName}` === `urn:samm:${namespace}#${namespaceFile}`;
  }

  public onLoadAspectModel(namespace: NamespaceModel, namespaceFile: string) {
    this.loadNamespaceFile.emit(`${namespace.name}:${namespaceFile}`);
  }

  public importNamespace(event: any) {
    const file = event?.target?.files[0];

    if (!file) {
      return;
    }

    this.namespaceManagerService.importNamespaces(file).subscribe();
    event.target.value = '';
  }

  private mergeRdfWithNamespaces() {
    for (const namespace of this.namespaces) {
      for (const file of namespace.files) {
        const rdfModel = this.rdfService.externalRdfModels.find(rdf => {
          const mainPrefix = rdf.getPrefixes()[''];
          return rdf.absoluteAspectModelFileName === `${mainPrefix.replace('urn:samm:', '').replace('#', '')}:${file}`;
        });

        if (!rdfModel && !this.isCurrentFile(namespace.name, file)) {
          namespace.setFileHasErrors(file, true);
          continue;
        }

        const samm = rdfModel?.samm;
        if (samm) {
          namespace.setFileStatus(file, samm.version, ExporterHelper.isVersionOutdated(samm.version, this.config.currentSammVersion));
        }
      }
    }
  }
}
