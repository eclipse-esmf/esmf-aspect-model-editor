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

import {LoadedFilesService} from '@ame/cache';
import {ConfirmDialogEnum, ConfirmDialogService, RenameModelDialogService} from '@ame/editor';
import {MaxGraphHelper, MaxGraphService, ModelStyleResolver, ThemeService} from '@ame/max-graph';
import {ModelService} from '@ame/rdf/services';
import {SammLanguageSettingsService} from '@ame/settings-dialog';
import {NotificationsService, TitleService} from '@ame/shared';
import {LanguageTranslationService} from '@ame/translation';
import {useUpdater} from '@ame/utils';
import {inject, Injectable, Injector} from '@angular/core';
import {DefaultAspect, DefaultEnumeration, NamedElement} from '@esmf/aspect-model-loader';
import {Cell} from '@maxgraph/core';
import {ModelElementNamingService} from '../services/model-element-naming.service';
import {CharacteristicModelService} from './characteristic-model.service';
import {ModelRootService} from './model-root.service';

@Injectable({providedIn: 'root'})
export class ElementModelService {
  private readonly injector = inject(Injector);
  private readonly titleService = inject(TitleService);
  private readonly maxgraphService = inject(MaxGraphService);
  private readonly modelRootService = inject(ModelRootService);
  private readonly modelService = inject(ModelService);
  private readonly renameModelService = inject(RenameModelDialogService);
  private readonly confirmDialogService = inject(ConfirmDialogService, {optional: true});
  private readonly modelElementNamingService = inject(ModelElementNamingService);
  private readonly sammLangService = inject(SammLanguageSettingsService, {optional: true});
  private readonly themeService = inject(ThemeService, {optional: true});
  private readonly notificationService = inject(NotificationsService);
  private readonly translate = inject(LanguageTranslationService);
  private readonly loadedFilesService = inject(LoadedFilesService);

  get currentCachedFile() {
    return this.loadedFilesService.currentLoadedFile.cachedFile;
  }

  updateElement(cell: Cell, form: {[key: string]: any}): void {
    if (!cell || cell.isEdge()) {
      return;
    }
    const characteristicModelService = this.injector.get(CharacteristicModelService);
    const modelElement = MaxGraphHelper.getModelElement(cell);

    const modelService =
      modelElement instanceof DefaultEnumeration ? characteristicModelService : this.modelRootService.getElementModelService(modelElement);
    modelService.update(cell, form);
  }

  deleteElement(cell: Cell): void {
    if (!cell) {
      return;
    }

    if (cell?.isEdge()) {
      this.notificationService.warning({
        title: this.translate.language.notificationService.cannotDeleteEdgeTitle,
        message: this.translate.language.notificationService.cannotDeleteEdgeMessage,
        timeout: 5000,
      });
      return;
    }

    if (this.maxgraphService.getAllCells().length === 1) {
      this.notificationService.warning({
        title: this.translate.language.notificationService.modelEmptyMessage,
        message: this.translate.language.notificationService.modelMinimumElementRequirement,
        timeout: 5000,
      });
      return;
    }

    if (this.handleAspectRemoval(cell)) {
      return;
    }

    const elementModel = MaxGraphHelper.getModelElement(cell);
    if (elementModel.isPredefined) {
      const service = this.modelRootService.getPredefinedService(elementModel);
      if (service?.delete && service?.delete?.(cell)) {
        return;
      }
    }

    const anonymousChildren = this.collectAnonymousChildren(elementModel);
    if (anonymousChildren.length > 0 && this.confirmDialogService) {
      const dialogTexts = this.translate.language?.confirmDialog?.deleteAnonymousElement;
      const title = dialogTexts?.title || 'Delete Element with Anonymous Children';
      const phrase1 =
        this.translate.translateService?.translate?.('confirmDialog.deleteAnonymousElement.phrase1', {
          elementName: elementModel.name,
          count: anonymousChildren.length,
        }) ||
        `The element "${elementModel.name}" contains ${anonymousChildren.length} anonymous (inline) element(s). Deleting this element will also delete these anonymous elements.`;
      const phrase2 = dialogTexts?.phrase2 || 'Do you want to delete them, convert them to named elements first, or cancel?';
      const okButtonText = dialogTexts?.deleteWithAnonymousBtn || 'Delete All';
      const actionButtonText = dialogTexts?.convertToNamedBtn || 'Convert to Named Elements';
      const closeButtonText = dialogTexts?.cancelBtn || 'Cancel';

      this.confirmDialogService
        .open({
          title,
          phrases: [phrase1, phrase2],
          okButtonText,
          actionButtonText,
          closeButtonText,
        })
        .subscribe(result => {
          if (result === ConfirmDialogEnum.ok) {
            for (const anon of anonymousChildren) {
              const anonCell = this.maxgraphService.resolveCellByModelElement(anon);
              if (anonCell) {
                this.removeElementData(anonCell);
              } else {
                this.currentCachedFile.removeElement(anon.aspectModelUrn);
              }
            }
            this.removeElementData(cell);
          } else if (result === ConfirmDialogEnum.action) {
            for (const anon of anonymousChildren) {
              this.convertAnonymousToNamed(anon);
            }
            this.removeElementData(cell);
          }
        });
      return;
    }

    this.removeElementData(cell);
  }

