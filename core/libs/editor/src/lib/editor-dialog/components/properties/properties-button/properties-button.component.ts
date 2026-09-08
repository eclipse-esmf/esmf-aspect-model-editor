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

import {LoadedFilesService} from '@ame/cache';
import {Component, DestroyRef, inject, output} from '@angular/core';
import {takeUntilDestroyed, toSignal} from '@angular/core/rxjs-interop';
import {MatButton} from '@angular/material/button';
import {MatDialog} from '@angular/material/dialog';
import {MatIconModule} from '@angular/material/icon';
import {DefaultAspect, DefaultEntity, PropertyPayload} from '@esmf/aspect-model-loader';
import {TranslocoDirective} from '@jsverse/transloco';
import {filter, tap} from 'rxjs';
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
  imports: [MatIconModule, TranslocoDirective, MatButton],
})
export class PropertiesButtonComponent {
  private destroyRef = inject(DestroyRef);
  private matDialog = inject(MatDialog);
  private metaModelDialogService = inject(EditorModelService);
  private loadedFiles = inject(LoadedFilesService);

  public readonly overwrite = output<UpdatedProperties>();

  private propertiesPayload: Record<string, PropertyPayload> = {};

  public metaModelElement = toSignal(
    this.metaModelDialogService.getMetaModelElement().pipe(
      filter((element): element is DefaultEntity | DefaultAspect => element instanceof DefaultEntity || element instanceof DefaultAspect),
      tap(metaModelElement => {
        try {
          this.propertiesPayload = metaModelElement.propertiesPayload ? JSON.parse(JSON.stringify(metaModelElement.propertiesPayload)) : {};
        } catch {
          this.propertiesPayload = {};
        }
      }),
    ),
  );

  public get isPredefined(): boolean {
    return this.metaModelElement()?.isPredefined;
  }

  openPropertiesTable() {
    this.matDialog
      .open(PropertiesModalComponent, {
        data: {
          propertiesPayload: this.propertiesPayload,
          isExternalRef: this.loadedFiles.isElementExtern(this.metaModelElement()),
          metaModelElement: this.metaModelElement(),
          isPredefined: this.isPredefined,
        } as PropertiesDialogData,
        autoFocus: false,
      })
      .beforeClosed()
      .pipe(takeUntilDestroyed(this.destroyRef), first())
      .subscribe((data: UpdatedProperties) => {
        if (!data) {
          return;
        }

        const properties = this.metaModelElement()?.properties || [];
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
