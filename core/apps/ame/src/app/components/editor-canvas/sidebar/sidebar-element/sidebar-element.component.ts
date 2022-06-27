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

import {AfterViewInit, Component, Input, Renderer2, ViewChild} from '@angular/core';
import {NamespacesCacheService} from '@ame/cache';
import {EditorService} from '@ame/editor';
import {BaseMetaModelElement} from '@ame/meta-model';
import {MxGraphService} from '@ame/mx-graph';
import {ElementModel} from '@ame/shared';
import {environment} from 'environments/environment';

export const elementShortcuts = {
  property: 'P',
  operation: 'O',
  characteristic: 'C',
  entity: 'E',
  constraint: 'C',
  trait: 'T',
  unit: 'U',
  event: 'E',
  abstractEntity: 'AE',
};

@Component({
  selector: 'ame-sidebar-element',
  templateUrl: './sidebar-element.component.html',
  styleUrls: ['./sidebar-element.component.scss'],
})
export class SidebarElementComponent implements AfterViewInit {
  @Input() public element: ElementModel;
  @ViewChild('container') public container: any;

  public dataCy = '';
  public elementShortcut = elementShortcuts;

  get getIconClass(): string {
    return this.element.type.toLowerCase();
  }

  constructor(
    private renderer: Renderer2,
    public editorService: EditorService,
    public mxGraphService: MxGraphService,
    public cacheService: NamespacesCacheService
  ) {}

  public ngAfterViewInit() {
    requestAnimationFrame(() => {
      // for drag and drop
      this.container.nativeElement.attributes['element-type'] = this.element.type.toLowerCase();
      this.container.nativeElement.attributes['urn'] = this.element.aspectModelUrn;
      if (!environment.production) {
        // for drag and drop cypress
        this.dataCy = `dragDrop${this.element.type.charAt(0).toUpperCase() + this.element.type.slice(1)}`;
      }
      this.editorService.makeDraggable(this.container.nativeElement, this.createDraggableShadowElement('shadowElementRectangle'));
    });
  }

  public elementImported(): boolean {
    if (this.element?.aspectModelUrn) {
      const modelElement: BaseMetaModelElement = this.cacheService.findElementOnExtReference(this.element.aspectModelUrn);
      if (modelElement) {
        return !!this.mxGraphService.resolveCellByModelElement(modelElement);
      }
    }
    return false;
  }

  private createDraggableShadowElement(styleClass: string) {
    // TODO: Check for possible memory leaks
    const dragShadowElement = this.renderer.createElement('div');
    dragShadowElement.className = styleClass;
    return dragShadowElement;
  }
}
