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

import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {
  BaseMetaModelElement,
  DefaultAbstractEntity,
  DefaultAspect,
  DefaultEntity,
  OverWrittenProperty,
  OverWrittenPropertyKeys,
} from '@ame/meta-model';
import {first} from 'rxjs/operators';
import {PropertiesModalComponent} from '..';
import {EditorModelService} from '../../../editor-model.service';

export interface UpdatedProperties {
  [key: string]: OverWrittenPropertyKeys;
}

@Component({
  selector: 'ame-properties-button',
  templateUrl: './properties-button.component.html',
  styleUrls: ['./properties-button.component.scss'],
})
export class PropertiesButtonComponent implements OnInit {
  @Output() overwrite = new EventEmitter();
  metaModelElement: DefaultEntity | DefaultAspect | DefaultAbstractEntity;

  private propertiesClone: OverWrittenProperty[];

  constructor(private matDialog: MatDialog, private metaModelDialogService: EditorModelService) {}

  ngOnInit(): void {
    this.metaModelDialogService.getMetaModelElement().subscribe((metaModelElement: BaseMetaModelElement) => {
      if (
        metaModelElement instanceof DefaultEntity ||
        metaModelElement instanceof DefaultAbstractEntity ||
        metaModelElement instanceof DefaultAspect
      ) {
        this.metaModelElement = metaModelElement;
      }
    });
  }

  openPropertiesTable() {
    this.matDialog
      .open(PropertiesModalComponent, {
        data: {
          name: this.metaModelElement.name,
          properties: this.propertiesClone || this.metaModelElement.properties,
          isExternalRef: this.metaModelElement.isExternalReference(),
          metaModelElement: this.metaModelElement,
        },
        autoFocus: false,
      })
      .afterClosed()
      .pipe(first())
      .subscribe((data: UpdatedProperties) => {
        if (!data) {
          return;
        }

        this.propertiesClone = JSON.parse(JSON.stringify(this.metaModelElement.properties)) as Array<OverWrittenProperty>;
        for (const {
          property: {aspectModelUrn},
          keys,
        } of this.propertiesClone) {
          keys.notInPayload = data[aspectModelUrn].notInPayload;
          keys.optional = data[aspectModelUrn].optional;
          keys.payloadName = data[aspectModelUrn].payloadName;
        }

        this.overwrite.emit(data);
      });
  }
}
