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

import {LoadedFilesService} from '@ame/domain';
import {MaxGraphHelper, MaxGraphService} from '@ame/graph';
import {mxCellSearchOption, SearchService} from '@ame/shared';
import {DestroyRef, Directive, effect, inject, input, OnDestroy, untracked} from '@angular/core';
import {
  DefaultCharacteristic,
  DefaultConstraint,
  DefaultEntity,
  DefaultProperty,
  HasExtends,
  NamedElement,
} from '@esmf/aspect-model-loader';
import {Cell} from '@maxgraph/core';
import {filter, tap} from 'rxjs/operators';
import {EditorModelService} from '../../editor-model.service';
import {EditorSignalFormContext} from '../../forms/editor-signal-form-context';
import {PreviousFormDataSnapshot} from '../../interfaces';

export interface FilteredType {
  name: string;
  description: string;
  urn: string;
  namespace?: string;
  complex?: boolean;
}

@Directive()
export abstract class InputFieldComponent<T extends NamedElement> implements OnDestroy {
  public readonly signalForm = input.required<EditorSignalFormContext>();
  readonly previousData = input<PreviousFormDataSnapshot>({});

  public destroyRef = inject(DestroyRef);
  public metaModelDialogService = inject(EditorModelService);
  public searchService = inject(SearchService);
  public maxgraphService = inject(MaxGraphService);
  public loadedFiles = inject(LoadedFilesService);

  public metaModelElement: T;
  protected resetFormOnDestroy = true;
  protected fieldName: string = null;
  private graphRelationSnapshot: string | undefined;

  constructor() {
    effect(() => {
      this.maxgraphService.graphVersion?.();
      untracked(() => this.checkGraphRelation());
    });

    effect(() => {
      const prevData = this.previousData();
      if (
        !this.fieldName ||
        !(this.metaModelElement instanceof DefaultCharacteristic || this.metaModelElement instanceof DefaultConstraint)
      ) {
        return;
      }

      const multiLanguageFields = ['description', 'preferredName'];

      for (const key in prevData) {
        if (key.startsWith(this.fieldName) && multiLanguageFields.includes(this.fieldName)) {
          const locale = key.slice(this.fieldName.length);
          this.signalForm().set(key, this.getCurrentValue(key, locale));
        }

        if (key === this.fieldName) {
          this.signalForm().set(key, this.getCurrentValue(key));
        }
      }
    });
  }

  get currentCachedFile() {
    return this.loadedFiles.currentLoadedFile.cachedFile;
  }

  get elementExtends() {
    return this.metaModelElement as any as HasExtends;
  }

  getCurrentValue(key: string, locale?: string) {
    if (this.metaModelElement?.isPredefined) {
      if (this.metaModelElement instanceof DefaultCharacteristic && locale) {
        if (this.fieldName === 'description') {
          return this.metaModelElement.getDescription(locale) || '';
        }
        if (this.fieldName === 'preferredName') {
          return this.metaModelElement.getPreferredName(locale) || '';
        }
      }
      return this.metaModelElement?.[key] || '';
    }

    if (key === 'name' && this.metaModelElement?.isAnonymous?.()) {
      return this.metaModelElement?.name || '';
    }

    return this.previousData()?.[key] || this.metaModelElement?.[key] || '';
  }

  ngOnDestroy() {
    if (this.resetFormOnDestroy) this.resetForm();
  }

  getField<TValue>(key: string) {
    return this.signalForm()?.field<TValue>(key);
  }

  setFieldValue<TValue>(key: string, value: TValue): void {
    this.signalForm()?.set(key, value);
  }

  removeField(key: string): void {
    this.signalForm()?.remove(key);
  }

  getMetaModelData() {
    return this.metaModelDialogService.getMetaModelElement().pipe(
      filter((metaModelElement): metaModelElement is T => Boolean(metaModelElement)),
      tap(metaModelElement => {
        this.metaModelElement = <T>metaModelElement;
        this.graphRelationSnapshot = this.graphRelationSignature();
      }),
    );
  }

  /** Element relation mirrored by this field that can also be changed in the graph (e.g. by connecting shapes). */
  protected graphRelation(): unknown {
    return undefined;
  }

  /** Re-reads the field value from the element after its graph relation changed while the editor is open. */
  protected syncGraphRelation(): void {}

