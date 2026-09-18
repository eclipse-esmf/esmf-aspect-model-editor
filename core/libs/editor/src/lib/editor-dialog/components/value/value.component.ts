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
import {config, DataTypeService, ValueTypeResolution, ValueTypeResolverService} from '@ame/shared';
import {Component, computed, effect, inject, input, signal} from '@angular/core';
import {toSignal} from '@angular/core/rxjs-interop';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIcon} from '@angular/material/icon';
import {MatInput} from '@angular/material/input';
import {MatOption, MatSelect} from '@angular/material/select';
import {MatSlideToggle} from '@angular/material/slide-toggle';
import {DefaultScalar, DefaultValue} from '@esmf/aspect-model-loader';
import {TranslocoDirective} from '@jsverse/transloco';
import {EditorModelService} from '../../editor-model.service';
import {EditorSignalFormContext} from '../../forms/editor-signal-form-context';
import {ElementListComponent} from '../element-list';
import {BaseInputComponent, ValueInputFieldComponent} from '../fields';

@Component({
  selector: 'ame-value',
  templateUrl: './value.component.html',
  styleUrls: ['../fields/field.scss'],
  imports: [
    BaseInputComponent,
    ElementListComponent,
    TranslocoDirective,
    ValueInputFieldComponent,
    MatSlideToggle,
    MatIcon,
    MatFormFieldModule,
    MatInput,
    MatSelect,
    MatOption,
  ],
})
export class ValueComponent {
  readonly signalForm = input(EditorSignalFormContext.create());
  public metaModelDialogService = inject(EditorModelService);
  private loadedFilesService = inject(LoadedFilesService);
  private valueTypeResolver = inject(ValueTypeResolverService);
  private dataTypeService = inject(DataTypeService);
  public element = toSignal(this.metaModelDialogService.getMetaModelElement());

  public isAnonymous = signal(false);
  public canBeAnonymous = computed(() => {
    const el = this.element();
    return Boolean(el && !el.isPredefined && !this.loadedFilesService.isElementExtern(el) && el.parents && el.parents.length > 0);
  });

  public typeResolution = computed<ValueTypeResolution>(() => {
    const el = this.element() as DefaultValue;
    return this.valueTypeResolver.resolveValueType(el);
  });

  private static readonly DEFAULT_TYPE_URN = 'http://www.w3.org/2001/XMLSchema#string';

  public selectedTypeUrn = signal<string>(ValueComponent.DEFAULT_TYPE_URN);

  public availableDataTypes = computed<DefaultScalar[]>(() => {
    return Object.keys(this.dataTypeService.getDataTypes()).map(key => {
      const type = this.dataTypeService.getDataType(key);
      return new DefaultScalar({
        urn: type.isDefinedBy,
        descriptions: new Map([['en', type.description || '']]),
        metaModelVersion: config.currentSammVersion,
      });
    });
  });

  constructor() {
    effect(() => {
      const el = this.element() as DefaultValue;
      if (el) {
        this.isAnonymous.set(Boolean(el.isAnonymous?.()));
        const res = this.valueTypeResolver.resolveValueType(el);
        if (res.typeUrn) {
          this.selectedTypeUrn.set(res.typeUrn);
        } else {
          this.selectedTypeUrn.set(ValueComponent.DEFAULT_TYPE_URN);
          const defaultScalar = this.availableDataTypes().find(t => t.urn === ValueComponent.DEFAULT_TYPE_URN);
          if (defaultScalar && !el.type && res.canSelectDataType) {
            el.type = defaultScalar;
            this.signalForm().set('type', defaultScalar);
          }
        }
      }
    });
  }

  onDataTypeChange(typeUrn: string) {
    this.selectedTypeUrn.set(typeUrn);
    const selectedScalar = this.availableDataTypes().find(t => t.urn === typeUrn) || null;
    this.signalForm().set('type', selectedScalar);
    const elem = this.element() as DefaultValue;
    if (elem) {
      elem.type = selectedScalar;
      this.metaModelDialogService.updateMetaModelElement(elem);
    }
  }

  onAnonymousToggleChange(checked: boolean) {
    this.isAnonymous.set(checked);
    const elem = this.element();
    if (elem) {
      elem.anonymous = checked;
      if (checked) {
        elem.name = '[Value]';
        this.signalForm().set('name', '[Value]');
        this.signalForm().set('isAnonymous', true);
      } else {
        elem.name = 'Value';
        this.signalForm().set('name', 'Value');
        this.signalForm().set('isAnonymous', false);
      }
      this.metaModelDialogService.updateMetaModelElement(elem);
    }
  }
}
