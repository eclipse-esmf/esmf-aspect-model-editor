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

import {SelectionModel} from '@angular/cdk/collections';
import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {filter} from 'rxjs/operators';
import {EntityInstanceModalComponent} from '..';
import {DefaultEntityInstance, DefaultEnumeration, EntityInstanceProperty} from '@ame/meta-model';
import {FormControl, FormGroup} from '@angular/forms';
import {MatDialog} from '@angular/material/dialog';
import {DataType, FormFieldHelper} from '../../../../helpers/form-field.helper';

@Component({
  selector: 'ame-entity-instance-view',
  templateUrl: './entity-instance-view.component.html',
  styleUrls: ['./entity-instance-view.component.scss']
})
export class EntityInstanceViewComponent implements OnInit, OnDestroy {
  private _complexValues: DefaultEntityInstance[];
  private _enumeration: DefaultEnumeration;

  protected readonly formFieldHelper = FormFieldHelper;
  protected readonly dataType = DataType;

  public searchFilter: string;
  public selection: SelectionModel<EntityInstanceProperty> = new SelectionModel<EntityInstanceProperty>();

  readonly displayedColumns = ['key', 'value'];

  @Input() public parentForm: FormGroup;

  @Input()
  public set complexValues(newValues: DefaultEntityInstance[]) {
    if (newValues?.length > 0 && newValues.some(val => val instanceof DefaultEntityInstance)) {
      newValues = this.checkInnerComplexValues(newValues);
    } else {
      newValues = [];
    }
    this._complexValues = newValues;
    // keep the original entity references
    this._complexValues.forEach((complexValue: DefaultEntityInstance) => {
      complexValue.entity = newValues.find(newValue => newValue.aspectModelUrn === complexValue.aspectModelUrn).entity;
    });
  }

  public get complexValues(): DefaultEntityInstance[] {
    return this._complexValues;
  }

  @Input()
  public set enumeration(value: DefaultEnumeration) {
    this._enumeration = value;
  }

  public get enumeration(): DefaultEnumeration {
    return this._enumeration;
  }

  @Output() complexValueChange = new EventEmitter<DefaultEntityInstance[]>();

  constructor(private matDialog: MatDialog) {}

  ngOnInit() {
    this.parentForm.setControl('deletedEntityValues', new FormControl([]));
    this.parentForm.setControl('newEntityValues', new FormControl([]));
  }

  ngOnDestroy() {
    this.parentForm.removeControl('deletedEntityValues');
    this.parentForm.removeControl('newEntityValues');
    this.complexValues = [];
  }

  trackProperty(_index: number, item: EntityInstanceProperty): string {
    return `${item?.key.property.name}`;
  }

  trackValue(_index: number, item: DefaultEntityInstance): string {
    return `${item?.name}`;
  }

  onNew(): void {
    const config = {
      data: {
        metaModel: this.enumeration,
        dataType: this.parentForm.get('newDataType')?.value || this.parentForm.get('dataTypeEntity')?.value || this.enumeration.dataType,
        complexValues: this.complexValues
      },
      minWidth: '700px'
    };
    this.matDialog
      .open(EntityInstanceModalComponent, config)
      .afterClosed()
      .pipe(filter(entityValue => entityValue))
      .subscribe(entityValueConfig => {
        if (!entityValueConfig) {
          return;
        }
        this.complexValues.push(entityValueConfig.entityValue);
        this.complexValueChange.emit(this.complexValues);
        const previousNewEntityValues = this.parentForm.get('newEntityValues').value;
        this.parentForm.get('newEntityValues').setValue([...previousNewEntityValues, entityValueConfig['newEntityValues']]);
      });
  }

  onDelete(item: DefaultEntityInstance, event: Event): void {
    event.stopPropagation();
    const filterEv = (ev: DefaultEntityInstance) => ev.aspectModelUrn !== item.aspectModelUrn;
    this.complexValues = this._complexValues.filter(filterEv);
    if (this.parentForm.get('newEntityValues').value.includes(item)) {
      // new value, no need to delete from model
      this.parentForm.get('newEntityValues').setValue(this.parentForm.get('newEntityValues').value.filter(filterEv));
    } else {
      // existing value
      this.parentForm.get('deletedEntityValues').setValue([...this.parentForm.get('deletedEntityValues').value, item]);
    }
    this.complexValueChange.emit([...this.complexValues]);
  }

  private checkInnerComplexValues(newValue: DefaultEntityInstance[]) {
    newValue.forEach(value =>
      value?.properties.forEach(innerVal => {
        innerVal.isComplex = innerVal.value instanceof DefaultEntityInstance;
      })
    );
    return newValue.filter(value => value instanceof DefaultEntityInstance);
  }
}
