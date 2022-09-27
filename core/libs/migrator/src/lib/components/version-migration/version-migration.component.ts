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
import {MigratorApiService, ModelApiService} from '@ame/api';
import {DataFactory} from 'n3';
import {map, of, switchMap, tap} from 'rxjs';
import {EditorService} from '@ame/editor';
import {RdfService} from '@ame/rdf/services';
import {RdfModel} from '@ame/rdf/utils';
import {Component, Inject, OnInit} from '@angular/core';
import {APP_CONFIG, AppConfig} from '@ame/shared';
import {Router} from '@angular/router';

export const defaultNamespaces = (bammVersion: string) => [
  `urn:bamm:io.openmanufacturing:meta-model:${bammVersion}#`,
  `urn:bamm:io.openmanufacturing:characteristic:${bammVersion}#`,
  `urn:bamm:io.openmanufacturing:entity:${bammVersion}#`,
  `urn:bamm:io.openmanufacturing:unit:${bammVersion}#`,

  `http://www.w3.org/1999/02/22-rdf-syntax-ns#`,
  `http://www.w3.org/2000/01/rdf-schema#`,
  `http://www.w3.org/2001/XMLSchema#`,
];

@Component({
  selector: 'ame-version-migration',
  templateUrl: './version-migration.component.html',
  styleUrls: ['./version-migration.component.scss'],
})
export class VersionMigrationComponent implements OnInit {
  public namespaces: {[namespace: string]: {name: string; migrated: boolean}[]};
  private defaultNamespaces = defaultNamespaces(this.config.currentBammVersion);

  constructor(
    private rdfService: RdfService,
    private modelApiService: ModelApiService,
    private migratorApiService: MigratorApiService,
    private editorService: EditorService,
    private router: Router,
    @Inject(APP_CONFIG) private config: AppConfig
  ) {}

  ngOnInit(): void {
    this.editorService
      .loadExternalModels()
      .pipe(
        switchMap(() => this.modelApiService.getNamespacesStructure()),
        map(namespaces => {
          for (const namespace in namespaces || {}) {
            namespaces[namespace] = namespaces[namespace].map((name: string) => ({name, migrated: false}));
          }
          this.namespaces = namespaces;
          return this.rewriteStores();
        }),
        switchMap(models => this.rewriteModels(models))
      )
      .subscribe(() => this.router.navigate([{outlets: {migrator: 'migration-success'}}]));
  }

  getNamespaceExplicitVersioning(namespace: string) {
    const [n, version] = namespace.split(':');
    return `${n} [${version} -> ${this.getNewVersion(version)}]`;
  }

  isNamespaceMigrated(files: {name: string; migrated: boolean}[]) {
    return files.every(file => file.migrated);
  }

  private getNewVersion(version: string) {
    const [major, minor, bug] = version.split('.').map(x => Number(x));
    return `${major + 1}.${minor}.${bug}`;
  }

  private rewriteStores() {
    const models = [];
    for (const namespace in this.namespaces) {
      for (let i = 0; i < this.namespaces[namespace].length; i++) {
        const rdfModel = this.rdfService.externalRdfModels.find(
          rdf => rdf.getPrefixes()[''].startsWith(`urn:bamm:${namespace}`) && rdf.aspectModelFileName === this.namespaces[namespace][i].name
        );
        const serializedUpdatedModel = this.rewriteStore(rdfModel, this.namespaces[namespace][i]);
        if (serializedUpdatedModel) {
          models.push({rdfModel, ...serializedUpdatedModel});
        }
      }
    }

    return models;
  }

  private rewriteStore(rdfModel: RdfModel, file: {name: string; migrated: boolean}) {
    const prefixes = rdfModel.getPrefixes();
    const toMigrate: string[] = Object.values(prefixes).filter(namespace => !this.defaultNamespaces.includes(namespace));

    if (toMigrate.length <= 0) {
      file.migrated = true;
      return null;
    }

    const returnObject = {
      oldNamespaceFile: rdfModel.getAbsoluteAspectModelFileName(),
      serializedUpdatedModel: '',
      file,
    };

    for (const namespace of toMigrate) {
      const namespacePieces = namespace.split(':');
      const version = namespacePieces.pop().replace('#', '');
      const newNamespace = `${namespacePieces.join(':')}:${this.getNewVersion(version)}#`;

      rdfModel.store.getQuads(null, null, null, null).forEach(({subject, predicate, object}) => {
        if (!(subject.value.includes(namespace) || object.value.includes(namespace) || predicate.value.includes(namespace))) {
          return;
        }

        const oldSubjectValue = subject.value;
        const oldObjectValue = object.value;
        const oldPredicateValue = predicate.value;

        const newSubjectValue = subject.value.replace(namespace, newNamespace);
        const newObjectValue = object.value.replace(namespace, newNamespace);
        const newPredicateValue = predicate.value.replace(namespace, newNamespace);

        rdfModel.store.addQuad(
          oldSubjectValue !== newSubjectValue ? DataFactory.namedNode(newSubjectValue) : subject,
          oldPredicateValue !== newPredicateValue ? DataFactory.namedNode(newPredicateValue) : predicate,
          oldObjectValue !== newObjectValue ? DataFactory.namedNode(newObjectValue) : object
        );

        rdfModel.store.removeQuad(subject, predicate, object);
      });

      const prefix = Object.entries(prefixes).find(([, value]) => value === namespace)?.[0];
      rdfModel.updatePrefix(prefix, namespace, newNamespace);
    }

    returnObject.serializedUpdatedModel = this.rdfService.serializeModel(rdfModel);
    return returnObject;
  }

  private rewriteModels(models: any[]) {
    return models.reduce(
      (obs, model) => obs.pipe(switchMap(() => this.migratorApiService.rewriteFile(model).pipe(tap(() => (model.file.migrated = true))))),
      of(0)
    );
  }
}
