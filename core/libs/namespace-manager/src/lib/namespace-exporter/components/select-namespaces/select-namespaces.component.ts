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

import {ModelApiService} from '@ame/api';
import {Component, OnInit} from '@angular/core';
import {MatCheckboxChange} from '@angular/material/checkbox';
import {Router} from '@angular/router';
import {first} from 'rxjs';
import {NamespacesManagerService} from '../../../shared';
import {FlatNode} from '../../../shared/models';

interface SelectableNamespaces {
  [namespace: string]: string[];
}

@Component({
  templateUrl: './select-namespaces.component.html',
  styleUrls: ['select-namespaces.component.scss'],
})
export class SelectNamespacesComponent implements OnInit {
  public selectedNamespaces: string[] = [];
  public namespaces: SelectableNamespaces;

  private readonly namespaceSplitter = ':';

  constructor(private modelApiService: ModelApiService, private namespacesManager: NamespacesManagerService, private router: Router) {}

  ngOnInit(): void {
    this.modelApiService
      .getNamespacesAppendWithFiles()
      .pipe(first())
      .subscribe(namespaces => {
        if (!namespaces.length) {
          return;
        }

        this.namespaces = namespaces.reduce((acc: SelectableNamespaces, namespace: string) => {
          const parts = namespace.split(this.namespaceSplitter);
          const file = parts.pop();
          const namespaceName = parts.join(this.namespaceSplitter);

          acc[namespaceName] = [...(acc[namespaceName] || []), file];
          return acc;
        }, {} as SelectableNamespaces);

        console.log(this.namespaces);
      });
  }

  toggleNamespace(event: MatCheckboxChange, namespace: string) {
    this.selectedNamespaces = event.checked
      ? [...this.selectedNamespaces, namespace]
      : this.selectedNamespaces.filter(n => n !== namespace);
  }

  validate() {
    const files = this.selectedNamespaces.reduce((acc, namespace) => {
      return [...acc, ...this.namespaces[namespace].map(file => `${namespace}${this.namespaceSplitter}${file}`)];
    }, []);
    this.namespacesManager.validateExport(files).subscribe();
    this.router.navigate([{outlets: {'export-namespaces': 'validate'}}]);
  }

  hasChild = (_: number, node: FlatNode) => node.expandable;
}
