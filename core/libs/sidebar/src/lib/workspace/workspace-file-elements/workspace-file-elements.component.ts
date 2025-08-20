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
import {ElementType, sammElements} from '@ame/shared';
import {SidebarStateService} from '@ame/sidebar';
import {ChangeDetectorRef, Component, OnInit, inject} from '@angular/core';
import {NamedElement} from '@esmf/aspect-model-loader';
import {filter, first, switchMap} from 'rxjs';

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
    private mxGraphService: MxGraphService,
    private changeDetector: ChangeDetectorRef,
    private modelApiService: ModelApiService,
    private modelLoaderService: ModelLoaderService,
    private loadedFilesService: LoadedFilesService,
  ) {}

  ngOnInit(): void {
    this.selection$.pipe(filter(Boolean)).subscribe(({namespace, file, aspectModelUrn}) => {
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

      if (this.loadedFilesService.getFile(`${namespace}:${file}`)) {
        this.updateElements(this.loadedFilesService.getFile(`${namespace}:${file}`));
      } else this.requestFile(`${namespace}:${file}`, aspectModelUrn);
    });
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
      .getAspectMetaModel(aspectModelUrn)
      .pipe(
        switchMap(content =>
          this.modelLoaderService.loadSingleModel({
            rdfAspectModel: content,
            fromWorkspace: true,
            namespaceFileName: absoluteName,
          }),
        ),
        first(),
      )
      .subscribe({next: file => this.updateElements(file), error: e => console.log(e)});
  }

  protected readonly sammElements = sammElements;
}