  private checkGraphRelation(): void {
    if (!this.metaModelElement || this.graphRelationSnapshot === undefined) {
      return;
    }

    const signature = this.graphRelationSignature();
    if (signature !== this.graphRelationSnapshot) {
      this.graphRelationSnapshot = signature;
      this.syncGraphRelation();
    }
  }

  private graphRelationSignature(): string | undefined {
    const relation = this.graphRelation();
    if (relation === undefined) {
      return undefined;
    }

    const identify = (value: any): string => value?.aspectModelUrn ?? value?.urn ?? value?.getUrn?.() ?? value?.name ?? String(value ?? '');
    return Array.isArray(relation) ? relation.map(identify).join('|') : identify(relation);
  }

  inSearchList(type, value: string) {
    return !!(
      type.name?.toLowerCase().includes(value?.toLowerCase()) ||
      type.description?.toLowerCase().includes(value?.toLowerCase()) ||
      !value
    );
  }

  isLowerCase(value: string) {
    return /^[a-z][a-zA-Z0-9]*$/.test(value);
  }

  isUpperCase(value: string) {
    return /^[A-Z][a-zA-Z0-9]*$/.test(value);
  }

  isAlreadyDefined(filteredType: any, value: string) {
    return Object.values(filteredType).some((type: any) => type.name === value);
  }

  searchExtProperty(value: string): FilteredType[] {
    return (
      this.searchExtElement(value)
        ?.map((cell: Cell) => {
          const modelElement = MaxGraphHelper.getModelElement(cell);
          if (this.loadedFiles.isElementExtern(modelElement) && modelElement instanceof DefaultProperty) {
            return {
              name: modelElement.name,
              description: modelElement.getDescription('en') || '',
              urn: modelElement.aspectModelUrn,
              namespace: modelElement.aspectModelUrn.split('#')[0],
            };
          }
          return null;
        })
        .filter(cell => cell) ?? []
    );
  }

  searchExtCharacteristic(value: string): FilteredType[] {
    return (
      this.searchExtElement(value)
        ?.map((cell: Cell) => {
          const modelElement = MaxGraphHelper.getModelElement(cell);
          if (this.loadedFiles.isElementExtern(modelElement) && modelElement instanceof DefaultCharacteristic) {
            return {
              name: modelElement.name,
              description: modelElement.getDescription('en') || '',
              urn: modelElement.aspectModelUrn,
              namespace: modelElement.aspectModelUrn.split('#')[0],
            };
          }
          return null;
        })
        .filter(cell => cell) ?? []
    );
  }

  searchExtEntity(value: string): FilteredType[] {
    return (
      this.searchExtElement(value)
        ?.map((cell: Cell) => {
          const modelElement = MaxGraphHelper.getModelElement(cell);
          if (this.loadedFiles.isElementExtern(modelElement) && modelElement instanceof DefaultEntity) {
            const entity = this.loadedFiles.findElementOnExtReferences<DefaultEntity>(modelElement.aspectModelUrn);
            return {
              name: modelElement.name,
              description: modelElement.getDescription('en') || '',
              urn: modelElement.aspectModelUrn,
              namespace: modelElement.aspectModelUrn.split('#')[0],
              complex: true,
              entity: entity,
            };
          }
          return null;
        })
        .filter(cell => cell) ?? []
    );
  }

  searchExtAbstractEntity(value: string): FilteredType[] {
    return (
      this.searchExtElement(value)
        ?.map((cell: Cell) => {
          const modelElement = MaxGraphHelper.getModelElement(cell);
          if (this.loadedFiles.isElementExtern(modelElement) && modelElement instanceof DefaultEntity && modelElement.isAbstractEntity()) {
            const entity = this.loadedFiles.findElementOnExtReferences<DefaultEntity>(modelElement.aspectModelUrn);
            return {
              name: modelElement.name,
              description: modelElement.getDescription('en') || '',
              urn: modelElement.aspectModelUrn,
              namespace: modelElement.aspectModelUrn.split('#')[0],
              complex: true,
              entity: entity,
            };
          }
          return null;
        })
        .filter(cell => cell) ?? []
    );
  }

  private resetForm() {
    if (!this.signalForm().value().changedMetaModel) {
      this.signalForm().reset({changedMetaModel: null});
    }
  }

  private searchExtElement(value: string): Cell[] {
    return this.searchService.search<Cell>(value, this.maxgraphService.getAllCells(), mxCellSearchOption);
  }
}
