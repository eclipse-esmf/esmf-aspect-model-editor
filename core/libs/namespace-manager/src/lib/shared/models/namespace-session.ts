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

import {MatDialogRef} from '@angular/material/dialog';
import {BehaviorSubject} from 'rxjs';
import {RootExportNamespacesComponent} from '../../namespace-exporter/components';
import {RootNamespacesImporterComponent} from '../../namespace-importer/components';
import {MissingElement} from './missing-element.interface';
import {ValidFile} from './valid-files.interface';
import {Violation} from './violation';

export interface NamespacesSessionInterface {
  modalRef: MatDialogRef<RootNamespacesImporterComponent | RootExportNamespacesComponent>;
  missingElements: MissingElement[];
  invalidFiles: string[];
  violations: Violation[];
  files: string[];
  conflictFiles: {
    replace: string[];
    keep: string[];
  };
  state: {
    validating$: BehaviorSubject<boolean>;
    importing$: BehaviorSubject<boolean>;
  };
}

export class NamespacesSession implements NamespacesSessionInterface {
  public modalRef: MatDialogRef<RootNamespacesImporterComponent>;
  public missingElements: MissingElement[] = [];
  public invalidFiles: string[] = [];
  public violations: Violation[] = [];
  public files: string[] = [];

  public conflictFiles = {
    replace: [],
    keep: [],
  };

  public state = {
    validating$: new BehaviorSubject(false),
    importing$: new BehaviorSubject(false),
  };

  public parseResponse(validationResult: any) {
    this.missingElements = validationResult.missingElements || [];
    this.invalidFiles = validationResult.invalidFiles || [];
    this.processValidFiles(validationResult.validFiles);
  }

  private processValidFiles(files: ValidFile[]) {
    this.files = files.map(({aspectModelFileName}) => aspectModelFileName);

    const {replace, keep} = files.reduce(
      (acc, validation) => {
        const namespaceSections = validation.aspectModelFileName.split(':');
        const file = namespaceSections.pop();
        const namespace = namespaceSections.join(':');

        (validation.fileAlreadyDefined ? acc.replace : acc.keep).add(namespace);

        const violationErrors = validation?.violationReport?.violationErrors || [];

        let violation = this.violations.find(violation => violation.key === namespace);
        if (!violation) {
          this.violations.push({key: namespace, value: []});
          violation = this.violations[this.violations.length - 1];
        }
        violation.value.push({
          file: file,
          violationError: violationErrors,
        });

        return acc;
      },
      {
        replace: new Set(),
        keep: new Set(),
      }
    );

    this.conflictFiles.keep = Array.from(keep);
    this.conflictFiles.replace = Array.from(replace);
  }
}
