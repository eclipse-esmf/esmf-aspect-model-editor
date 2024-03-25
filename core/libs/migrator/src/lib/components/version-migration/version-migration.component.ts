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
import {MigratorApiService, ModelApiService} from '@ame/api';
import {DataFactory} from 'n3';
import {concatMap, from, map, Observable, of, switchMap, tap} from 'rxjs';
import {EditorService} from '@ame/editor';
import {RdfService} from '@ame/rdf/services';
import {RdfModel} from '@ame/rdf/utils';
import {Component, NgZone, OnInit, inject} from '@angular/core';
import {APP_CONFIG, AppConfig, ElectronSignals, ElectronSignalsService, LogService} from '@ame/shared';
import {Router} from '@angular/router';

export const defaultNamespaces = (sammVersion: string) => [
  `urn:samm:org.eclipse.esmf.samm:meta-model:${sammVersion}#`,
  `urn:samm:org.eclipse.esmf.samm:characteristic:${sammVersion}#`,
  `urn:samm:org.eclipse.esmf.samm:entity:${sammVersion}#`,
  `urn:samm:org.eclipse.esmf.samm:unit:${sammVersion}#`,

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

  private config: AppConfig = inject(APP_CONFIG);
  private defaultNamespaces = defaultNamespaces(this.config.currentSammVersion);
  private electronSignalsService: ElectronSignals = inject(ElectronSignalsService);

  constructor(
    private rdfService: RdfService,
    private modelApiService: ModelApiService,
    private migratorApiService: MigratorApiService,
    private editorService: EditorService,
    private logService: LogService,
    private router: Router,
    private ngZone: NgZone,
  ) {}

  ngOnInit(): void {
    this.editorService
      .loadExternalModels()
      .pipe(
        switchMap(() => this.modelApiService.getNamespacesStructure()),
        map(namespaces => this.prepareNamespaces(namespaces)),
        tap(namespaces => (this.namespaces = namespaces)),
        switchMap(() => this.rewriteStores()),
        switchMap(modelsTobeDeleted => this.rewriteAndDeleteModels(modelsTobeDeleted)),
      )
      .subscribe({
        complete: () => this.navigateToMigrationSuccess(),
        error: err => this.logService.logError('Error when migration to new version', err),
      });
  }

  prepareNamespaces(namespaces: any): any {
    for (const namespace in namespaces || {}) {
      namespaces[namespace] = namespaces[namespace].map((name: string) => ({name, migrated: false}));
    }
    return namespaces;
  }

  rewriteAndDeleteModels(modelsTobeDeleted: any[]): Observable<any> {
    return this.rewriteModels(modelsTobeDeleted).pipe(
      tap(() =>
        this.deleteModels(modelsTobeDeleted).subscribe({
          complete: () => this.electronSignalsService.call('requestRefreshWorkspaces'),
          error: err => this.logService.logError('Error when deleting old Aspect Model to new version', err),
        }),
      ),
    );
  }

  navigateToMigrationSuccess(): void {
    this.ngZone.run(() => this.router.navigate([{outlets: {migrator: 'migration-success'}}]));
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
          rdf =>
            rdf.getPrefixes()[''].startsWith(`urn:samm:${namespace}`) && rdf.aspectModelFileName === this.namespaces[namespace][i].name,
        );
        const serializedUpdatedModel = this.rewriteStore(rdfModel, this.namespaces[namespace][i]);
        if (serializedUpdatedModel) {
          models.push({rdfModel, ...serializedUpdatedModel});
        }
      }
    }

    return of(models);
  }

  private rewriteStore(rdfModel: RdfModel, file: {name: string; migrated: boolean}) {
    const prefixes = rdfModel.getPrefixes();
    const toMigrate: string[] = Object.values(prefixes).filter(namespace => !this.defaultNamespaces.includes(namespace));

    if (toMigrate.length <= 0) {
      file.migrated = true;
      return null;
    }

    const returnObject = {
      oldNamespaceFile: rdfModel.absoluteAspectModelFileName,
      serializedUpdatedModel: '',
      file,
    };

    for (const namespace of toMigrate) {
      const namespacePieces = namespace.split(':');
      const oldVersion = namespacePieces.pop().replace('#', '');
      const newVersion = this.getNewVersion(oldVersion);
      const newNamespace = `${namespacePieces.join(':')}:${newVersion}#`;

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
          oldObjectValue !== newObjectValue ? DataFactory.namedNode(newObjectValue) : object,
        );

        rdfModel.store.removeQuad(subject, predicate, object);
      });

      const prefix = Object.entries(prefixes).find(([, value]) => value === namespace)?.[0];
      rdfModel.updatePrefix(prefix, namespace, newNamespace);
      rdfModel.updateAspectVersion(oldVersion, newVersion);

      if (prefix === '') {
        rdfModel.updateAbsoluteFileName(namespacePieces[2], newVersion);
      }
    }

    returnObject.serializedUpdatedModel = this.rdfService.serializeModel(rdfModel);
    return returnObject;
  }

  private rewriteModels(models: any[]): Observable<any> {
    return from(models).pipe(concatMap(model => this.migratorApiService.rewriteFile(model).pipe(tap(() => (model.file.migrated = true)))));
  }

  private deleteModels(models: any[]): Observable<any> {
    return from(models).pipe(concatMap(model => this.modelApiService.deleteFile(model.oldNamespaceFile)));
  }
}
