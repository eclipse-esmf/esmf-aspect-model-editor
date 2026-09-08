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

import {MaxGraphHelper, MaxGraphService} from '@ame/max-graph';
import {CommonModule} from '@angular/common';
import {Component, inject, signal} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MAT_DIALOG_DATA, MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatTooltipModule} from '@angular/material/tooltip';
import {NamedElement} from '@esmf/aspect-model-loader';
import {TranslocoDirective} from '@jsverse/transloco';
import {Cell} from '@maxgraph/core';
import {ModelElementParserPipe} from '../editor-dialog/components/element-list/element-list.pipe';

interface Element {
  cell: Cell;
  model: NamedElement;
}

@Component({
  selector: 'ame-connect-with-dialog',
  templateUrl: './connect-with-dialog.component.html',
  styleUrls: ['./connect-with-dialog.component.scss'],
  imports: [MatFormFieldModule, MatTooltipModule, CommonModule, MatButtonModule, MatDialogModule, MatInputModule, TranslocoDirective],
  providers: [ModelElementParserPipe],
})
export class ConnectWithDialogComponent {
  private maxgraphService = inject(MaxGraphService);
  private dialogRef = inject(MatDialogRef<ConnectWithDialogComponent>);
  private elementParser = inject(ModelElementParserPipe);

  public connectWithCell = inject(MAT_DIALOG_DATA);

  public elements = signal<Element[]>([]);
  public selectedElement = signal<Element>(undefined);
  public connectWithModel = signal<NamedElement>(undefined);

  constructor() {
    this.connectWithModel.set(MaxGraphHelper.getModelElement(this.connectWithCell));
    this.elements.set(
      this.maxgraphService.getAllCells().map(e => {
        return {model: MaxGraphHelper.getModelElement(e), cell: e};
      }),
    );
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
      element.model.aspectModelUrn !== this.connectWithModel()?.aspectModelUrn
    );
  }

  isSelected({model}: Element) {
    return this.selectedElement()?.model.aspectModelUrn === model?.aspectModelUrn;
  }

  close() {
    this.dialogRef.close();
  }

  connect() {
    const selectedElement = this.selectedElement();
    if (!selectedElement) {
      return;
    }

    this.dialogRef.close({...selectedElement});
  }
}
