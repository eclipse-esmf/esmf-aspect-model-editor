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

import {
  ConfirmDialogEnum,
  ConfirmDialogPort,
  LoadedFilesService,
  ModelElementNamingService,
  ModelService,
  RenameModelDialogPort,
} from '@ame/domain';
import {ElementRelationUtil, LanguageTranslationService, NotificationsService, TitleService, useUpdater} from '@ame/shared';
import {inject, Injectable, Injector} from '@angular/core';
import {DefaultAspect, DefaultEnumeration, NamedElement} from '@esmf/aspect-model-loader';
import {GraphAdapterPort} from '../ports/graph-adapter.port';
import {CharacteristicModelService} from './characteristic-model.service';
import {ModelRootService} from './model-root.service';

@Injectable({providedIn: 'root'})
export class ElementModelService {
  private readonly injector = inject(Injector);
  private readonly titleService = inject(TitleService);

  private get graphAdapter(): GraphAdapterPort | null {
    return this.injector.get<GraphAdapterPort | null>(GraphAdapterPort, null, {optional: true});
  }
  private readonly modelRootService = inject(ModelRootService);
  private readonly modelService = inject(ModelService);
  private readonly renameModelService = inject(RenameModelDialogPort, {optional: true});
  private readonly confirmDialogService = inject(ConfirmDialogPort, {optional: true});
  private readonly modelElementNamingService = inject(ModelElementNamingService);
  private readonly notificationService = inject(NotificationsService);
  private readonly translate = inject(LanguageTranslationService);
  private readonly loadedFilesService = inject(LoadedFilesService);

  get currentCachedFile() {
    return this.loadedFilesService.currentLoadedFile.cachedFile;
  }

  updateElement(cell: any, form: {[key: string]: any}): void {
    if (!cell || cell.isEdge?.()) {
      return;
    }
    const characteristicModelService = this.injector.get(CharacteristicModelService);
    const modelElement = ElementRelationUtil.getModelElement(cell);

    const modelService =
      modelElement instanceof DefaultEnumeration ? characteristicModelService : this.modelRootService.getElementModelService(modelElement);
    modelService.update(cell, form);
    this.graphAdapter?.notifyGraphModelChanged();
  }

  deleteElement(cell: any): void {
    if (!cell) {
      return;
    }

    if (cell?.isEdge?.()) {
      this.notificationService.warning({
        title: this.translate.language.notificationService.cannotDeleteEdgeTitle,
        message: this.translate.language.notificationService.cannotDeleteEdgeMessage,
        timeout: 5000,
      });
      return;
    }

    if ((this.graphAdapter?.getAllCells()?.length ?? 0) === 1) {
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

    const elementModel = ElementRelationUtil.getModelElement(cell);
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
              const anonCell = this.graphAdapter?.resolveCellByModelElement(anon);
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

    const cell = this.graphAdapter?.resolveCellByModelElement(element);
    if (cell) {
      cell.setId?.(element.name);
      cell.setAttribute?.('name', element.name);
      this.graphAdapter?.updateCellThemeStyle(cell, element);
      this.graphAdapter?.updateCellLabel(cell);
      this.graphAdapter?.formatCell(cell);
    }
  }

  private handleAspectRemoval(cell: any): boolean {
    const modelElement = ElementRelationUtil.getModelElement(cell);
    if (!(modelElement instanceof DefaultAspect)) {
      return false;
    }
    this.renameModelService?.open().subscribe(data => {
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

  private removeElementData(cell: any): void {
    const modelElement = ElementRelationUtil.getModelElement(cell);
    if (!modelElement) {
      this.graphAdapter?.removeCells([cell]);
      this.graphAdapter?.formatShapes(true);
      return;
    }

    const elementModelService = this.modelRootService.getElementModelService(modelElement);
    const parentCells = (this.graphAdapter?.resolveParents(cell) || []).filter(p => p && !p.isEdge?.());

    for (const parent of modelElement.parents || []) {
      if (parent instanceof NamedElement && !(parent instanceof DefaultEnumeration)) {
        useUpdater(parent).delete(modelElement);
      }
    }

    for (const parent of modelElement.parents) {
      if (!(parent instanceof NamedElement)) continue;
      ElementRelationUtil.removeRelation(parent, modelElement);
    }

    for (const child of modelElement.children) {
      if (!(child instanceof NamedElement)) continue;
      ElementRelationUtil.removeRelation(modelElement, child);
    }

    elementModelService?.delete(cell);
    this.currentCachedFile.removeElement(modelElement.aspectModelUrn);

    for (const parentCell of parentCells) {
      const parentModel = ElementRelationUtil.getModelElement(parentCell);
      if (parentModel) {
        this.graphAdapter?.updateCellLabel(parentCell);
        this.graphAdapter?.formatCell(parentCell);
      }
    }

    this.graphAdapter?.formatShapes(true);
  }
}
