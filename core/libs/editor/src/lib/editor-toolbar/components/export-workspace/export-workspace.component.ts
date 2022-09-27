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

import {FlatTreeControl} from '@angular/cdk/tree';
import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {MatTreeFlatDataSource, MatTreeFlattener} from '@angular/material/tree';
import {ModelApiService} from '@ame/api';
import {catchError, first, of, Subscription} from 'rxjs';

interface SelectableNamespaces {
  [namespace: string]: string[];
}

interface FlatNode {
  expandable: boolean;
  name: string;
  level: number;
}

interface VersionNode {
  name: string;
  children?: VersionNode[];
}

@Component({
  selector: 'ame-export-workspace',
  templateUrl: './export-workspace.component.html',
  styleUrls: ['./export-workspace.component.scss'],
})
export class ExportWorkspaceComponent implements OnInit, OnDestroy {
  public treeControl = new FlatTreeControl<FlatNode>(
    node => node.level,
    node => node.expandable
  );

  public treeFlattener = new MatTreeFlattener(
    (node: VersionNode, level: number) => {
      return {
        expandable: !!node.children && node.children.length > 0,
        name: node.name,
        level: level,
      };
    },
    node => node.level,
    node => node.expandable,
    node => node.children
  );

  private readonly namespaceSplitter = ':';

  private filesToValidate: string[];
  private subscription = new Subscription();
  private url: string;

  public namespaceLoading = false;
  public namespaceMessage = '';
  public namespaces: SelectableNamespaces;
  public validated = false;
  public validationStatus: any;
  public validating = false;
  public error: any = null;
  public validationHasErrors = false;

  public selectedNamespace: string;
  public structure = {
    namespace: null,
    dataSource: new MatTreeFlatDataSource(this.treeControl, this.treeFlattener),
  };

  constructor(
    private dialogRef: MatDialogRef<ExportWorkspaceComponent>,
    private modelApiService: ModelApiService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    this.namespaceLoading = true;
    this.namespaceMessage = 'Loading namespaces...';

    this.modelApiService
      .getNamespacesAppendWithFiles()
      .pipe(
        first(),
        catchError(() => of([]))
      )
      .subscribe(namespaces => {
        this.namespaceLoading = false;
        if (!namespaces.length) {
          this.namespaceMessage = 'There are no namespaces to display';
          return;
        }

        this.namespaceMessage = '';
        this.namespaces = namespaces.reduce((acc: SelectableNamespaces, namespace: string) => {
          const parts = namespace.split(this.namespaceSplitter);
          const file = parts.pop();
          const namespaceName = parts.join(this.namespaceSplitter);

          if (!acc[namespaceName]) {
            acc[namespaceName] = [file];
            return acc;
          }

          if (!acc[namespaceName]) {
            acc[namespaceName] = [file];
            return acc;
          }

          acc[namespaceName].push(file);
          return acc;
        }, {} as SelectableNamespaces);
      });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  showStructure(namespace: string) {
    this.structure.namespace = namespace;
    this.structure.dataSource.data = this.namespaces[namespace].map(file => {
      return {name: file};
    });
    this.treeControl.expandAll();
  }

  hasChild = (_: number, node: FlatNode) => node.expandable;

  validate() {
    const versions = this.namespaces[this.selectedNamespace];
    if (!versions) {
      return;
    }

    this.filesToValidate = versions.map(file => `${this.selectedNamespace}:${file}`);

    this.validating = true;
    this.error = null;
    this.validationStatus = null;

    const sub = this.modelApiService
      .validateFilesForExport(this.filesToValidate)
      .pipe(
        first(),
        catchError(error => {
          if (error.status >= 500) {
            this.error = {internalServerError: true};
          } else {
            this.error = {unexpectedError: true};
          }

          this.validating = false;
          return of();
        })
      )
      .subscribe(response => {
        this.validationStatus = response;
        this.validating = false;
        this.validated = true;
        this.validationHasErrors = this.hasResponseErrors();
      });

    this.subscription.add(sub);
  }

  export() {
    if (this.url) {
      const a = document.createElement('a');
      a.href = this.url;
      a.download = 'package.zip';
      a.click();
      return;
    }

    const sub = this.modelApiService.getExportZipFile().subscribe(response => {
      this.url = URL.createObjectURL(response);
      const a = document.createElement('a');
      a.href = this.url;
      a.download = 'package.zip';
      a.click();
      this.dialogRef.close();
    });

    this.subscription.add(sub);
  }

  close() {
    if (this.validating) {
      this.subscription.unsubscribe();
    }
    this.dialogRef.close();
  }

  hasResponseErrors() {
    return (
      !!this.validationStatus?.missingFiles.length ||
      this.validationStatus?.validFiles.some(({validationReport: {validationErrors}}) => !!validationErrors?.length)
    );
  }
}
