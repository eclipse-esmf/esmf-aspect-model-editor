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
import {SelectionModel} from '@angular/cdk/collections';
import {Component, effect, inject, input, OnDestroy, OnInit, output, signal} from '@angular/core';
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
import {TranslocoDirective} from '@jsverse/transloco';
import {filter} from 'rxjs/operators';
import {DataType, FormFieldHelper} from '../../../../helpers/form-field.helper';
import {EditorSignalFormContext} from '../../../forms/editor-signal-form-context';
import {EntityInstancePipe} from '../../../pipes';
import {EntityInstanceModalComponent, NewEntityInstanceDialogResult} from '../entity-instance-modal/entity-instance-modal.component';
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
    TranslocoDirective,
    MatHeaderRowDef,
  ],
})
export class EntityInstanceViewComponent implements OnInit, OnDestroy {
  private matDialog = inject(MatDialog);

  protected readonly formFieldHelper = FormFieldHelper;
  protected readonly dataType = DataType;
  protected displayedValues = signal<DefaultEntityInstance[]>([]);

  public readonly displayedColumns = ['key', 'value'];

  public searchFilter = signal<string>(undefined);
  public selection = signal<SelectionModel<EntityInstanceProperty>>(new SelectionModel<EntityInstanceProperty>());
  public tuples = signal<Record<string, MappedAssertion[]>>({});

  public complexValueChange = output<DefaultEntityInstance[]>();
  public signalForm = input.required<EditorSignalFormContext>();
  public enumeration = input<DefaultEnumeration>();

  readonly newEntityValues = signal<DefaultEntityInstance[]>([]);
  readonly deletedEntityValues = signal<DefaultEntityInstance[]>([]);
  private createdEntityValueUrns = signal(new Set<string>());

  public complexValues = input([], {
    transform: (values: DefaultEntityInstance[]) =>
      values?.length > 0 && values.some(val => val instanceof DefaultEntityInstance) ? this.checkInnerComplexValues(values) : [],
  });

  public loadedFiles = inject(LoadedFilesService);

  constructor() {
    effect(() => {
      this.tuples.set(
        Object.fromEntries(
          this.displayedValues().map(entityInstance => [
            entityInstance.aspectModelUrn,
            entityInstance.getTuples().map(([propertyUrn, value]) => ({
              property: {
                urn: propertyUrn,
                name: propertyUrn.split('#')?.[1] || '',
              },
              value,
            })),
          ]),
        ),
      );
    });
  }

  ngOnInit() {
    this.displayedValues.set(this.complexValues());
    this.signalForm().set('deletedEntityValues', this.deletedEntityValues());
    this.signalForm().set('newEntityValues', this.newEntityValues());
  }

  ngOnDestroy() {
    this.signalForm().remove('deletedEntityValues');
    this.signalForm().remove('newEntityValues');
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
        dataType: this.signalForm().get('newDataType') || this.signalForm().get('dataTypeEntity') || this.enumeration().dataType,
        complexValues: this.displayedValues(),
      },
      minWidth: '700px',
    };
    this.matDialog
      .open(EntityInstanceModalComponent, config)
      .beforeClosed()
      .pipe(filter(entityValue => entityValue))
      .subscribe((entityValueConfig: NewEntityInstanceDialogResult) => {
        if (!entityValueConfig) {
          return;
        }
        this.displayedValues.update(values => [...values, entityValueConfig.entityValue]);
        this.createdEntityValueUrns.update(urns => new Set(urns).add(entityValueConfig.entityValue.aspectModelUrn));
        this.complexValueChange.emit(this.displayedValues());
        this.newEntityValues.update(values => [...values, ...entityValueConfig.newEntityValues]);
        this.signalForm().set('newEntityValues', this.newEntityValues());
      });
  }

  onDelete(item: DefaultEntityInstance, event: Event): void {
    event.stopPropagation();
    const filterEv = (ev: DefaultEntityInstance) => ev.aspectModelUrn !== item.aspectModelUrn;
    this.displayedValues.update(values => values.filter(filterEv));
    if (this.createdEntityValueUrns().has(item.aspectModelUrn)) {
      // new value, no need to delete from model
      this.createdEntityValueUrns.update(urns => {
        const updated = new Set(urns);
        updated.delete(item.aspectModelUrn);
        return updated;
      });
    } else {
      // existing value
      this.deletedEntityValues.update(values => [...values, item]);
      this.signalForm().set('deletedEntityValues', this.deletedEntityValues());
    }
    this.complexValueChange.emit([...this.displayedValues()]);
  }

  private checkInnerComplexValues(newValue: DefaultEntityInstance[]) {
    return newValue.filter(value => value instanceof DefaultEntityInstance);
  }
}
