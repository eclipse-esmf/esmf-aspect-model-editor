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

import {BaseMetaModelElement} from '@ame/meta-model';
import {MxGraphHelper, MxGraphService} from '@ame/mx-graph';
import {Component, Inject} from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import {mxgraph} from 'mxgraph-factory';
import {ModelElementParser} from '../editor-dialog';

interface Element {
  cell: mxgraph.mxCell;
  model: BaseMetaModelElement;
}

@Component({
  selector: 'ame-connect-with-dialog',
  templateUrl: './connect-with-dialog.component.html',
  styleUrls: ['./connect-with-dialog.component.scss'],
})
export class ConnectWithDialogComponent {
  public elements: Element[];
  public selectedElement: Element;
  public connectWithModel: BaseMetaModelElement;

  private elementParser = new ModelElementParser();

  constructor(
    private mxGraphService: MxGraphService,
    private dialogRef: MatDialogRef<ConnectWithDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public connectWithCell
  ) {
    this.connectWithModel = MxGraphHelper.getModelElement(connectWithCell);
    this.elements = this.mxGraphService.getAllCells().map(e => {
      return {model: MxGraphHelper.getModelElement(e), cell: e};
    });
  }

  getClass(element: BaseMetaModelElement) {
    return this.elementParser.transform(element).type;
  }

  getFirstLetter(element: BaseMetaModelElement) {
    return this.elementParser.transform(element).shortcut;
  }

  isFiltered(element: Element, searched: string) {
    return (
      element.model.name.toLowerCase().includes(searched.toLowerCase()) &&
      element.model.aspectModelUrn !== this.connectWithModel?.aspectModelUrn
    );
  }

  isSelected({model}: Element) {
    return this.selectedElement?.model.aspectModelUrn === model?.aspectModelUrn;
  }

  close() {
    this.dialogRef.close();
  }

  connect() {
    if (!this.selectedElement) {
      return;
    }

    this.dialogRef.close({...this.selectedElement});
  }
}
