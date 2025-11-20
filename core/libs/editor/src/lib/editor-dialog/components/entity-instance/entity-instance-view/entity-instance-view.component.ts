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

import {LoadedFilesService} from '@ame/cache';
import {SelectionModel} from '@angular/cdk/collections';
import {Component, effect, inject, input, OnDestroy, OnInit, output, signal} from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import {MatDialog} from '@angular/material/dialog';
import {MatExpansionPanel, MatExpansionPanelActionRow, MatExpansionPanelHeader, MatExpansionPanelTitle} from '@angular/material/expansion';
import {MatIconModule} from '@angular/material/icon';
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderCellDef,
  MatHeaderRow,
  MatHeaderRowDef,
  MatRow,
  MatRowDef,
  MatTable,
} from '@angular/material/table';
import {MatTooltipModule} from '@angular/material/tooltip';
import {DefaultEntityInstance, DefaultEnumeration, EntityInstanceProperty, Value} from '@esmf/aspect-model-loader';
import {TranslatePipe} from '@ngx-translate/core';
import {filter} from 'rxjs/operators';
import {DataType, FormFieldHelper} from '../../../../helpers/form-field.helper';
import {EntityInstancePipe} from '../../../pipes';
import {EntityInstanceModalComponent} from '../entity-instance-modal/entity-instance-modal.component';
import {EntityInstanceSearchBarComponent} from '../entity-instance-search-bar/entity-instance-search-bar.component';

interface MappedAssertion {
  property: {urn: string; name: string};
  value: Value;
}

@Component({
  selector: 'ame-entity-instance-view',
  templateUrl: './entity-instance-view.component.html',
  styleUrls: ['./entity-instance-view.component.scss'],
  imports: [
    EntityInstanceSearchBarComponent,
    EntityInstancePipe,
    MatExpansionPanel,
    MatExpansionPanelHeader,
    MatExpansionPanelTitle,
    MatIconModule,
    MatTooltipModule,
    MatExpansionPanelActionRow,
    MatTable,
    MatHeaderCell,
    MatCell,
    MatCellDef,
    MatHeaderCellDef,
    MatColumnDef,
    MatRow,
    MatHeaderRow,
    MatRowDef,
    TranslatePipe,
    MatHeaderRowDef,
  ],
})
export class EntityInstanceViewComponent implements OnInit, OnDestroy {
  private matDialog = inject(MatDialog);

  protected readonly formFieldHelper = FormFieldHelper;
  protected readonly dataType = DataType;
  protected complexValues = signal<DefaultEntityInstance[]>([]);

  public readonly displayedColumns = ['key', 'value'];

  public searchFilter: string;
  public selection: SelectionModel<EntityInstanceProperty> = new SelectionModel<EntityInstanceProperty>();
  public tuples: Record<string, MappedAssertion[]> = {};

  public complexValueChange = output<DefaultEntityInstance[]>();
  public parentForm = input<FormGroup>();
  public enumeration = input<DefaultEnumeration>();

  public instances = input([], {
    transform: (values: DefaultEntityInstance[]) =>
      values?.length > 0 && values.some(val => val instanceof DefaultEntityInstance) ? this.checkInnerComplexValues(values) : [],
    // eslint-disable-next-line @angular-eslint/no-input-rename
    alias: 'complexValues',
  });

  public loadedFiles = inject(LoadedFilesService);

  constructor() {
    effect(() => {
      for (const entityInstance of this.complexValues()) {
        this.tuples[entityInstance.aspectModelUrn] = [
          ...entityInstance.getTuples().map(([propertyUrn, value]) => ({
            property: {
              urn: propertyUrn,
              name: propertyUrn.split('#')?.[1] || '',
            },
            value,
          })),
        ];
      }
    });
  }

  ngOnInit() {
    this.complexValues.set(this.instances());
    this.parentForm().setControl('deletedEntityValues', new FormControl([]));
    this.parentForm().setControl('newEntityValues', new FormControl([]));
  }

  ngOnDestroy() {
    this.parentForm().removeControl('deletedEntityValues');
    this.parentForm().removeControl('newEntityValues');
  }

  trackProperty(_index: number, {property}: MappedAssertion): string {
    return `${property.name}`;
  }

  trackValue(_index: number, item: DefaultEntityInstance): string {
    return `${item?.name}`;
  }

  onNew(): void {
    const config = {
      data: {
        metaModel: this.enumeration(),
        dataType:
          this.parentForm().get('newDataType')?.value || this.parentForm().get('dataTypeEntity')?.value || this.enumeration().dataType,
        complexValues: this.instances(),
      },
      minWidth: '700px',
    };
    this.matDialog
      .open(EntityInstanceModalComponent, config)
      .afterClosed()
      .pipe(filter(entityValue => entityValue))
      .subscribe(entityValueConfig => {
        if (!entityValueConfig) {
          return;
        }
        this.complexValues.update(values => [...values, entityValueConfig.entityValue]);
        this.complexValueChange.emit(this.complexValues());
        const previousNewEntityValues = this.parentForm().get('newEntityValues').value;
        this.parentForm()
          .get('newEntityValues')
          .setValue([...previousNewEntityValues, entityValueConfig['newEntityValues']]);
      });
  }

  onDelete(item: DefaultEntityInstance, event: Event): void {
    event.stopPropagation();
    const parentForm = this.parentForm();
    const filterEv = (ev: DefaultEntityInstance) => ev.aspectModelUrn !== item.aspectModelUrn;
    this.complexValues.update(values => values.filter(filterEv));
    if (parentForm.get('newEntityValues').value.includes(item)) {
      // new value, no need to delete from model
      parentForm.get('newEntityValues').setValue(parentForm.get('newEntityValues').value.filter(filterEv));
    } else {
      // existing value
      parentForm.get('deletedEntityValues').setValue([...parentForm.get('deletedEntityValues').value, item]);
    }
    this.complexValueChange.emit([...this.complexValues()]);
  }

  private checkInnerComplexValues(newValue: DefaultEntityInstance[]) {
    return newValue.filter(value => value instanceof DefaultEntityInstance);
  }
}
