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

import {ModelApiService} from '@ame/api';
import {LoadedFilesService, NamespaceFile} from '@ame/cache';
import {ModelLoaderService} from '@ame/editor';
import {MxGraphService} from '@ame/mx-graph';
import {ElementIconComponent, ElementType, sammElements} from '@ame/shared';
import {SidebarStateService} from '@ame/sidebar';
import {ChangeDetectorRef, Component, OnInit, inject} from '@angular/core';
import {MatMiniFabButton} from '@angular/material/button';
import {MatCheckbox} from '@angular/material/checkbox';
import {MatIconModule} from '@angular/material/icon';
import {MatFormField, MatInput} from '@angular/material/input';
import {MatMenu, MatMenuTrigger} from '@angular/material/menu';
import {MatTooltip} from '@angular/material/tooltip';
import {NamedElement} from '@esmf/aspect-model-loader';
import {TranslatePipe} from '@ngx-translate/core';
import {first, switchMap} from 'rxjs';
import {DraggableElementComponent} from '../../draggable-element/draggable-element.component';

@Component({
  selector: 'ame-workspace-file-elements',
  templateUrl: './workspace-file-elements.component.html',
  styleUrls: ['./workspace-file-elements.component.scss'],
  imports: [
    MatMiniFabButton,
    MatMenuTrigger,
    MatInput,
    DraggableElementComponent,
    ElementIconComponent,
    MatCheckbox,
    MatMenu,
    MatTooltip,
    MatIconModule,
    MatFormField,
    TranslatePipe,
  ],
})
export class WorkspaceFileElementsComponent implements OnInit {
  private mxGraphService = inject(MxGraphService);
  private changeDetector = inject(ChangeDetectorRef);
  private modelApiService = inject(ModelApiService);
  private modelLoaderService = inject(ModelLoaderService);
  private loadedFilesService = inject(LoadedFilesService);

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
  public get selection() {
    return this.sidebarService.selection.selection();
  }

  private searchThrottle: NodeJS.Timeout;

  ngOnInit(): void {
    if (this.selection) {
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

      if (this.loadedFilesService.getFile(`${this.selection.namespace}:${this.selection.file}`)) {
        this.updateElements(this.loadedFilesService.getFile(`${this.selection.namespace}:${this.selection.file}`));
      } else this.requestFile(`${this.selection.namespace}:${this.selection.file}`, this.selection.aspectModelUrn);
    }
  }

  public elementImported(element: NamedElement): boolean {
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
          ? this.elements[key].elements.filter((element: NamedElement) => {
              // @TODO Search for the language the application is set on
              return (
                element.name.toLowerCase().includes(searchString) || element.getDescription('en')?.toLowerCase()?.includes(searchString)
              );
            })
          : this.elements[key].elements;
      }
      this.changeDetector.detectChanges();
    }, 100);
  }

  private updateElements(file: NamespaceFile) {
    const cachedFile = file.cachedFile;
    const sections = Object.values(this.elements);
    for (const element of cachedFile.getAllElements()) {
      sections.find(e => element instanceof e.class && !element.isAnonymous())?.elements?.push?.(element);
    }
    this.changeDetector.detectChanges();
  }

  private requestFile(absoluteName: string, aspectModelUrn: string) {
    this.modelApiService
      .fetchAspectMetaModel(aspectModelUrn)
      .pipe(
        switchMap(content =>
          this.modelLoaderService.loadSingleModel({
            rdfAspectModel: content,
            fromWorkspace: true,
            namespaceFileName: absoluteName,
            aspectModelUrn,
          }),
        ),
        first(),
      )
      .subscribe({next: file => this.updateElements(file), error: e => console.log(e)});
  }

  protected readonly sammElements = sammElements;
}
