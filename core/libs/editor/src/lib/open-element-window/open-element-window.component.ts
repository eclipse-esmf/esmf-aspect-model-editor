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
import {ModelApiService} from '@ame/api';
import {ElectronSignals, ElectronSignalsService, NotificationsService} from '@ame/shared';
import {DialogRef} from '@angular/cdk/dialog';
import {Component, Inject, OnInit, inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogModule} from '@angular/material/dialog';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {NamedNode} from 'n3';
import {catchError, of, switchMap, tap} from 'rxjs';
import {ModelLoaderService} from '../model-loader.service';

@Component({
  standalone: true,
  templateUrl: 'open-element-window.component.html',
  styles: [
    `
      :host,
      mat-dialog-content {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
      }

      :host {
        min-width: 300px;
      }

      mat-dialog-content {
        min-height: 50px;
      }
    `,
  ],
  imports: [MatDialogModule, MatProgressSpinnerModule],
})
export class OpenElementWindowComponent implements OnInit {
  private electronSignalsService: ElectronSignals = inject(ElectronSignalsService);
  private modelLoaderService = inject(ModelLoaderService);

  constructor(
    private dialogRef: DialogRef<OpenElementWindowComponent>,
    private modelApiService: ModelApiService,
    private notificationService: NotificationsService,
    @Inject(MAT_DIALOG_DATA) private elementInfo: {urn: string; file: string},
  ) {}

  ngOnInit() {
    const [namespace, elementName] = this.elementInfo.urn.replace('urn:samm:', '').split('#');
    this.modelApiService
      .getAspectMetaModel(this.elementInfo.urn)
      .pipe(
        switchMap((model: string) => this.modelLoaderService.parseRdfModel([model])),
        tap(rdfModel => {
          const quads = rdfModel.store.getQuads(new NamedNode(this.elementInfo.urn), null, null, null);
          if (quads.length) {
            this.electronSignalsService.call('openWindow', {
              namespace: namespace,
              file: this.elementInfo.file,
              editElement: this.elementInfo.urn,
              fromWorkspace: true,
              aspectModelUrn: this.elementInfo.urn,
            });
          } else {
            this.notificationService.error({
              title: 'No element found',
              message: `${elementName} was not found in ${this.elementInfo.file}`,
            });
          }
          this.dialogRef.close();
        }),
        catchError(error => {
          this.notificationService.error({
            title: 'Could not open file',
            message: `${this.elementInfo.file} could not be opened.`,
          });
          this.dialogRef.close();
          return of(error);
        }),
      )
      .subscribe();
  }
}
