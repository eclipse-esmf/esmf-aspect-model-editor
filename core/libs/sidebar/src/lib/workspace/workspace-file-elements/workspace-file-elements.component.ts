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

import {ModelApiService} from '@ame/api';
import {LoadedFilesService, NamespaceFile} from '@ame/cache';
import {ModelLoaderService} from '@ame/editor';
import {MaxGraphService} from '@ame/max-graph';
import {ElementIconComponent, ElementType, sammElements} from '@ame/shared';
import {Component, DestroyRef, effect, inject, signal, untracked} from '@angular/core';
import {MatMiniFabButton} from '@angular/material/button';
import {MatCheckbox} from '@angular/material/checkbox';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatInput} from '@angular/material/input';
import {MatMenu, MatMenuTrigger} from '@angular/material/menu';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatTooltip} from '@angular/material/tooltip';
import {
  DefaultAspect,
  DefaultCharacteristic,
  DefaultConstraint,
  DefaultEntity,
  DefaultEntityInstance,
  DefaultEvent,
  DefaultOperation,
  DefaultProperty,
  DefaultTrait,
  DefaultUnit,
  DefaultValue,
  NamedElement,
} from '@esmf/aspect-model-loader';
import {TranslocoDirective} from '@jsverse/transloco';
import {first, switchMap} from 'rxjs';
import {DraggableElementComponent} from '../../draggable-element/draggable-element.component';
import {SidebarStateService} from '../../sidebar-state.service';

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
    MatFormFieldModule,
    TranslocoDirective,
    MatProgressSpinnerModule,
  ],
})
export class WorkspaceFileElementsComponent {
  private maxgraphService = inject(MaxGraphService);
  private modelApiService = inject(ModelApiService);
  private modelLoaderService = inject(ModelLoaderService);
  private loadedFilesService = inject(LoadedFilesService);
  private destroyRef = inject(DestroyRef);

  public sidebarService = inject(SidebarStateService);

