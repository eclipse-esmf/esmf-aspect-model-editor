import {Component, inject} from '@angular/core';

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

import {CommonModule} from '@angular/common';
import {FormControl, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatInputModule} from '@angular/material/input';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MxGraphHelper, MxGraphService} from '@ame/mx-graph';
import {BaseMetaModelElement} from '@ame/meta-model';
import {startWith, throttleTime} from 'rxjs';
import {ElectronSignals, ElectronSignalsService, SearchService, mxCellSearchOption, sammElements} from '@ame/shared';
import {ElementIconComponent} from '../../../../../shared/src/lib/components/element/element.component';
import {ConfirmDialogService, ModelElementParserPipe, ShapeSettingsService} from '@ame/editor';
import {SearchesStateService} from '../../search-state.service';
import {mxgraph} from 'mxgraph-factory';
import {LanguageTranslateModule, LanguageTranslationService} from '@ame/translation';
import {ConfirmDialogEnum} from '../../../../../editor/src/lib/models/confirm-dialog.enum';

@Component({
  standalone: true,
  selector: 'ame-elements-search',
  templateUrl: './elements-search.component.html',
  styleUrls: ['./elements-search.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatInputModule,
    MatAutocompleteModule,
    MatFormFieldModule,
    MatIconModule,
    LanguageTranslateModule,
    ElementIconComponent,
    ModelElementParserPipe,
  ],
})
export class ElementsSearchComponent {
  private electronSignalsService: ElectronSignals = inject(ElectronSignalsService);
  public searchControl = new FormControl('');
  public elements: BaseMetaModelElement[] = [];

  constructor(
    private mxGraphService: MxGraphService,
    private shapeSettingsService: ShapeSettingsService,
    private searchesStateService: SearchesStateService,
    private confirmDialogService: ConfirmDialogService,
    private searchService: SearchService,
    private translate: LanguageTranslationService,
  ) {
    this.searchControl.valueChanges.pipe(startWith(''), throttleTime(150)).subscribe(value => {
      this.elements = this.searchService
        .search<mxgraph.mxCell>(value, this.mxGraphService.getAllCells(), mxCellSearchOption)
        ?.map(cell => MxGraphHelper.getModelElement(cell));
    });
  }

  openElement(element: BaseMetaModelElement) {
    if (element.isExternalReference() && !element.isPredefined()) {
      this.confirmDialogService
        .open({
          phrases: [this.translate.translateService.instant('CONFIRM_DIALOG.NEW_WINDOW_ELEMENT.PHRASE1', {elementName: element.name})],
          title: this.translate.language.CONFIRM_DIALOG.NEW_WINDOW_ELEMENT.TITLE,
          closeButtonText: this.translate.language.CONFIRM_DIALOG.NEW_WINDOW_ELEMENT.CANCEL_BUTTON,
          okButtonText: this.translate.language.CONFIRM_DIALOG.NEW_WINDOW_ELEMENT.OK_BUTTON,
        })
        .subscribe(confirm => {
          confirm !== ConfirmDialogEnum.cancel
            ? this.electronSignalsService.call('openWindow', {
                file: element.fileName,
                namespace: element.aspectModelUrn.replace('urn:samm:', '').split('#')[0],
                editElement: element.aspectModelUrn,
                fromWorkspace: true,
              })
            : null;
        });
    } else {
      this.shapeSettingsService.editModel(element);
      requestAnimationFrame(() => {
        this.mxGraphService.navigateToCellByUrn(element.aspectModelUrn);
      });
    }

    this.searchControl.patchValue('');
    this.closeSearch();
  }

  closeSearch() {
    this.searchesStateService.elementsSearch.close();
  }

  protected readonly sammElements = sammElements;
}
