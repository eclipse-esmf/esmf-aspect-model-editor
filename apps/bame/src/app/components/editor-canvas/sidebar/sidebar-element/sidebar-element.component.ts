/*
 *  Copyright (c) 2021 Robert Bosch Manufacturing Solutions GmbH, Germany. All rights reserved.
 */
import {AfterViewInit, Component, Input, Renderer2, ViewChild} from '@angular/core';
import {NamespacesCacheService} from '@bame/cache';
import {EditorService} from '@bame/editor';
import {BaseMetaModelElement} from '@bame/meta-model';
import {MxGraphService} from '@bame/mx-graph';
import {ElementModel} from '@bame/shared';
import {environment} from 'environments/environment';

@Component({
  selector: 'bci-sidebar-element',
  templateUrl: './sidebar-element.component.html',
  styleUrls: ['./sidebar-element.component.scss'],
})
export class SidebarElementComponent implements AfterViewInit {
  @Input()
  public element: ElementModel;

  @Input()
  compactView = false;

  @ViewChild('container')
  public container: any;

  public dataCy = '';

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
