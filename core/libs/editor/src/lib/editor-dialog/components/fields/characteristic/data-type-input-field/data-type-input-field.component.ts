/*
 * Copyright (c) 2022 Robert Bosch Manufacturing Solutions GmbH
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

import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormControl} from '@angular/forms';
import {map, startWith} from 'rxjs/operators';
import {Observable} from 'rxjs';
import {InputFieldComponent} from '../../input-field.component';
import {DefaultCharacteristic, DefaultEither, DefaultEntity, DefaultScalar, DefaultStructuredValue, Entity} from '@ame/meta-model';
import {DataTypeService, SearchService} from '@ame/shared';
import {EditorModelService} from '../../../../editor-model.service';
import {NamespacesCacheService} from '@ame/cache';
import {RdfModelUtil} from '@ame/rdf/utils';
import {MxGraphHelper, MxGraphService} from '@ame/mx-graph';
import {EditorDialogValidators} from '../../../../validators';
import {RdfService} from '@ame/rdf/services';
import {MatOptionSelectionChange} from '@angular/material/core';

@Component({
  selector: 'ame-data-type-input-field',
  templateUrl: './data-type-input-field.component.html',
  styleUrls: ['./data-type-input-field.component.scss'],
})
export class DataTypeInputFieldComponent extends InputFieldComponent<DefaultCharacteristic> implements OnInit, OnDestroy {
  public filteredDataTypes$: Observable<any[]>;
  public filteredEntityTypes$: Observable<any[]>;

  public dataTypeControl: FormControl;
  public dataTypeEntityControl: FormControl;

  public entitiesDisabled = false;

  constructor(
    public metaModelDialogService: EditorModelService,
    public namespacesCacheService: NamespacesCacheService,
    public dataTypeService: DataTypeService,
    public mxGraphService: MxGraphService,
    public rdfService: RdfService,
    public searchService?: SearchService
  ) {
    super(metaModelDialogService, namespacesCacheService, searchService, mxGraphService);
    this.fieldName = 'dataTypeEntity';
  }

  ngOnInit(): void {
    this.subscription = this.getMetaModelData().subscribe(() => {
      this.setDataTypeControl();
      this.entitiesDisabled = this.metaModelElement instanceof DefaultStructuredValue || this.hasStructuredValueAsGrandParent();
    });
  }

  ngOnDestroy() {
    super.ngOnDestroy();
    this.parentForm.removeControl('dataType');
  }

  getCurrentValue() {
    return (
      this.previousData?.['dataType'] ||
      this.previousData?.['newDataType'] ||
      this.previousData?.[this.fieldName] ||
      this.metaModelElement?.dataType
    );
  }

  setDataTypeControl() {
    if (this.metaModelElement instanceof DefaultEither) {
      return;
    }
    const dataType = this.getCurrentValue();
    const value = dataType ? RdfModelUtil.getValueWithoutUrnDefinition(dataType?.getUrn()) : null;

    this.parentForm.setControl(
      'dataType',
      new FormControl(
        {
          value,
          disabled: !!value || this.metaModelElement?.isExternalReference(),
        },
        [
          EditorDialogValidators.duplicateNameWithDifferentType(
            this.namespacesCacheService,
            this.metaModelElement,
            this.rdfService.externalRdfModels,
            DefaultEntity
          ),
        ]
      )
    );
    this.getControl('dataType').markAsTouched();
    this.parentForm.setControl(
      'dataTypeEntity',
      new FormControl({
        value: dataType,
        disabled: this.metaModelElement?.isExternalReference(),
      })
    );
    this.dataTypeControl = this.parentForm.get('dataType') as FormControl;
    this.dataTypeEntityControl = this.parentForm.get('dataTypeEntity') as FormControl;

    this.initFilteredDataTypes();
    this.filteredEntityTypes$ = this.initFilteredEntities(this.dataTypeControl, this.entitiesDisabled);
  }

  onSelectionChange(fieldPath: string, newValue: any, event: MatOptionSelectionChange) {
    if (fieldPath !== 'dataType' || !event.isUserInput) {
      return;
    }

    if (newValue === null) {
      return; // happens on reset form
    }

    if (newValue.complex) {
      let entity = this.currentCachedFile.getCachedElement(newValue.urn);

      if (!entity) {
        entity = this.namespacesCacheService.findElementOnExtReference<Entity>(newValue.urn);
      }

      this.parentForm.setControl('dataTypeEntity', new FormControl(entity));
    } else {
      this.parentForm.setControl('dataTypeEntity', new FormControl(new DefaultScalar(newValue.urn)));
    }

    this.dataTypeControl.patchValue(newValue.name);
    this.dataTypeControl.disable();
  }

  createNewEntity(entityName: string) {
    if (!this.isUpperCase(entityName)) {
      return;
    }

    const urn = `${this.metaModelElement.aspectModelUrn.split('#')?.[0]}#${entityName}`;
    const newEntity = new DefaultEntity(this.metaModelElement.metaModelVersion, urn, entityName);

    // set the control of newDatatype
    this.parentForm.setControl('newDataType', new FormControl(newEntity));

    this.dataTypeControl.patchValue(entityName);
    this.dataTypeEntityControl.setValue(newEntity);
    this.dataTypeControl.disable();
  }

  unlockDataType() {
    this.dataTypeControl.enable();
    this.dataTypeControl.patchValue('');
    this.dataTypeEntityControl.patchValue('');
    this.parentForm.setControl('newDataType', new FormControl(null));
    this.dataTypeEntityControl.markAllAsTouched();
  }

  private initFilteredDataTypes() {
    const types = Object.keys(this.dataTypeService.getDataTypes()).map(key => {
      const type = this.dataTypeService.getDataType(key);
      return {
        name: key,
        description: type.description || '',
        urn: type.isDefinedBy,
        complex: false,
      };
    });

    this.filteredDataTypes$ = this.dataTypeControl?.valueChanges.pipe(
      map((value: string) => (value ? types.filter(type => this.inSearchList(type, value)) : types)),
      startWith(types)
    );
  }

  private hasStructuredValueAsGrandParent() {
    const cell = this.mxGraphService.resolveCellByModelElement(this.metaModelElement);
    return this.mxGraphService.graph
      .getIncomingEdges(cell)
      .some(firstEdge =>
        this.mxGraphService.graph
          .getIncomingEdges(firstEdge.source)
          .some(secondEdge => MxGraphHelper.getModelElement(secondEdge.source) instanceof DefaultStructuredValue)
      );
  }
}
