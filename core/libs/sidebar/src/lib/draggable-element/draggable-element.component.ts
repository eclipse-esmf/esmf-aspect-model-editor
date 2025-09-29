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

import {EditorService} from '@ame/editor';
import {basicShapeGeometry, circleShapeGeometry, ElementType} from '@ame/shared';
import {AfterViewInit, Component, ElementRef, inject, Input, Renderer2} from '@angular/core';

@Component({
  selector: 'ame-draggable-element',
  templateUrl: './draggable-element.component.html',
  styleUrls: ['./draggable-element.component.scss'],
})
export class DraggableElementComponent implements AfterViewInit {
  @Input() type: ElementType;
  @Input() urn?: string = '';

  private elementRef = inject(ElementRef<HTMLDivElement>);
  private renderer = inject(Renderer2);

  public editorService = inject(EditorService);

  ngAfterViewInit(): void {
    this.elementRef.nativeElement.dataset.type = this.type;
    this.elementRef.nativeElement.dataset.urn = this.urn;

    this.editorService.makeDraggable(this.elementRef.nativeElement, this.createShadowElement());
  }

  private createShadowElement() {
    const dragElement = this.renderer.createElement('div');
    dragElement.classList.add(this.type);
    dragElement.style.display = 'block';
    dragElement.style.height = (this.type === 'trait' ? circleShapeGeometry.expandedHeight : basicShapeGeometry.expandedHeight) + 'px';
    dragElement.style.width = (this.type === 'trait' ? circleShapeGeometry.expandedWith : basicShapeGeometry.expandedWith) + 'px';
    dragElement.style.border = '2px solid #000';
    dragElement.style.marginTop = '-15px';

    if (this.type === 'trait') {
      dragElement.style.borderRadius = '50%';
    }

    return dragElement;
  }
}
