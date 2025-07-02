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

import {ModelElementParserPipe} from '@ame/editor';
import {MxGraphHelper, MxGraphService} from '@ame/mx-graph';
import {CommonModule} from '@angular/common';
import {Component, Inject} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MAT_DIALOG_DATA, MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatTooltipModule} from '@angular/material/tooltip';
import {NamedElement} from '@esmf/aspect-model-loader';
import {mxgraph} from 'mxgraph-factory';

interface Element {
  cell: mxgraph.mxCell;
  model: NamedElement;
}

@Component({
  standalone: true,
  selector: 'ame-connect-with-dialog',
  templateUrl: './connect-with-dialog.component.html',
  styleUrls: ['./connect-with-dialog.component.scss'],
  imports: [MatFormFieldModule, MatTooltipModule, CommonModule, MatButtonModule, MatDialogModule, MatInputModule],
})
export class ConnectWithDialogComponent {
  public elements: Element[];
  public selectedElement: Element;
  public connectWithModel: NamedElement;

  private elementParser = new ModelElementParserPipe();

  constructor(
    private mxGraphService: MxGraphService,
    private dialogRef: MatDialogRef<ConnectWithDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public connectWithCell,
  ) {
    this.connectWithModel = MxGraphHelper.getModelElement(connectWithCell);
    this.elements = this.mxGraphService.getAllCells().map(e => {
      return {model: MxGraphHelper.getModelElement(e), cell: e};
    });
  }

  getClass(element: NamedElement) {
    return this.elementParser.transform(element).type;
  }

  getFirstLetter(element: NamedElement) {
    return this.elementParser.transform(element).symbol;
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
