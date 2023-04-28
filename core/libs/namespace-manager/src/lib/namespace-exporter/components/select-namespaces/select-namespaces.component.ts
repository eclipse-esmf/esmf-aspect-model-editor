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

import {Component, OnInit, inject} from '@angular/core';
import {MatCheckboxChange} from '@angular/material/checkbox';
import {Router} from '@angular/router';
import {NamespacesManagerService} from '../../../shared';
import {FlatNode} from '../../../shared/models';
import {RdfService} from '@ame/rdf/services';
import {Prefixes} from 'n3';

const nonDependentNamespaces = [
  'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
  'http://www.w3.org/2000/01/rdf-schema#',
  'urn:samm:org.eclipse.esmf.samm:meta-model:2.0.0#',
  'urn:samm:org.eclipse.esmf.samm:characteristic:2.0.0#',
  'urn:samm:org.eclipse.esmf.samm:entity:2.0.0#',
  'urn:samm:org.eclipse.esmf.samm:unit:2.0.0#',
  'http://www.w3.org/2001/XMLSchema#',
];

@Component({
  templateUrl: './select-namespaces.component.html',
  styleUrls: ['select-namespaces.component.scss'],
})
export class SelectNamespacesComponent implements OnInit {
  public selectedNamespaces: string[] = [];
  public namespacesDependencies: {[namespace: string]: {disabled: boolean; dependencies: string[]; files: string[]; checked: boolean}} = {};

  private readonly namespaceSplitter = ':';
  private rdfService: RdfService = inject(RdfService);
  private visitedNamespaces = [];

  constructor(private namespacesManager: NamespacesManagerService, private router: Router) {}

  ngOnInit(): void {
    this.namespacesDependencies = this.rdfService.externalRdfModels.reduce((acc, rdfModel) => {
      const [namespace, version, file] = rdfModel.absoluteAspectModelFileName.split(this.namespaceSplitter);
      const versionedNamespace = `${namespace}:${version}`;

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
        new Set([...nDependency.dependencies, ...this.getDependentNamespaces(rdfModel.getNamespaces())])
      );
      nDependency.files = Array.from(new Set([...nDependency.files, file]));
      return acc;
    }, {});
  }

  toggleNamespace(event: MatCheckboxChange, namespace: string) {
    this.selectDependencies(namespace, event.checked);
    this.visitedNamespaces = [];
  }

  validate() {
    const validatePayload = this.selectedNamespaces.map(namespace => ({namespace, files: this.namespacesDependencies[namespace].files}));
    this.namespacesManager.validateExport(validatePayload).subscribe();
    this.router.navigate([{outlets: {'export-namespaces': 'validate'}}]);
  }

  hasChild = (_: number, node: FlatNode) => node.expandable;

  private getDependentNamespaces(prefixes: Prefixes<any>) {
    return Object.entries(prefixes).reduce((acc, [key, value]) => {
      if (!nonDependentNamespaces.includes(value) && key !== '') {
        acc.push(value.replace('urn:samm:', '').replace('#', ''));
      }

      return acc;
    }, []);
  }

  private selectDependencies(namespace: string, checked: boolean, level = 0) {
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
