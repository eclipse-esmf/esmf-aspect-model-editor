/*
 * Copyright (c) 2026 Robert Bosch Manufacturing Solutions GmbH
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

import {Component, inject, OnInit, signal} from '@angular/core';
import {FormField} from '@angular/forms/signals';
import {MatAccordion, MatExpansionPanel, MatExpansionPanelHeader, MatExpansionPanelTitle} from '@angular/material/expansion';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatError, MatInput, MatLabel} from '@angular/material/input';
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderCellDef,
  MatHeaderRow,
  MatHeaderRowDef,
  MatRow,
  MatRowDef,
  MatTable,
} from '@angular/material/table';
import {MatTooltip} from '@angular/material/tooltip';
import {Samm} from '@esmf/aspect-model-loader';
import {TranslocoDirective} from '@jsverse/transloco';
import {SettingsFormService} from '../../../services';

@Component({
  selector: 'ame-namespace',
  templateUrl: './namespace-settings.component.html',
  styleUrls: ['./namespace-settings.component.scss'],
  imports: [
    FormField,
    MatIconModule,
    MatTooltip,
    MatFormFieldModule,
    MatLabel,
    MatInput,
    MatError,
    MatAccordion,
    MatExpansionPanel,
    MatExpansionPanelHeader,
    MatExpansionPanelTitle,
    MatTable,
    MatColumnDef,
    MatHeaderCellDef,
    MatHeaderCell,
    MatCellDef,
    MatCell,
    MatHeaderRowDef,
    MatRowDef,
    MatHeaderRow,
    MatRow,
    TranslocoDirective,
  ],
})
export class NamespaceSettingsComponent implements OnInit {
  protected readonly formService = inject(SettingsFormService);

  readonly form = this.formService.settingsForm;

  public columns = signal(['name', 'value', 'version']);
  public panelOpenState = signal(false);
  public predefinedNamespaces = signal<{name: string; value: string; version: string}[]>([]);

  ngOnInit(): void {
    this.initializePredefinedNamespaces();
  }

  private initializePredefinedNamespaces(): void {
    const loadedRdfModel = this.formService.getLoadedRdfModel();
    const namespaces = loadedRdfModel ? loadedRdfModel.getNamespaces() : {};
    this.predefinedNamespaces.set(
      Object.keys(namespaces || {})
        .filter(key => this.isValidNamespaceKey(key, namespaces[key]))
        .map(key => this.createNamespaceEntry(namespaces[key])),
    );
  }

  private isValidNamespaceKey(key: string, uri: string): boolean {
    return key !== '' && Samm.isDefaultNamespaceUri(uri);
  }

  private createNamespaceEntry(uri: string): {name: string; value: string; version: string} {
    if (uri.startsWith(Samm.XSD_URI)) {
      return {name: 'xsd', value: Samm.XSD_URI, version: '2001'};
    }

    if (uri.startsWith(Samm.RDF_URI)) {
      return this.createRdfNamespaceEntry(uri);
    }

    if (uri.startsWith(Samm.RDFS_URI)) {
      return {name: 'rdfs', value: Samm.RDFS_URI, version: '2000'};
    }

    return this.createGenericNamespaceEntry(uri);
  }

  private createGenericNamespaceEntry(uri: string): {name: string; value: string; version: string} {
    const namespaceParts = uri.split(':');

    return {
      name: namespaceParts[3] || '',
      value: `${namespaceParts[0]}:${namespaceParts[1]}:${namespaceParts[2]}`,
      version: namespaceParts[4] ? namespaceParts[4].replace('#', '') : '',
    };
  }

  private createRdfNamespaceEntry(uri: string): {name: string; value: string; version: string} {
    const namespaceParts = uri.split(':');
    if (namespaceParts.length < 5) {
      return {name: 'rdf', value: Samm.RDF_URI, version: '1999'};
    }

    return this.createGenericNamespaceEntry(uri);
  }
}