  private collectAnonymousChildren(element: NamedElement): NamedElement[] {
    if (!element) {
      return [];
    }

    const deletedSet = new Set<NamedElement>([element]);
    const deletedUrns = new Set<string>(element.aspectModelUrn ? [element.aspectModelUrn] : []);
    const orphanedAnonymous: NamedElement[] = [];

    let addedNew = true;
    while (addedNew) {
      addedNew = false;
      for (const el of Array.from(deletedSet)) {
        for (const child of el.children || []) {
          if (child instanceof NamedElement && child.isAnonymous?.() && !deletedSet.has(child)) {
            const parents = Array.from(child.parents || []);
            const remainingParents = parents.filter(
              p => p instanceof NamedElement && !deletedSet.has(p) && (!p.aspectModelUrn || !deletedUrns.has(p.aspectModelUrn)),
            );
            if (remainingParents.length === 0) {
              deletedSet.add(child);
              if (child.aspectModelUrn) {
                deletedUrns.add(child.aspectModelUrn);
              }
              orphanedAnonymous.push(child);
              addedNew = true;
            }
          }
        }
      }
    }

    return orphanedAnonymous;
  }

  private convertAnonymousToNamed(element: NamedElement): void {
    const rawName = element.className ? element.className.replace('Default', '') : 'Characteristic';
    element.name = rawName;
    element.anonymous = false;
    element.syntheticName = false;

    const oldUrn = element.aspectModelUrn;
    this.modelElementNamingService.resolveElementNaming(element);
    const newUrn = element.aspectModelUrn;
    this.currentCachedFile.updateElementKey(oldUrn, newUrn);

    const cell = this.maxgraphService.resolveCellByModelElement(element);
    if (cell) {
      cell.setId(element.name);
      cell.setAttribute('name', element.name);
      if (this.themeService) {
        const style = this.themeService.generateThemeStyle(ModelStyleResolver.resolve(element));
        this.maxgraphService.graph.setCellStyle(style, [cell]);
      }
      if (this.sammLangService) {
        MaxGraphHelper.updateLabel(cell, this.maxgraphService.graph, this.sammLangService);
      }
      this.maxgraphService.formatCell(cell);
    }
  }

  private handleAspectRemoval(cell: Cell): boolean {
    const modelElement = MaxGraphHelper.getModelElement(cell);
    if (!(modelElement instanceof DefaultAspect)) {
      return false;
    }
    this.renameModelService.open().subscribe(data => {
      const fileName = data?.fileName || (data as any)?.name;
      if (!fileName) {
        return;
      }

      const loadedFile = this.loadedFilesService.currentLoadedFile;
      const oldAbsoluteName = loadedFile.absoluteName;
      this.modelService.removeAspect();
      this.removeElementData(cell);

      this.loadedFilesService.updateAbsoluteName(oldAbsoluteName, `${loadedFile.namespace}:${fileName}`);
      this.titleService.updateTitle(loadedFile.absoluteName);
    });

    return true;
  }

  private removeElementData(cell: Cell): void {
    const modelElement = MaxGraphHelper.getModelElement(cell);
    if (!modelElement) {
      this.maxgraphService.removeCells([cell]);
      this.maxgraphService.formatShapes(true);
      return;
    }

    const elementModelService = this.modelRootService.getElementModelService(modelElement);
    const parentCells = (this.maxgraphService.resolveParents(cell) || []).filter(p => p && !p.isEdge());

    for (const parent of modelElement.parents || []) {
      if (parent instanceof NamedElement && !(parent instanceof DefaultEnumeration)) {
        useUpdater(parent).delete(modelElement);
      }
    }

    for (const parent of modelElement.parents) {
      if (!(parent instanceof NamedElement)) continue;
      MaxGraphHelper.removeRelation(parent, modelElement);
    }

    for (const child of modelElement.children) {
      if (!(child instanceof NamedElement)) continue;
      MaxGraphHelper.removeRelation(modelElement, child);
    }

    elementModelService?.delete(cell);
    this.currentCachedFile.removeElement(modelElement.aspectModelUrn);

    for (const parentCell of parentCells) {
      const parentModel = MaxGraphHelper.getModelElement(parentCell);
      if (parentModel) {
        if (this.sammLangService) {
          MaxGraphHelper.updateLabel(parentCell, this.maxgraphService.graph, this.sammLangService);
        }
        this.maxgraphService.formatCell(parentCell);
      }
    }

    this.maxgraphService.formatShapes(true);
  }
}
