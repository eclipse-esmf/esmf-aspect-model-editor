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

import {LoadedFilesService, ModelService} from '@ame/domain';
import {inject, Injectable, Injector} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {PrefixChangeError, RdfModel} from '@esmf/aspect-model-loader';
import {DataFactory} from 'n3';
import {catchError, map, Observable, of, Subject, take} from 'rxjs';
import {ModelHistoryService} from '../history/model-history.service';
import {ModelSavingTrackerService} from '../model-saving-tracker.service';
import {TabStateService} from '../tabs/tab-state.service';
import {NamespacePrefixDialogComponent, NamespacePrefixDialogData} from './namespace-prefix-dialog.component';
import {PrefixManagementDialogComponent, PrefixManagementDialogData} from './prefix-management-dialog.component';

/** The namespace of an IRI including the separator, e.g. `urn:samm:org.example:1.0.0#`. */
export function namespaceOf(iri: string): string {
  const hash = iri.indexOf('#');
  return hash >= 0 ? iri.slice(0, hash + 1) : iri.slice(0, iri.lastIndexOf('/') + 1);
}

/**
 * Manages the prefixes of the current Aspect Model. A prefix is only the notation of a namespace:
 * changing it never changes the IRIs of the model.
 */
@Injectable({providedIn: 'root'})
export class PrefixManagementService {
  private readonly matDialog = inject(MatDialog);
  private readonly loadedFilesService = inject(LoadedFilesService);
  private readonly modelSavingTracker = inject(ModelSavingTrackerService);
  private readonly tabStateService = inject(TabStateService);
  private readonly modelService = inject(ModelService);
  private readonly injector = inject(Injector);

  /** Emits when the prefixes of the current model were changed by the user. */
  readonly prefixesChanged$ = new Subject<void>();

  private get rdfModel(): RdfModel | null {
    return this.loadedFilesService.currentLoadedFile?.rdfModel ?? null;
  }

  openManagement(): void {
    const rdfModel = this.rdfModel;
    if (!rdfModel) return;

    // the usage of the prefixes is calculated from the RDF store, which has to contain the latest graph changes
    this.modelService
      .synchronizeModelToRdf()
      .pipe(
        take(1),
        catchError(() => of(null)),
      )
      .subscribe(() => {
        const dialogRef = this.matDialog.open<PrefixManagementDialogComponent, PrefixManagementDialogData, boolean>(
          PrefixManagementDialogComponent,
          {data: {rdfModel}, width: '760px', maxWidth: '90vw', autoFocus: false},
        );
        const dialog = dialogRef.componentInstance;
        dialogRef.afterClosed().subscribe(changed => {
          if (!changed && !dialog?.hasChanges) return;
          this.notifyChanged();
          // undo restores whole model versions, which would silently revert the prefixes as well
          this.injector.get(ModelHistoryService).reset();
        });
      });
  }

  /**
   * Makes sure the namespace of a referenced element has a prefix in the current model.
   * Existing prefixes are reused; for a new namespace the user chooses the prefix.
   * Emits the alias, or `null` when the user leaves it to the automatic prefix.
   */
  ensurePrefixForReference(aspectModelUrn: string): Observable<string | null> {
    const rdfModel = this.rdfModel;
    if (!rdfModel || !aspectModelUrn) return of(null);

    const namespace = namespaceOf(aspectModelUrn);
    const existingAlias = rdfModel.getAliasByNamespace(namespace);
    if (existingAlias !== undefined) return of(existingAlias);

    const sourceAlias = this.findSourceAlias(aspectModelUrn, namespace);
    const suggestion = rdfModel.suggestPrefixAlias(namespace, sourceAlias);

    return this.matDialog
      .open<NamespacePrefixDialogComponent, NamespacePrefixDialogData, string>(NamespacePrefixDialogComponent, {
        data: {rdfModel, namespace, suggestion, sourceAlias: sourceAlias ?? null, elementName: aspectModelUrn.slice(namespace.length)},
        width: '560px',
        maxWidth: '90vw',
      })
      .afterClosed()
      .pipe(
        map(alias => {
          if (!alias || this.applyReferencePrefix(rdfModel, alias, namespace)) return null;
          this.notifyChanged();
          return alias;
        }),
      );
  }

  /**
   * Uses the alias for the namespace. A prefix which was created automatically in the meantime is renamed.
   */
  applyReferencePrefix(rdfModel: RdfModel, alias: string, namespace: string): PrefixChangeError | null {
    const existingAlias = rdfModel.getAliasByNamespace(namespace);
    if (existingAlias === alias) {
      rdfModel.serializationMetadata.markPrefixExplicit(alias);
      return null;
    }
    return existingAlias !== undefined ? rdfModel.renamePrefix(existingAlias, alias) : rdfModel.definePrefix(alias, namespace);
  }

  /** Marks the tab as changed when the file content changes and informs the views. */
  notifyChanged(): void {
    this.modelSavingTracker.isSaved$.pipe(take(1)).subscribe(isSaved => {
      const activeTabId = this.tabStateService.activeTabId();
      if (activeTabId) {
        this.tabStateService.setTabDirty(activeTabId, !isSaved);
      }
    });
    this.prefixesChanged$.next();
  }

  /** The alias the referenced file uses for the namespace (the default prefix of a file has no name). */
  private findSourceAlias(aspectModelUrn: string, namespace: string): string | undefined {
    const sourceFile = this.loadedFilesService.externalFiles.find(
      file => file.rdfModel?.store.getQuads(DataFactory.namedNode(aspectModelUrn), null, null, null).length > 0,
    );
    const alias = sourceFile?.rdfModel?.getAliasByNamespace(namespace);
    return alias || undefined;
  }
}
