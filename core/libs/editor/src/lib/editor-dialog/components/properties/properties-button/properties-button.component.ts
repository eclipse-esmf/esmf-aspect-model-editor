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

import {LoadedFilesService} from '@ame/cache';
import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {DefaultAspect, DefaultEntity, NamedElement, PropertyPayload} from '@esmf/aspect-model-loader';
import {first} from 'rxjs/operators';
import {EditorModelService} from '../../../editor-model.service';
import {PropertiesDialogData, PropertiesModalComponent} from '../properties-modal/properties-modal.component';

export interface UpdatedProperties {
  [key: string]: PropertyPayload & {name: string};
}

@Component({
  selector: 'ame-properties-button',
  templateUrl: './properties-button.component.html',
  styleUrls: ['./properties-button.component.scss'],
})
export class PropertiesButtonComponent implements OnInit {
  @Output() overwrite = new EventEmitter();

  private propertiesPayload: typeof this.metaModelElement.propertiesPayload = {};

  public metaModelElement: DefaultEntity | DefaultAspect;
  public get isPredefined(): boolean {
    return this.metaModelElement?.isPredefined;
  }

  constructor(
    private matDialog: MatDialog,
    private metaModelDialogService: EditorModelService,
    private loadedFiles: LoadedFilesService,
  ) {}

  ngOnInit(): void {
    this.metaModelDialogService.getMetaModelElement().subscribe((metaModelElement: NamedElement) => {
      if (metaModelElement instanceof DefaultEntity || metaModelElement instanceof DefaultAspect) {
        this.metaModelElement = metaModelElement;
        this.propertiesPayload = structuredClone(metaModelElement.propertiesPayload);
      }
    });
  }

  openPropertiesTable() {
    this.matDialog
      .open(PropertiesModalComponent, {
        data: {
          propertiesPayload: this.propertiesPayload,
          isExternalRef: this.loadedFiles.isElementExtern(this.metaModelElement),
          metaModelElement: this.metaModelElement,
          isPredefined: this.isPredefined,
        } as PropertiesDialogData,
        autoFocus: false,
      })
      .afterClosed()
      .pipe(first())
      .subscribe((data: UpdatedProperties) => {
        if (!data) {
          return;
        }

        const properties = this.metaModelElement.properties;
        for (const property of properties) {
          if (!data[property.aspectModelUrn]) {
            continue;
          }

          if (!this.propertiesPayload[property.aspectModelUrn]) {
            this.propertiesPayload[property.aspectModelUrn] = {} as any;
          }

          this.propertiesPayload[property.aspectModelUrn].notInPayload = data[property.aspectModelUrn].notInPayload;
          this.propertiesPayload[property.aspectModelUrn].optional = data[property.aspectModelUrn].optional;
          this.propertiesPayload[property.aspectModelUrn].payloadName = data[property.aspectModelUrn].payloadName;
        }

        this.overwrite.emit(data);
      });
  }
}
