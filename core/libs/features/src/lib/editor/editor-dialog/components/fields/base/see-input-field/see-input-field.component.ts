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
import {AsyncPipe} from '@angular/common';
import {Component, effect, ElementRef, inject, OnDestroy, OnInit, signal, viewChild} from '@angular/core';
import {takeUntilDestroyed, toObservable} from '@angular/core/rxjs-interop';
import {disabled, form, FormField, validate} from '@angular/forms/signals';
import {MatAutocomplete, MatAutocompleteTrigger, MatOption} from '@angular/material/autocomplete';
import {MatChipGrid, MatChipInput, MatChipRow, MatChipsModule} from '@angular/material/chips';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatError, MatInput, MatLabel} from '@angular/material/input';
import {MatTooltipModule} from '@angular/material/tooltip';
import {DefaultCharacteristic, DefaultConstraint, DefaultProperty, HasExtends, NamedElement} from '@esmf/aspect-model-loader';
import {TranslocoDirective} from '@jsverse/transloco';
import {map, Observable} from 'rxjs';
import {EditorDialogValidators} from '../../../../validators';
import {InputFieldComponent} from '../../input-field.component';

interface SeeElement {
  name?: string;
  urn: string;
}

@Component({
  selector: 'ame-see-input-field',
  templateUrl: './see-input-field.component.html',
  styleUrls: ['./see-input-field.component.scss', '../../field.scss'],
  imports: [
    MatFormFieldModule,
    MatTooltipModule,
    MatLabel,
    MatChipGrid,
    FormField,
    MatChipRow,
    MatIconModule,
    MatAutocompleteTrigger,
    MatChipInput,
    MatInput,
    MatAutocomplete,
    AsyncPipe,
    MatOption,
    MatError,
    TranslocoDirective,
    MatChipsModule,
  ],
})
export class SeeInputFieldComponent extends InputFieldComponent<NamedElement> implements OnInit, OnDestroy {
  public readonly seeInput = viewChild<ElementRef>('see');
  public readonly chipList = viewChild('chipList', {read: MatChipGrid});

  private readonly seeModel = signal('');
  private readonly searchModel = signal('');
  private readonly disabledState = signal(false);
  private unregisterField = () => undefined;

  readonly seeField = form(this.seeModel, path => disabled(path, {when: this.disabledState}));
  readonly searchField = form(this.searchModel, path => {
    validate(path, ({value}) => {
      const errors = EditorDialogValidators.seeURIValue(value());
      const uriError = errors?.['uri'] as {invalidUris: string[]} | undefined;
      return uriError ? {kind: 'uri', message: 'Invalid URI', invalidUris: uriError.invalidUris} : null;
    });
    disabled(path, {when: this.disabledState});
  });
  public shapes$: Observable<NamedElement[]> = toObservable(this.searchModel).pipe(
    map(fieldValue =>
      !fieldValue
        ? []
        : this.modelElements.filter(
            ({name, aspectModelUrn}) =>
              name?.toLowerCase().includes(fieldValue.toLowerCase()) && !this.elements().find(el => el.urn === aspectModelUrn),
          ),
    ),
  );

  public elements = signal<SeeElement[]>([]);

  get isInherited(): boolean {
    const extending = this.metaModelElement as HasExtends;
    return extending.extends_ && extending.extends_?.see && this.seeModel() === extending.extends_?.see?.join(',');
  }

  get modelElements() {
    return this.maxgraphService.getAllCells().map(cell => MaxGraphHelper.getModelElement(cell));
  }

  constructor() {
    super();
    this.fieldName = 'see';
    this.maxgraphService = inject(MaxGraphService);

    effect(() => {
      this.previousData();
      if (
        !this.fieldName ||
        !(this.metaModelElement instanceof DefaultCharacteristic || this.metaModelElement instanceof DefaultConstraint)
      ) {
        return;
      }

      const seeValue = this.getCurrentValue();
      const decodedValue = this.decodeUriComponent(seeValue);
      this.elements.set(
        [...(decodedValue?.split(',') || [])].filter(Boolean).map(urn => ({
          name: urn.includes('#') && urn.startsWith('urn:samm') ? urn.split('#')[1] : '',
          urn,
        })),
      );
    });
  }

  ngOnInit(): void {
    this.getMetaModelData()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.setSeeControl());
  }

  ngOnDestroy(): void {
    this.unregisterField();
    super.ngOnDestroy();
  }

  hasSearchError(kind: string): boolean {
    return this.searchField()
      .errors()
      .some(error => error.kind === kind);
  }

  getCurrentValue() {
    if (this.metaModelElement?.isPredefined) {
      return this.metaModelElement?.see?.join(',') || '';
    }

    return (
      this.previousData()?.[this.fieldName] ||
      this.metaModelElement?.see?.join(',') ||
      (this.metaModelElement as HasExtends)?.extends_?.see?.join(',') ||
      ''
    );
  }

  removeElement(element: SeeElement) {
    this.elements.set(this.elements().filter(e => e !== element));
    this.syncSeeValue();
  }

  addElementToList(elementName?: string) {
    if (this.searchField().valid()) {
      this.elements.update(elements => [...elements, {urn: this.searchModel(), name: elementName || ''}]);
      this.seeInput().nativeElement.value = '';
      this.searchModel.set('');
      this.syncSeeValue();
      this.chipList().errorState = false;
    } else {
      this.chipList().errorState = true;
      this.seeInput().nativeElement.blur();
    }
  }

  private isDisabled() {
    return this.metaModelElement instanceof DefaultProperty && !!this.metaModelElement?.extends_;
  }

  private setSeeControl() {
    if (!this.metaModelElement) {
      return;
    }
    this.disabledState.set(
      this.metaModelDialogService.isReadOnly() || this.loadedFiles.isElementExtern(this.metaModelElement) || this.isDisabled(),
    );
    const currentValue = this.getCurrentValue();
    const decodedValue = this.decodeUriComponent(currentValue);
    this.seeModel.set(decodedValue || '');
    this.unregisterField = this.signalForm().register(this.fieldName, this.seeField);
    this.elements.set(
      [...(decodedValue?.split(',') || [])].filter(Boolean).map(urn => ({
        name: urn.includes('#') && urn.startsWith('urn:samm') ? urn.split('#')[1] : '',
        urn,
      })),
    );
  }

  private syncSeeValue(): void {
    this.seeModel.set(
      this.elements()
        .map(({urn}) => urn)
        .join(','),
    );
    if (this.metaModelElement) {
      this.metaModelElement.see = this.elements().map(({urn}) => urn);
    }
  }

  private decodeUriComponent(seeReference: string): string {
    return seeReference ? decodeURIComponent(seeReference) : null;
  }
}
