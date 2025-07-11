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
import {LoadedFilesService, NamespaceFile} from '@ame/cache';
import {ModelLoaderService} from '@ame/editor';
import {RdfService} from '@ame/rdf/services';
import {RdfModelUtil} from '@ame/rdf/utils';
import {APP_CONFIG, AppConfig, ElectronSignals, ElectronSignalsService} from '@ame/shared';
import {CdkScrollable} from '@angular/cdk/scrolling';
import {KeyValuePipe} from '@angular/common';
import {Component, NgZone, OnInit, inject} from '@angular/core';
import {MatDialogContent, MatDialogTitle} from '@angular/material/dialog';
import {MatIcon} from '@angular/material/icon';
import {MatProgressSpinner} from '@angular/material/progress-spinner';
import {Router} from '@angular/router';
import {TranslateModule} from '@ngx-translate/core';
import {DataFactory} from 'n3';
import {Observable, concatMap, from, of, switchMap, tap} from 'rxjs';

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
  standalone: true,
  imports: [MatDialogTitle, CdkScrollable, MatDialogContent, MatProgressSpinner, MatIcon, KeyValuePipe, TranslateModule],
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
    private modelLoader: ModelLoaderService,
    private router: Router,
    private ngZone: NgZone,
    private loadedFilesService: LoadedFilesService,
  ) {}

  ngOnInit(): void {
    this.prepareNamespaces(this.migratorApiService.rdfModelsToMigrate)
      .pipe(
        switchMap(() => this.rewriteStores()),
        switchMap((modelsTobeDeleted: any[]) => this.rewriteAndDeleteModels(modelsTobeDeleted)),
      )
      .subscribe({
        complete: () => this.navigateToMigrationSuccess(),
        error: err => console.error('Error when migration to new version', err),
      });
  }

  prepareNamespaces(absoluteNames: string[]): any {
    this.namespaces = {};
    absoluteNames.forEach(absoluteName => {
      const [namespace, version, file] = RdfModelUtil.splitRdfIntoChunks(absoluteName);
      const namespaceKey = `${namespace}:${version}`;
      if (!this.namespaces[namespaceKey]) {
        this.namespaces[namespaceKey] = [];
      }
      this.namespaces[namespaceKey].push({name: file, migrated: false});
    });
  }

  rewriteAndDeleteModels(modelsTobeDeleted: any[]): Observable<any> {
    return this.rewriteModels(modelsTobeDeleted).pipe(
      tap(() =>
        this.deleteModels(modelsTobeDeleted).subscribe({
          complete: () => this.electronSignalsService.call('requestRefreshWorkspaces'),
          error: err => console.error('Error when deleting old Aspect Model to new version', err),
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
        const file = this.loadedFilesService.filesAsList.find(
          file => file.namespace === namespace && file.name === this.namespaces[namespace][i].name,
        );
        const serializedUpdatedModel = this.rewriteStore(file, this.namespaces[namespace][i]);
        if (serializedUpdatedModel) {
          models.push({rdfModel: file.rdfModel, ...serializedUpdatedModel});
        }
      }
    }

    return of(models);
  }

  private rewriteStore(loadedFile: NamespaceFile, file: {name: string; migrated: boolean}) {
    const prefixes = loadedFile.rdfModel.getPrefixes();
    const toMigrate: string[] = Object.values(prefixes).filter(namespace => !this.defaultNamespaces.includes(namespace));

    if (toMigrate.length <= 0) {
      file.migrated = true;
      return null;
    }

    const {rdfModel} = loadedFile;

    const returnObject = {
      oldNamespaceFile: loadedFile.absoluteName,
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

      if (prefix === '') {
        this.loadedFilesService.updateAbsoluteName(loadedFile.absoluteName, `${namespacePieces[2]}:${newVersion}:${loadedFile.name}`);
      }
    }

    returnObject.serializedUpdatedModel = this.rdfService.serializeModel(rdfModel);
    return returnObject;
  }

  private rewriteModels(models: any[]): Observable<any> {
    return from(models).pipe(concatMap(model => this.migratorApiService.rewriteFile(model).pipe(tap(() => (model.file.migrated = true)))));
  }

  private deleteModels(models: any[]): Observable<any> {
    // @TODO see this functionality
    return from(models).pipe(concatMap(model => this.modelApiService.deleteFile(model.oldNamespaceFile, '')));
  }
}
