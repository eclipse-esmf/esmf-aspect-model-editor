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

import {MaxGraphHelper, MaxGraphService} from '@ame/max-graph';
import {RdfService} from '@ame/rdf/services';
import {RdfModelUtil} from '@ame/rdf/utils';
import {config, DataTypeService, ElementIconComponent} from '@ame/shared';
import {Component, computed, inject, OnDestroy, OnInit, signal, Signal} from '@angular/core';
import {rxResource, takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {disabled, form, FormField, validateAsync} from '@angular/forms/signals';
import {MatAutocomplete, MatAutocompleteTrigger} from '@angular/material/autocomplete';
import {MatIconButton} from '@angular/material/button';
import {MatOptgroup, MatOption, MatOptionSelectionChange} from '@angular/material/core';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatError, MatInput, MatLabel} from '@angular/material/input';
import {
  DefaultCharacteristic,
  DefaultEither,
  DefaultEntity,
  DefaultScalar,
  DefaultStructuredValue,
  Entity,
  Type,
} from '@esmf/aspect-model-loader';
import {TranslocoDirective} from '@jsverse/transloco';
import {of} from 'rxjs';
import {EditorDialogValidators} from '../../../../validators';
import {InputFieldComponent} from '../../input-field.component';

export interface EntityDataTypeOption {
  name: string;
  description: string;
  urn: string;
  namespace?: string;
  entity: Entity;
}

@Component({
  selector: 'ame-data-type-input-field',
  templateUrl: './data-type-input-field.component.html',
  styleUrls: ['./data-type-input-field.component.scss', '../../field.scss'],
  imports: [
    MatFormFieldModule,
    MatLabel,
    MatAutocompleteTrigger,
    FormField,
    MatInput,
    MatIconButton,
    MatIconModule,
    MatError,
    MatAutocomplete,
    MatOptgroup,
    MatOption,
    ElementIconComponent,
    TranslocoDirective,
  ],
})
export class DataTypeInputFieldComponent extends InputFieldComponent<DefaultCharacteristic> implements OnInit, OnDestroy {
  private editorDialogValidators = inject(EditorDialogValidators);

  public dataTypeService = inject(DataTypeService);
  public maxgraphService = inject(MaxGraphService);
  public rdfService = inject(RdfService);

  public entitiesDisabled = signal(false);
  private readonly displayModel = signal('');
  private readonly dataTypeModel = signal<Type | null>(null);
  private readonly newDataTypeModel = signal<Entity | null>(null);
  private readonly locked = signal(false);
  private readonly blocked = signal(false);
  readonly frozen = computed(() => !!this.signalForm()?.get('elementCharacteristic'));
  private unregisterDisplay = () => undefined;

  private readonly createDuplicateNameResource = (name: Signal<string>) =>
    rxResource({
      params: () => name(),
      stream: ({params}) =>
        this.metaModelElement
          ? this.editorDialogValidators.duplicateNameWithDifferentTypeValue(params, this.metaModelElement, DefaultEntity)
          : of(null),
    });

  readonly displayField = form(this.displayModel, path => {
    validateAsync(path, {
      params: ({value}) => value(),
      factory: this.createDuplicateNameResource,
      onSuccess: result => {
        const kind = result?.['checkShapeNameExtRef'] ? 'checkShapeNameExtRef' : result?.['checkShapeName'] ? 'checkShapeName' : undefined;
        return kind ? {kind, message: 'Data type name is already used by another type'} : null;
      },
      onError: () => ({kind: 'duplicateNameValidation', message: 'Data type name could not be validated'}),
    });
    disabled(path, {
      when: () => this.locked() || this.blocked() || !!this.signalForm()?.get('elementCharacteristic'),
    });
  });
  readonly displayValue = this.displayModel.asReadonly();
  readonly filteredDataTypes = computed<DefaultScalar[]>(() => {
    const value = this.displayModel();
    return this.scalarTypes().filter(type => this.inSearchList(type, value));
  });
  readonly filteredEntityTypes = computed<EntityDataTypeOption[]>(() => {
    if (this.entitiesDisabled()) return [];
    const value = this.displayModel();
    const local = this.currentCachedFile
      .filter<DefaultEntity>(element => element instanceof DefaultEntity && !element.isAbstractEntity())
      .map(entity => ({
        name: entity.name,
        description: entity.getDescription('en') || '',
        urn: entity.aspectModelUrn,
        entity,
      }));
    return [...local, ...this.searchExtEntity(value)].filter(type => this.inSearchList(type, value)) as EntityDataTypeOption[];
  });

