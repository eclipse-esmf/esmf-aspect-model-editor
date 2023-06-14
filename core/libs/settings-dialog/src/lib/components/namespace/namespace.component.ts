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

import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {GeneralConfig} from '@ame/shared';
import {NamespaceConfirmationModalComponent} from '../namespace-confirmation-modal/namespace-confirmation-modal.component';
import {Samm} from '@ame/vocabulary';
import {ModelService} from '@ame/rdf/services';
import {RdfModel} from '@ame/rdf/utils';
import {filter, tap} from 'rxjs';

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
    sammVersion: new FormControl({value: GeneralConfig.sammVersion, disabled: true}),
  });
  aspectUri: FormControl;
  aspectUriInitialValue: string;
  aspectVersionInitialValue: string;
  loadedRdfModel: RdfModel;

  constructor(private modelService: ModelService, private dialogRef: MatDialogRef<NamespaceComponent>, private matDialog: MatDialog) {}

  ngOnInit() {
    this.predefinedNamespaces = [];
    this.loadedRdfModel = this.modelService.getLoadedAspectModel().rdfModel;
    const [namespace, version, modelName] = this.loadedRdfModel.absoluteAspectModelFileName.replace('.ttl', '').split(':');

    this.aspectUriInitialValue = namespace;
    this.aspectVersionInitialValue = version;

    this.namespaceForm = new FormGroup({
      aspectUri: new FormControl(namespace, Validators.required),
      aspectName: new FormControl({value: modelName, disabled: true}),
      aspectVersion: new FormControl(version),
      sammVersion: new FormControl({value: GeneralConfig.sammVersion, disabled: true}),
    });

    const namespaces = this.loadedRdfModel.getNamespaces();

    Object.keys(namespaces).forEach(key => {
      if (key === '') {
        return;
      }

      if (!Samm.isDefaultNamespaceUri(namespaces[key])) {
        return;
      }

      if (namespaces[key].startsWith(Samm.XSD_URI)) {
        this.predefinedNamespaces.push({
          name: 'xsd',
          value: Samm.XSD_URI,
          version: '2001',
        });
        return;
      }
      const namespaceParts = namespaces[key].split(':');
      if (namespaces[key].startsWith(Samm.RDF_URI) && namespaceParts.length < 5) {
        this.predefinedNamespaces.push({
          name: 'rdf',
          value: Samm.RDF_URI,
          version: '1999',
        });
        return;
      }
      if (namespaces[key].startsWith(Samm.RDFS_URI) && namespaceParts.length < 5) {
        this.predefinedNamespaces.push({
          name: 'rdfs',
          value: Samm.RDFS_URI,
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

  areSameAspectValues(): boolean {
    return (
      this.namespaceForm?.get('aspectUri')?.value === this.aspectUriInitialValue &&
      this.namespaceForm?.get('aspectVersion')?.value === this.aspectVersionInitialValue
    );
  }

  onSubmit(formValue): void {
    const newNamespace = formValue.aspectUri;
    const newVersion = formValue.aspectVersion;
    const config = {
      data: {
        oldNamespace: this.aspectUriInitialValue,
        oldVersion: this.aspectVersionInitialValue,
        rdfModel: this.loadedRdfModel,
        newNamespace,
        newVersion,
      },
    };

    this.matDialog
      .open(NamespaceConfirmationModalComponent, config)
      .afterClosed()
      .pipe(
        filter(isApproved => isApproved),
        tap(() => {
          this.aspectUriInitialValue = newNamespace;
          this.aspectVersionInitialValue = newVersion;
          this.onClose();
        })
      )
      .subscribe();
  }

  onClose(): void {
    this.dialogRef.close();
  }
}
