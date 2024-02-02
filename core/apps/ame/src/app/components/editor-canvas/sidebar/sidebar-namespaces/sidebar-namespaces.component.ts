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

import {
  APP_CONFIG,
  AppConfig,
  NamespaceModel,
  ElectronSignals,
  ElectronSignalsService,
  NotificationsService,
  LockUnlockPayload,
  BrowserService,
} from '@ame/shared';
import {inject, Component, EventEmitter, Inject, Input, OnChanges, OnInit, Output, SimpleChanges, OnDestroy} from '@angular/core';
import {RdfService} from '@ame/rdf/services';
import {ExporterHelper, MigratorService} from '@ame/migrator';
import {NamespacesManagerService} from '@ame/namespace-manager';
import {Subscription} from 'rxjs';

@Component({
  selector: 'ame-sidebar-namespaces',
  templateUrl: './sidebar-namespaces.component.html',
  styleUrls: ['./sidebar-namespaces.component.scss'],
})
export class SidebarNamespacesComponent implements OnChanges, OnInit, OnDestroy {
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

  private electronSignalsService: ElectronSignals = inject(ElectronSignalsService);

  public get hasCurrentFile(): boolean {
    return this.namespaces.some(namespace => namespace.files.some(file => this.isCurrentFile(namespace.name, file)));
  }

  public get isWorkspaceOutdated(): boolean {
    return this.namespaces.some(namespace => namespace.outdated);
  }

  private selectedNamespace: string = null;
  private selectedNamespaceFile: string = null;
  private isSingleClick = false;
  private subscription = new Subscription();
  private lockedFiles: LockUnlockPayload[] = [];

  constructor(
    private rdfService: RdfService,
    private migratorService: MigratorService,
    private namespaceManagerService: NamespacesManagerService,
    private notificationService: NotificationsService,
    private browserService: BrowserService,
    @Inject(APP_CONFIG) public config: AppConfig
  ) {}

  ngOnInit() {
    this.namespaces.sort(this.compareByName);
    if (this.browserService.isStartedAsElectronApp() || window.require) {
      this.subscription.add(this.electronSignalsService.call('lockedFiles').subscribe(files => (this.lockedFiles = files)));
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.namespaces) {
      this.mergeRdfWithNamespaces();
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  public migrateWorkspace() {
    this.subscription.add(this.migratorService.startMigrating().subscribe(() => this.refresh.emit()));
  }

  public isSelectedNamespace(name: string): boolean {
    return this.selectedNamespace === name;
  }

  public isSelectedNamespaceFile(namespaceName: string, file: string): boolean {
    return this.selectedNamespace === namespaceName && this.selectedNamespaceFile === file;
  }

  public onSelectNamespaceFile(namespace: NamespaceModel, namespaceFile: string) {
    this.isSingleClick = true;
    if (!this.isCurrentFileLoaded()) {
      this.notificationService.info({
        title: 'Load a Model to Continue',
        message: 'To view the file contents, please load a model first.',
      });
      return;
    }
    setTimeout(() => {
      if (!this.isSingleClick) {
        return;
      }

      this.isSingleClick = false;
      const fileStatus = namespace.getFileStatus(namespaceFile);

      if (this.isCurrentFile(namespace.name, namespaceFile) || fileStatus?.hasErrors || fileStatus?.outdated) {
        return;
      }
      this.selectedNamespace = namespace.name;
      this.selectedNamespaceFile = namespaceFile;
      this.selectNamespace.emit(this.selectedNamespaceFile ? `${namespace.name}:${namespaceFile}` : null);
    }, 350);
  }

  public onDeleteNamespace(namespace: string) {
    this.deleteNamespace.emit(namespace);
  }

  public clearSelections() {
    this.selectedNamespace = null;
    this.selectedNamespaceFile = null;
  }

  public copyNamespace(text: string) {
    // TODO: Add absolute path once the frontend has knowledge of the path in the settings.
    navigator.clipboard.writeText(text.replace(':', '/'));
  }

  public isLocked(namespace: string, file: string): boolean {
    return (
      Boolean(this.lockedFiles.find(lockedFile => lockedFile.namespace === namespace && lockedFile.file === file)) &&
      !this.isCurrentFile(namespace, file)
    );
  }

  public isCurrentFile(namespace: string, namespaceFile: string): boolean {
    const currentRdfModel = this.rdfService.currentRdfModel;
    return (
      currentRdfModel?.loadedFromWorkspace &&
      (currentRdfModel?.originalAbsoluteFileName || currentRdfModel?.absoluteAspectModelFileName) === `${namespace}:${namespaceFile}`
    );
  }

  public isCurrentFileLoaded() {
    const currentRdfModel = this.rdfService.currentRdfModel;
    return Boolean(currentRdfModel?.originalAbsoluteFileName || currentRdfModel?.absoluteAspectModelFileName);
  }

  public isLoadInNewWindowDisabled(namespace: NamespaceModel, file: string) {
    return this.isCurrentFile(namespace.name, file) || namespace.getFileStatus(file)?.outdated || namespace.getFileStatus(file)?.hasErrors;
  }

  public isLoadDisabled(namespace: NamespaceModel, file: string) {
    return (
      this.isLocked(namespace.name, file) ||
      this.isCurrentFile(namespace.name, file) ||
      namespace.getFileStatus(file)?.outdated ||
      namespace.getFileStatus(file)?.hasErrors
    );
  }

  public isSelectNamespaceFileDisabled(namespace: NamespaceModel, file: string) {
    return this.isCurrentFile(namespace.name, file) || namespace.getFileStatus(file)?.outdated || namespace.getFileStatus(file)?.hasErrors;
  }

  public isDeleteDisabled(namespace: NamespaceModel, file: string) {
    return this.isLocked(namespace.name, file) || this.isCurrentFile(namespace.name, file);
  }

  public onLoadAspectModel(namespace: NamespaceModel, namespaceFile: string) {
    this.loadNamespaceFile.emit(`${namespace.name}:${namespaceFile}`);
  }

  public loadInNewWindow(namespace: NamespaceModel, namespaceFile: string) {
    this.isSingleClick = false;
    this.electronSignalsService.call('openWindow', {namespace: namespace.name, file: namespaceFile, fromWorkspace: true});
  }

  public importNamespace(event: any) {
    const file = event?.target?.files[0];

    if (!file) {
      return;
    }

    this.namespaceManagerService.importNamespaces(file).subscribe();
    event.target.value = '';
  }

  private mergeRdfWithNamespaces(): void {
    for (const namespace of this.namespaces) {
      for (const file of namespace.files) {
        const rdfModel = this.rdfService.externalRdfModels.find(rdf => {
          const mainPrefix = rdf.getPrefixes()[''];
          return rdf.absoluteAspectModelFileName === `${mainPrefix.replace('urn:samm:', '').replace('#', '')}:${file}`;
        });

        if (!rdfModel && this.isCurrentFileLoaded() && !this.isCurrentFile(namespace.name, file)) {
          namespace.setFileError(file, true);
          continue;
        }

        const samm = rdfModel?.samm;
        if (samm) {
          namespace.setFileStatus(file, samm.version, ExporterHelper.isVersionOutdated(samm.version, this.config.currentSammVersion));
        }
      }
    }
    this.namespaces.sort(this.compareByName);
  }

  refreshSidebar() {
    this.refresh.emit();
  }

  private compareByName(a: NamespaceModel, b: NamespaceModel): 0 | 1 | -1 {
    if (a.name < b.name) {
      return -1;
    }
    if (a.name > b.name) {
      return 1;
    }
    return 0;
  }
}