  public readonly elements = signal<Record<string, any>>({});
  public readonly searched = signal<Record<string, any[]>>({});
  public readonly loadingElements = signal(false);

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
    'value',
  ];

  private searchThrottle: NodeJS.Timeout | null = null;
  private currentSearchString = '';

  constructor() {
    this.destroyRef.onDestroy(() => {
      if (this.searchThrottle) {
        clearTimeout(this.searchThrottle);
      }
    });

    effect(() => {
      const selection = this.sidebarService.selection.selection();
      untracked(() => {
        if (selection) {
          const newElements: Record<string, any> = {};
          const newSearched: Record<string, any[]> = {};

          for (const element of this.elementsOrder) {
            newElements[element] = {
              ...sammElements[element],
              elements: [],
              hidden: true,
              displayed: true,
            };
            newSearched[element] = [];
          }

          this.elements.set(newElements);
          this.searched.set(newSearched);

          const namespaceFile = this.loadedFilesService.getFile(`${selection.namespace}:${selection.file}`);

          if (namespaceFile?.cachedFile?.getAllElements?.()?.length) {
            this.updateElements(namespaceFile);
          } else {
            this.requestFile(`${selection.namespace}:${selection.file}`, selection.aspectModelUrn);
          }
        }
      });
    });
  }

  public elementImported(element: NamedElement): boolean {
    if (element?.aspectModelUrn) {
      return !!this.maxgraphService.resolveCellByModelElement(element);
    }
    return false;
  }

  public toggleFilter(checkedOrEvent: any, key: string) {
    const isChecked =
      typeof checkedOrEvent === 'boolean'
        ? checkedOrEvent
        : typeof checkedOrEvent?.checked === 'boolean'
          ? checkedOrEvent.checked
          : !this.elements()[key]?.displayed;
    const currentElements = this.elements();
    if (currentElements[key]) {
      this.elements.set({
        ...currentElements,
        [key]: {
          ...currentElements[key],
          displayed: isChecked,
        },
      });
    }
  }

  public toggleSectionExpand(key: string) {
    const currentElements = this.elements();
    if (currentElements[key]) {
      this.elements.set({
        ...currentElements,
        [key]: {
          ...currentElements[key],
          hidden: !currentElements[key].hidden,
        },
      });
    }
  }

  public getElementParentNames(element: NamedElement): string[] {
    if (!element?.parents || element.parents.length === 0) {
      return [];
    }

    const parentNames = new Set<string>();
    const visited = new Set<any>();

    const traverse = (el: NamedElement) => {
      const key = el.aspectModelUrn || el;
      if (visited.has(key)) {
        return;
      }
      visited.add(key);

      for (const parent of el.parents || []) {
        if (!parent) {
          continue;
        }
        if (parent.isAnonymous?.()) {
          const beforeSize = parentNames.size;
          traverse(parent);
          if (parentNames.size === beforeSize && parent.name) {
            parentNames.add(parent.name);
          }
        } else if (parent.name) {
          parentNames.add(parent.name);
        }
      }
    };

    traverse(element);
    return Array.from(parentNames);
  }

  public getElementDescription(element: NamedElement): string {
    const parentNames = this.getElementParentNames(element);
    const parentInfo = parentNames.length ? `In: ${parentNames.join(', ')}` : '';
    const description = element.getDescription?.('en') || element.descriptions?.get('en') || '';

    if (element.isAnonymous?.()) {
      if (parentInfo && description) {
        return `${parentInfo} • ${description}`;
      }
      if (parentInfo) {
        return parentInfo;
      }
      return description;
    }

    return description;
  }

  public search(event: KeyboardEvent) {
    const target = event.target as HTMLInputElement;
    if (this.searchThrottle) {
      clearTimeout(this.searchThrottle);
    }

    this.searchThrottle = setTimeout(() => {
      this.currentSearchString = target.value.toLowerCase();
      this.applySearchFilter();
    }, 100);
  }

  private applySearchFilter() {
    const searchString = this.currentSearchString;
    const currentElements = this.elements();
    const newSearched: Record<string, any[]> = {};

    for (const key of this.elementsOrder) {
      const elementsList = currentElements[key]?.elements || [];
      newSearched[key] = searchString
        ? elementsList.filter((element: NamedElement) => {
            const elementDesc = this.getElementDescription(element);
            return (
              element.name?.toLowerCase().includes(searchString) ||
              elementDesc?.toLowerCase().includes(searchString) ||
              element.getDescription?.('en')?.toLowerCase()?.includes(searchString)
            );
          })
        : [...elementsList];
    }

    this.searched.set(newSearched);
  }

  private resolveElementType(element: NamedElement): ElementType | null {
    if (element instanceof DefaultProperty) {
      return (element as any).isAbstract ? 'abstract-property' : 'property';
    }
    if (element instanceof DefaultEntity) {
      return (element as any).isAbstract ? 'abstract-entity' : 'entity';
    }
    if (element instanceof DefaultCharacteristic) {
      return 'characteristic';
    }
    if (element instanceof DefaultAspect) {
      return 'aspect';
    }
    if (element instanceof DefaultConstraint) {
      return 'constraint';
    }
    if (element instanceof DefaultTrait) {
      return 'trait';
    }
    if (element instanceof DefaultOperation) {
      return 'operation';
    }
    if (element instanceof DefaultEvent) {
      return 'event';
    }
    if (element instanceof DefaultUnit) {
      return 'unit';
    }
    if (element instanceof DefaultValue) {
      return 'value';
    }
    if (element instanceof DefaultEntityInstance) {
      return 'entityInstance';
    }
    return null;
  }

  private updateElements(file: NamespaceFile) {
    if (!file?.cachedFile) {
      return;
    }
    const cachedFile = file.cachedFile;
    const currentElements = this.elements();
    const newElements: Record<string, any> = {};

    for (const key of this.elementsOrder) {
      newElements[key] = {
        ...sammElements[key],
        elements: [],
        hidden: currentElements[key]?.hidden ?? true,
        displayed: currentElements[key]?.displayed ?? true,
      };
    }

    for (const element of cachedFile.getAllElements()) {
      const type = this.resolveElementType(element);
      if (type && newElements[type]) {
        newElements[type].elements.push(element);
      }
    }

    this.elements.set(newElements);
    this.applySearchFilter();
  }

  private requestFile(absoluteName: string, aspectModelUrn: string) {
    this.loadingElements.set(true);
    this.modelApiService
      .fetchAspectMetaModel(aspectModelUrn)
      .pipe(
        switchMap(model =>
          this.modelLoaderService.loadSingleModel({
            aspectModelUri: model.sourceLocation,
            rdfAspectModel: model.content,
            fromWorkspace: true,
            namespaceFileName: absoluteName,
            aspectModelUrn,
          }),
        ),
        first(),
      )
      .subscribe({
        next: file => {
          this.updateElements(file);
          this.loadingElements.set(false);
        },
        error: () => {
          this.loadingElements.set(false);
        },
      });
  }

  protected readonly sammElements = sammElements;
}
