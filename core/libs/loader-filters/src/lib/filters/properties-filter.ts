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
import {ShapeSettingsStateService} from '@ame/editor';
import {MaxGraphHelper} from '@ame/max-graph';
import {basicShapeGeometry, ShapeGeometry, smallCircleShapeGeometry} from '@ame/shared';
import {Injector} from '@angular/core';
import {
  DefaultAspect,
  DefaultEither,
  DefaultEntity,
  DefaultEntityInstance,
  DefaultEvent,
  DefaultOperation,
  DefaultProperty,
  DefaultUnit,
  NamedElement,
} from '@esmf/aspect-model-loader';
import {ArrowStyle, ChildrenArray, FilterLoader, ModelFilter, ModelTree, ModelTreeOptions} from '../models';

const allowedElements = [DefaultAspect, DefaultProperty, DefaultEntity, DefaultEither];

export class PropertiesFilterLoader implements FilterLoader {
  cache: Record<string, boolean> = {};
  readonly filterType: ModelFilter = ModelFilter.PROPERTIES;
  readonly visibleElements = [DefaultAspect, DefaultProperty];

  private readonly loadedFiles: LoadedFilesService;

  constructor(private readonly injector: Injector) {
    this.loadedFiles = this.injector.get(LoadedFilesService);
  }

  filter(rootElements: NamedElement[]): ModelTree<NamedElement>[] {
    const shapeSettingsStateService = this.injector.get(ShapeSettingsStateService, null, {optional: true});
    if (shapeSettingsStateService?.isShapeSettingOpened()) {
      shapeSettingsStateService.closeShapeSettings();
    }

    return (rootElements || [])
      .map(element => {
        this.cache = {};
        return this.generateTree(element);
      })
      .filter((tree): tree is ModelTree<NamedElement> => Boolean(tree));
  }

  generateTree(element: NamedElement, options?: ModelTreeOptions): ModelTree<NamedElement> {
    if (!element || element instanceof DefaultEntityInstance) {
      return null;
    }

    const elementTree: ModelTree<NamedElement> = {
      element,
      fromParentArrow: options?.parent ? this.getArrowStyle(element, options.parent) : null,
      shape: {...this.getShapeGeometry(element), maxgraphStyle: {baseStyleNames: [this.getMaxgraphStyle(element)]}},
      children: new ChildrenArray(),
      filterType: this.filterType,
    };

    if (options?.parentNode) {
      options.parentNode.children.push(elementTree);
    }

    for (const child of element.children || []) {
      if (this.loadedFiles.isElementExtern(child) && this.loadedFiles.isElementExtern(element)) {
        continue;
      }

      const path = `${element.aspectModelUrn} - ${child.aspectModelUrn}`;
      if (this.cache[path]) continue;
      this.cache[path] = true;

      if (child instanceof DefaultEntityInstance || child instanceof DefaultOperation || child instanceof DefaultEvent) {
        continue;
      }

      if (element instanceof DefaultEither) {
        const tree = this.generateTree(child, {notAllowed: [DefaultEntity], parent: child, parentNode: elementTree});

        if (tree && this.isValid(tree)) {
          elementTree.children.push(tree);
        }

        continue;
      }

      if (!this.isAllowed(child, options) && !(element instanceof DefaultEither)) {
        const descendants = this.getAllowedDescendants(child)
          .map(descendant => this.generateTree(descendant, {parent: element, parentNode: elementTree}))
          .filter(tree => this.isValid(tree));

        elementTree.children.push(...descendants);
        continue;
      }

      if (child instanceof DefaultEither) {
        const [leftTree, rightTree] = this.generateEitherTree(child, elementTree);
        if (leftTree?.children?.length) {
          elementTree.children?.push(leftTree);
        }

        if (rightTree?.children?.length) {
          elementTree.children?.push(rightTree);
        }
        continue;
      }

      const subtree = this.generateTree(child, {
        parent: element,
        notAllowed: element instanceof DefaultEither ? [DefaultEntity] : [],
        parentNode: elementTree,
      });

      if (subtree) {
        elementTree.children.push(subtree);
      }
    }

    return this.isValid(elementTree) ? elementTree : null;
  }

  getArrowStyle(element: NamedElement, parent: NamedElement): ArrowStyle {
    if (
      element instanceof DefaultProperty &&
      (parent instanceof DefaultEntity || parent instanceof DefaultAspect) &&
      MaxGraphHelper.isOptionalProperty(element as DefaultProperty, parent)
    ) {
      return 'optionalPropertyEdge';
    }

    const types = [DefaultProperty, DefaultEntity, DefaultAspect];
    if (types.some(type => element instanceof type) && types.some(type => parent instanceof type)) {
      return 'defaultEdge';
    }

    return 'optionalPropertyEdge';
  }

  getShapeGeometry(element: NamedElement): ShapeGeometry {
    if (element instanceof DefaultAspect) {
      return basicShapeGeometry;
    }

    return element instanceof DefaultProperty ? basicShapeGeometry : smallCircleShapeGeometry;
  }

  getMaxgraphStyle(element: NamedElement): string {
    return element instanceof DefaultAspect
      ? 'aspect'
      : element instanceof DefaultProperty
        ? 'property'
        : element instanceof DefaultEntity
          ? 'filteredProperties_entity'
          : 'filteredProperties_either';
  }

  hasOverlay(element?: NamedElement): boolean {
    return element instanceof DefaultEntity || element instanceof DefaultAspect;
  }

  private generateEitherTree(
    element: DefaultEither,
    parentNode: ModelTree<NamedElement>,
  ): [ModelTree<NamedElement>, ModelTree<NamedElement>] {
    return [
      this.generateTree(element.left, {notAllowed: [DefaultEntity], parent: element, parentNode}),
      this.generateTree(element.right, {notAllowed: [DefaultEntity], parent: element, parentNode}),
    ];
  }

  private getAllowedDescendants(element: NamedElement): NamedElement[] {
    const eligibleElements = [];
    for (const child of element.children) {
      if (child instanceof DefaultUnit) {
        continue;
      }
      if (this.isAllowed(child, {parent: element})) {
        eligibleElements.push(child);
        continue;
      }

      eligibleElements.push(...this.getAllowedDescendants(child));
    }

    return eligibleElements;
  }

  private isAllowed(element: NamedElement, options: ModelTreeOptions = {}): boolean {
    return allowedElements.some(
      allowedElement => element instanceof allowedElement && !(options.notAllowed || [])?.some(c => element instanceof c),
    );
  }

  private isValid(tree: ModelTree<NamedElement>): boolean {
    return tree && (tree.children.length > 0 || tree.element instanceof DefaultProperty || tree.element instanceof DefaultAspect);
  }
}
