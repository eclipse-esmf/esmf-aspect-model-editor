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

import {Component, OnInit} from '@angular/core';
import {NamespaceStatus} from '@ame/api';
import {MigratorService} from '../../migrator.service';
import {Router} from '@angular/router';
import {EditorService} from '@ame/editor';
import {RdfModel} from '@ame/rdf/utils';

@Component({
  selector: 'ame-migration-status',
  templateUrl: './migration-status.component.html',
  styleUrls: ['./migration-status.component.scss'],
})
export class MigrationStatusComponent implements OnInit {
  public migrationStatus: NamespaceStatus[] = [];
  public filteredErrorFiles = {};
  public hasErrors = false;

  constructor(public migratorService: MigratorService, private editorService: EditorService, private router: Router) {}

  ngOnInit(): void {
    this.migrationStatus = history.state.data?.namespaces || [];
    this.hasErrors = this.migrationStatus.length <= 0;

    this.editorService.loadExternalModels().subscribe(rdfModels => {
      const erroredModels = rdfModels.filter(rdfModel => rdfModel?.hasErrors);
      this.hasErrors ||= erroredModels.length > 0;
      this.setFilesWithError(erroredModels);
      console.log(erroredModels, this.migrationStatus);
    });
  }

  increaseVersion() {
    if (this.migratorService.increaseNamespaceVersion) {
      this.router.navigate([{outlets: {migrator: 'increase-version'}}]);
    }
  }

  closeDialog() {
    this.migratorService.dialogRef.close();
  }

  private setFilesWithError(rdfModels: RdfModel[]) {
    for (const status of this.migrationStatus) {
      for (const fileStatus of status.files) {
        if (!fileStatus.success) {
          this.hasErrors = true;

          if (!this.filteredErrorFiles[status.namespace]) {
            this.filteredErrorFiles[status.namespace] = [fileStatus.name];
          } else {
            this.filteredErrorFiles[status.namespace].push(fileStatus.name);
          }
          continue;
        }

        const hasErroredRdfModel = rdfModels.some(rdfModel => {
          if (rdfModel.aspectModelFileName !== fileStatus.name) {
            return false;
          }

          const [namespace] = rdfModel.aspectUrn.split('#');
          return namespace.endsWith(status.namespace);
        });

        if (hasErroredRdfModel) {
          if (!this.filteredErrorFiles[status.namespace]) {
            this.filteredErrorFiles[status.namespace] = [fileStatus.name];
          } else {
            this.filteredErrorFiles[status.namespace].push(fileStatus.name);
          }
          this.hasErrors = true;
        }
      }
    }
  }
}
