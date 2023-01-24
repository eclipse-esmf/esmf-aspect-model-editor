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
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {Aspect} from '@ame/meta-model';
import {GeneralConfig} from '@ame/shared';
import {NamespaceConfirmationModalComponent} from '../namespace-confirmation-modal/namespace-confirmation-modal.component';
import {Bamm} from '@ame/vocabulary';
import {ModelService} from '@ame/rdf/services';
import {RdfModel} from '@ame/rdf/utils';

@Component({
  selector: 'ame-namespace',
  templateUrl: './namespace.component.html',
  styleUrls: ['./namespace.component.scss'],
})
export class NamespaceComponent implements OnInit {
  columns: string[] = ['name', 'value', 'version'];
  predefinedNamespaces: Array<{name?: string; value?: string; version?: string}> = [];

  namespaceForm = new FormGroup({
    aspectUri: new FormControl('', Validators.required),
    aspectName: new FormControl({value: '', disabled: true}),
    aspectVersion: new FormControl(''),
    bammVersion: new FormControl({value: GeneralConfig.bammVersion, disabled: true}),
  });
  aspectUri: FormControl;
  aspectUriInitialValue: string;
  aspectVersionInitialValue: string;
  loadedRdfModel: RdfModel;

  constructor(private modelService: ModelService, private dialogRef: MatDialogRef<NamespaceComponent>, private matDialog: MatDialog) {}

  ngOnInit() {
    this.predefinedNamespaces = [];

    const loadedAspectModel = this.modelService.getLoadedAspectModel();
    const loadedAspect = loadedAspectModel.aspect;
    this.loadedRdfModel = loadedAspectModel.rdfModel;
    if (loadedAspect) {
      const namespaceAspectParts = loadedAspect.aspectModelUrn.split(':');
      this.aspectVersionInitialValue = namespaceAspectParts[3].split('#')[0];
      this.aspectUriInitialValue = `${namespaceAspectParts[2]}`;

      this.initForm(loadedAspect, this.aspectVersionInitialValue);

      const namespaces = loadedAspectModel.rdfModel.getNamespaces();

      Object.keys(namespaces).forEach(key => {
        if (loadedAspect.aspectModelUrn === `${namespaces[key]}${loadedAspect.name}`) {
          return;
        }
        if (!Bamm.isDefaultNamespaceUri(namespaces[key])) {
          return;
        }
        if (namespaces[key].startsWith(Bamm.XSD_URI)) {
          this.predefinedNamespaces.push({
            name: 'xsd',
            value: Bamm.XSD_URI,
            version: '2001',
          });
          return;
        }
        const namespaceParts = namespaces[key].split(':');
        if (namespaces[key].startsWith(Bamm.RDF_URI) && namespaceParts.length < 5) {
          this.predefinedNamespaces.push({
            name: 'rdf',
            value: Bamm.RDF_URI,
            version: '1999',
          });
          return;
        }
        if (namespaces[key].startsWith(Bamm.RDFS_URI) && namespaceParts.length < 5) {
          this.predefinedNamespaces.push({
            name: 'rdfs',
            value: Bamm.RDFS_URI,
            version: '2000',
          });
          return;
        }
        this.predefinedNamespaces.push({
          name: `${namespaceParts[3]}`,
          value: `${namespaceParts[0]}:${namespaceParts[1]}:${namespaceParts[2]}`,
          version: `${namespaceParts[4].replace('#', '')}`,
        });
      });
    }
  }

  private initForm(loadedAspect: Aspect, aspectVersion: string): void {
    this.namespaceForm = new FormGroup({
      aspectUri: new FormControl(this.aspectUriInitialValue, Validators.required),
      aspectName: new FormControl({value: `${loadedAspect.name}`, disabled: true}),
      aspectVersion: new FormControl(aspectVersion),
      bammVersion: new FormControl({value: GeneralConfig.bammVersion, disabled: true}),
    });
  }

  areSameAspectValues(): boolean {
    return (
      this.namespaceForm?.get('aspectUri')?.value === this.aspectUriInitialValue &&
      this.namespaceForm?.get('aspectVersion')?.value === this.aspectVersionInitialValue
    );
  }

  onSubmit(): void {
    const newNamespace = this.namespaceForm?.get('aspectUri')?.value;
    const newVersion = this.namespaceForm?.get('aspectVersion')?.value;
    const config = {
      data: {
        oldNamespace: this.aspectUriInitialValue,
        newNamespace: newNamespace,
        oldVersion: this.aspectVersionInitialValue,
        newVersion: newVersion,
        rdfModel: this.loadedRdfModel,
      },
    };
    this.matDialog
      .open(NamespaceConfirmationModalComponent, config)
      .afterClosed()
      .subscribe((save: boolean) => {
        if (save) {
          this.aspectUriInitialValue = newNamespace;
          this.aspectVersionInitialValue = newVersion;
        }
      });
  }

  onClose(): void {
    this.dialogRef.close();
  }
}
