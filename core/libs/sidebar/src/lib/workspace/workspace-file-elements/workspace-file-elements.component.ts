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

import {ChangeDetectorRef, Component, OnInit, inject} from '@angular/core';
import {SidebarStateService} from '../../sidebar-state.service';
import {ElementType, sammElements} from '@ame/shared';
import {EditorService} from '@ame/editor';
import {filter} from 'rxjs';
import {BaseMetaModelElement} from '@ame/meta-model';
import {MxGraphService} from '@ame/mx-graph';

@Component({
  selector: 'ame-workspace-file-elements',
  templateUrl: './workspace-file-elements.component.html',
  styleUrls: ['./workspace-file-elements.component.scss'],
})
export class WorkspaceFileElementsComponent implements OnInit {
  public sidebarService = inject(SidebarStateService);
  public elements: Record<string, any> = {};
  public searched: Record<string, any[]> = {};

  public elementsOrder: ElementType[] = [
    'property',
    'abstract-property',
    'characteristic',
    'entity',
    'abstract-entity',
    'unit',
    'constraint',
    'trait',
    'operation',
    'event',
  ];
  public get selection$() {
    return this.sidebarService.selection.selection$;
  }

  private searchThrottle: NodeJS.Timeout;

  constructor(
    private editorService: EditorService,
    private mxGraphService: MxGraphService,
    private changeDetector: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.selection$.pipe(filter(Boolean)).subscribe(({namespace, file}) => {
      this.elements = {};
      this.searched = {};

      for (const element of this.elementsOrder) {
        this.elements[element] = {
          ...sammElements[element],
          elements: [],
          hidden: true,
          displayed: true,
        };
        this.searched[element] = this.elements[element].elements;
      }

      const cachedFile = this.editorService.loadExternalAspectModel(`${namespace}:${file}`);
      const sections = Object.values(this.elements);
      for (const element of cachedFile.getAllElements()) {
        sections.find(e => element instanceof e.class)?.elements?.push?.(element);
      }
    });
  }

  public elementImported(element: BaseMetaModelElement): boolean {
    if (element?.aspectModelUrn) {
      return !!this.mxGraphService.resolveCellByModelElement(element);
    }
    return false;
  }

  public toggleFilter(event: MouseEvent, key: string) {
    event.stopPropagation();
    this.elements[key].displayed = !this.elements[key].displayed;
  }

  public search(event: KeyboardEvent) {
    const target = event.target as HTMLInputElement;
    if (this.searchThrottle) {
      clearInterval(this.searchThrottle);
    }

    this.searchThrottle = setTimeout(() => {
      const searchString = target.value.toLowerCase();
      for (const key in this.elements) {
        this.searched[key] = searchString
          ? this.elements[key].elements.filter((element: BaseMetaModelElement) => {
              // @TODO: Search for the language the application is set on
              return (
                element.name.toLowerCase().includes(searchString) || element.getDescription('en')?.toLowerCase()?.includes(searchString)
              );
            })
          : this.elements[key].elements;
      }
      this.changeDetector.detectChanges();
    }, 100);
  }

  protected readonly sammElements = sammElements;
}