  constructor() {
    super();
    this.fieldName = 'dataTypeEntity';
  }

  ngOnInit(): void {
    this.getMetaModelData()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.setDataTypeControl();
        this.entitiesDisabled.set(this.metaModelElement instanceof DefaultStructuredValue || this.hasStructuredValueAsGrandParent());
      });
  }

  ngOnDestroy() {
    this.unregisterDisplay();
    this.signalForm().remove('dataTypeEntity');
    this.signalForm().remove('newDataType');
    super.ngOnDestroy();
  }

  getCurrentValue(): Type | null {
    const previousData = this.previousData();
    return !this.metaModelElement?.isPredefined
      ? (previousData?.['newDataType'] ??
          previousData?.[this.fieldName] ??
          (typeof previousData?.['dataType'] === 'object' ? previousData?.['dataType'] : null) ??
          this.metaModelElement?.dataType ??
          null)
      : (this.metaModelElement?.dataType ?? null);
  }

  setDataTypeControl() {
    if (this.metaModelElement instanceof DefaultEither) {
      return;
    }

    const dataType = this.getCurrentValue();
    const value = dataType ? RdfModelUtil.getValueWithoutUrnDefinition(dataType?.getUrn()) : null;

    this.blocked.set(this.loadedFiles.isElementExtern(this.metaModelElement));
    this.locked.set(!!value);
    this.displayModel.set(value || '');
    this.dataTypeModel.set(dataType || null);
    const newDataType = (this.previousData()?.['newDataType'] as Entity) || null;
    this.newDataTypeModel.set(newDataType);
    this.displayField().markAsTouched();
    this.unregisterDisplay = this.signalForm().register('dataType', this.displayField);
    this.signalForm().set('dataTypeEntity', dataType || null);
    this.signalForm().set('newDataType', newDataType);
  }

  onSelectionChange(fieldPath: string, newValue: Type, event: MatOptionSelectionChange) {
    if (fieldPath !== 'dataType' || !event.isUserInput) {
      return;
    }

    if (newValue === null) {
      return; // happens on reset form
    }

    let resolvedValue = newValue;
    if (newValue.isComplexType()) {
      resolvedValue =
        this.currentCachedFile.get<Type>(newValue.urn) || this.loadedFiles.findElementOnExtReferences<Entity>(newValue.urn) || newValue;
    }

    this.dataTypeModel.set(resolvedValue);
    this.newDataTypeModel.set(null);
    this.signalForm().set('dataTypeEntity', resolvedValue);
    this.signalForm().set('newDataType', null);
    this.displayModel.set(newValue.name);
    this.locked.set(true);
  }

  createNewEntity(entityName: string) {
    if (!this.isUpperCase(entityName)) {
      return;
    }

    const urn = `${this.metaModelElement.aspectModelUrn.split('#')?.[0]}#${entityName}`;
    const newEntity = new DefaultEntity({metaModelVersion: this.metaModelElement.metaModelVersion, aspectModelUrn: urn, name: entityName});

    this.newDataTypeModel.set(newEntity);
    this.dataTypeModel.set(newEntity);
    this.signalForm().set('newDataType', newEntity);
    this.signalForm().set('dataTypeEntity', newEntity);
    this.displayModel.set(entityName);
    this.locked.set(true);
  }

  unlockDataType() {
    this.locked.set(false);
    this.displayModel.set('');
    this.dataTypeModel.set(null);
    this.newDataTypeModel.set(null);
    this.signalForm().set('dataTypeEntity', null);
    this.signalForm().set('newDataType', null);
    this.displayField().markAsTouched();
  }

  hasError(kind: string): boolean {
    return this.displayField()
      .errors()
      .some(error => error.kind === kind);
  }

  private scalarTypes(): DefaultScalar[] {
    return Object.keys(this.dataTypeService.getDataTypes()).map(key => {
      const type = this.dataTypeService.getDataType(key);
      return new DefaultScalar({
        urn: type.isDefinedBy,
        descriptions: new Map([['en', type.description || '']]),
        metaModelVersion: config.currentSammVersion,
      });
    });
  }

  private hasStructuredValueAsGrandParent(): boolean {
    const cell = this.maxgraphService.resolveCellByModelElement(this.metaModelElement);
    if (!cell) return false;

    return this.maxgraphService.graph
      .getIncomingEdges(cell, cell.parent)
      .some(firstEdge =>
        this.maxgraphService.graph
          .getIncomingEdges(firstEdge.source, null)
          .some(secondEdge => MaxGraphHelper.getModelElement(secondEdge.source) instanceof DefaultStructuredValue),
      );
  }
}
