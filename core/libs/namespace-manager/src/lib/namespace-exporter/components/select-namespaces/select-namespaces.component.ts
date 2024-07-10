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

import {Component, Inject, OnInit} from '@angular/core';
import {MatCheckboxChange, MatCheckboxModule} from '@angular/material/checkbox';
import {Router} from '@angular/router';
import {NamespacesManagerService} from '../../../shared';
import {Prefixes} from 'n3';
import {RdfModel, RdfModelUtil} from '@ame/rdf/utils';
import {EditorService} from '@ame/editor';
import {tap} from 'rxjs/operators';
import {first} from 'rxjs';
import {APP_CONFIG, AppConfig} from '@ame/shared';
import {MatDialogModule} from '@angular/material/dialog';
import {LanguageTranslateModule} from '@ame/translation';
import {KeyValuePipe} from '@angular/common';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {MatTooltip, MatTooltipModule} from '@angular/material/tooltip';

const nonDependentNamespaces = (sammVersion: string) => [
  'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
  'http://www.w3.org/2000/01/rdf-schema#',
  `urn:samm:org.eclipse.esmf.samm:meta-model:${sammVersion}#`,
  `urn:samm:org.eclipse.esmf.samm:characteristic:${sammVersion}#`,
  `urn:samm:org.eclipse.esmf.samm:entity:${sammVersion}#`,
  `urn:samm:org.eclipse.esmf.samm:unit:${sammVersion}#`,
  'http://www.w3.org/2001/XMLSchema#',
];

interface NamespacesDependencies {
  [namespace: string]: {
    disabled: boolean;
    dependencies: string[];
    files: string[];
    checked: boolean;
  };
}

@Component({
  standalone: true,
  templateUrl: './select-namespaces.component.html',
  styleUrls: ['select-namespaces.component.scss'],
  imports: [MatDialogModule, LanguageTranslateModule, MatCheckboxModule, KeyValuePipe, MatIconModule, MatButtonModule, MatTooltipModule],
})
export class SelectNamespacesComponent implements OnInit {
  selectedNamespaces: string[] = [];
  namespacesDependencies: NamespacesDependencies = {};

  private visitedNamespaces: string[] = [];

  constructor(
    private namespacesManager: NamespacesManagerService,
    private editorService: EditorService,
    private router: Router,
    @Inject(APP_CONFIG) public config: AppConfig,
  ) {}

  ngOnInit(): void {
    this.editorService
      .loadModels()
      .pipe(
        first(),
        tap(models => (this.namespacesDependencies = this.getNamespacesDependencies(models))),
      )
      .subscribe();
  }

  toggleNamespace(event: MatCheckboxChange, namespace: string): void {
    this.selectDependencies(namespace, event.checked);
    this.visitedNamespaces = [];
  }

  validate(): void {
    const namespaces = Array.from(new Set(this.selectedNamespaces));
    const validatePayload = namespaces.map(namespace => ({
      namespace,
      files: this.namespacesDependencies[namespace].files,
    }));
    this.namespacesManager.validateExport(validatePayload).subscribe();
    this.router.navigate([{outlets: {'export-namespaces': 'validate'}}]);
  }

  private getNamespacesDependencies(models: RdfModel[]): NamespacesDependencies {
    return models.reduce((acc, rdfModel) => {
      const versionedNamespace = RdfModelUtil.getNamespaceFromRdf(rdfModel.absoluteAspectModelFileName);
      const fileName = RdfModelUtil.getFileNameFromRdf(rdfModel.absoluteAspectModelFileName);

      let nDependency = acc[versionedNamespace];
      if (!nDependency) {
        acc[versionedNamespace] = {
          disabled: false,
          checked: false,
          dependencies: [],
          files: [],
        };
        nDependency = acc[versionedNamespace];
      }

      nDependency.dependencies = Array.from(
        new Set([...nDependency.dependencies, ...this.getDependentNamespaces(rdfModel.getNamespaces())]),
      );
      nDependency.files = Array.from(new Set([...nDependency.files, fileName]));
      return acc;
    }, {});
  }

  private getDependentNamespaces(prefixes: Prefixes<string>): string[] {
    return Object.entries(prefixes).reduce((acc, [key, value]) => {
      if (!nonDependentNamespaces(this.config.currentSammVersion).includes(value) && key !== '') {
        acc.push(value.replace('urn:samm:', '').replace('#', ''));
      }

      return acc;
    }, []);
  }

  private selectDependencies(namespace: string, checked: boolean, level = 0): void {
    const nDependency = this.namespacesDependencies[namespace];
    nDependency.checked = checked;
    nDependency.disabled = level > 0 && checked;
    this.selectedNamespaces = checked ? [...this.selectedNamespaces, namespace] : this.selectedNamespaces.filter(n => n !== namespace);
    this.visitedNamespaces.push(namespace);

    for (const dependency of this.namespacesDependencies[namespace].dependencies) {
      if (this.visitedNamespaces.includes(dependency)) {
        continue;
      }
      this.selectDependencies(dependency, checked, ++level);
    }
  }
}
