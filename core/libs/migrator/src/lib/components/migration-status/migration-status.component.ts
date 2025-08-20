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

import {NamespaceStatus} from '@ame/api';
import {APP_CONFIG, AppConfig} from '@ame/shared';
import {CdkScrollable} from '@angular/cdk/scrolling';
import {KeyValuePipe} from '@angular/common';
import {Component, Inject, NgZone, OnInit} from '@angular/core';
import {MatButton} from '@angular/material/button';
import {MatDialogActions, MatDialogContent, MatDialogTitle} from '@angular/material/dialog';
import {MatIcon} from '@angular/material/icon';
import {Router} from '@angular/router';
import {RdfModel} from '@esmf/aspect-model-loader';
import {TranslateModule} from '@ngx-translate/core';
import {MigratorService} from '../../migrator.service';

interface CompatibleAmeSammVersions {
  sammVersion: string;
  ameVersion: string;
}

interface ErrorFileItem {
  name: string;
  message: string;
  namespace: string;
  ameSammCompatibleVersions: CompatibleAmeSammVersions;
}

@Component({
  selector: 'ame-migration-status',
  templateUrl: './migration-status.component.html',
  styleUrls: ['./migration-status.component.scss'],
  standalone: true,
  imports: [MatDialogTitle, CdkScrollable, MatDialogContent, MatIcon, MatDialogActions, MatButton, KeyValuePipe, TranslateModule],
})
export class MigrationStatusComponent implements OnInit {
  public migrationStatus: NamespaceStatus[] = [];
  public filteredErrorFiles = {};
  public hasErrors = false;
  public hasMoreThanOneErrorFile: boolean;

  get translationParams() {
    return {
      version: this.config.currentSammVersion,
      fileCount: this.hasMoreThanOneErrorFile ? 'several files' : 'one file',
      fileCountMessage: this.hasMoreThanOneErrorFile ? 'these files' : 'this file',
    };
  }

  constructor(
    public migratorService: MigratorService,
    private router: Router,
    private ngZone: NgZone,
    @Inject(APP_CONFIG) public config: AppConfig,
  ) {}

  ngOnInit(): void {
    this.migrationStatus = history.state.data?.namespaces || [];
    this.hasErrors = this.migrationStatus.length <= 0;

    // @todo !important check this functionality
    // this.modelLoader.loadWorkspaceModels().subscribe(files => {
    //   const rdfModels = files.map(({rdfModel}) => rdfModel);
    //   const erroredModels = rdfModels.filter(rdfModel => rdfModel); //?.hasErrors);
    //   this.hasErrors ||= erroredModels.length > 0;
    //   this.setFilesWithError(erroredModels);

    //   if (!this.migratorService.increaseNamespaceVersion) {
    //     this.electronSignalsService.call('requestRefreshWorkspaces');
    //   }
    // });
  }

  increaseVersion() {
    if (this.migratorService.increaseNamespaceVersion) {
      this.ngZone.run(() => this.router.navigate([{outlets: {migrator: 'increase-version'}}]));
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
            this.filteredErrorFiles[status.namespace] = [
              this.createErrorFileItem(fileStatus.name, fileStatus.message, status.namespace, rdfModels),
            ];
          } else {
            this.filteredErrorFiles[status.namespace].push(
              this.createErrorFileItem(fileStatus.name, fileStatus.message, status.namespace, rdfModels),
            );
          }
          continue;
        }
        // @TODO rdfModel should be NamespaceFile
        const hasErroredRdfModel = false; // remove after todo
        // const hasErroredRdfModel = rdfModels.some(rdfModel => {
        //   if (rdfModel.aspectModelFileName !== fileStatus.name) {
        //     return false;
        //   }

        //   const [namespace] = rdfModel.aspectUrn.split('#');
        //   return namespace.endsWith(status.namespace);
        // });

        if (hasErroredRdfModel) {
          if (!this.filteredErrorFiles[status.namespace]) {
            this.filteredErrorFiles[status.namespace] = [
              this.createErrorFileItem(fileStatus.name, fileStatus.message, status.namespace, rdfModels),
            ];
          } else {
            this.filteredErrorFiles[status.namespace].push(
              this.createErrorFileItem(fileStatus.name, fileStatus.message, status.namespace, rdfModels),
            );
          }
          this.hasErrors = true;
        }
      }
    }
    this.hasMoreThanOneErrorFile = this.errorFilesContainsMoreFiles(this.filteredErrorFiles);
  }

  private createErrorFileItem(name: string, message: string, namespace: string, rdfModels: RdfModel[]): ErrorFileItem {
    return {
      name: name,
      message: this.formatErrorMessage(message),
      namespace: namespace,
      ameSammCompatibleVersions: this.getAmeAndSammCompatibleVersions(rdfModels, namespace),
    };
  }

  private errorFilesContainsMoreFiles(obj: {[key: string]: {value: any}[]}): boolean {
    if (Object.keys(obj).length > 1) {
      return true;
    } else {
      for (const key in obj) {
        if (obj[key].length > 1) {
          return true;
        }
      }
    }
    return false;
  }

  private getAmeVersion(sammVersion: string): string | undefined {
    switch (sammVersion) {
      case '2.1.0':
        return '5.1.0';
      case '2.2.0':
        return '6.0.0';
      default:
        return undefined;
    }
  }

  private removeAfterChar(originalString: string, char: string) {
    const charIndex = originalString.indexOf(char);
    if (charIndex !== -1) {
      return originalString.substring(0, charIndex);
    } else {
      return originalString;
    }
  }

  private formatErrorMessage(msg: string) {
    let formatedMsg = msg;
    const charsToRemove = ['[', ']'];
    for (const char of charsToRemove) {
      formatedMsg = formatedMsg.split(char).join('');
    }
    return formatedMsg;
  }

  private getAmeAndSammCompatibleVersions(rdfModels: RdfModel[], errorFileNamespace: string): CompatibleAmeSammVersions {
    const version = rdfModels.filter(rdfModel => {
      const defaultPrefix = rdfModel.getPrefixes().default;
      const withoutSammPrefix = defaultPrefix.substring('urn:samm:'.length);
      return this.removeAfterChar(withoutSammPrefix, ':') === this.removeAfterChar(errorFileNamespace, ':');
    });
    return {sammVersion: version[0].samm.version, ameVersion: this.getAmeVersion(version[0].samm.version)};
  }

  values(value: any): any {
    return value as any;
  }
}
