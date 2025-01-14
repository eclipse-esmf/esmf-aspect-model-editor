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

import {MxGraphService} from '@ame/mx-graph';
import {Component, OnDestroy} from '@angular/core';
import {NamedElement} from '@esmf/aspect-model-loader';
import {Subscription} from 'rxjs';
import {EditorModelService} from '../../../../editor-model.service';

@Component({
  selector: 'ame-locate-element',
  template: `@if (element) {
    <button
      [matTooltip]="'EDITOR_CANVAS.SHAPE_SETTING.LOCATE_ELEMENT' | translate"
      (click)="locate()"
      mat-icon-button
      matTooltipPosition="above"
    >
      <mat-icon>gps_fixed</mat-icon>
    </button>
  }`,
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
})
export class LocateElementComponent implements OnDestroy {
  public element: NamedElement;
  private subscription = new Subscription();

  constructor(
    public metaModelDialogService: EditorModelService,
    private mxgraphService: MxGraphService,
  ) {
    this.subscription = this.metaModelDialogService.getMetaModelElement().subscribe(element => (this.element = element));
  }

  locate() {
    if (this.element) this.mxgraphService.navigateToCellByUrn(this.element.aspectModelUrn);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
