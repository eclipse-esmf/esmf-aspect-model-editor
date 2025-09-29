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

import {MxGraphHelper, MxGraphService} from '@ame/mx-graph';
import {AsyncPipe} from '@angular/common';
import {Component, inject, OnInit, ViewChild} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {FormControl, ReactiveFormsModule} from '@angular/forms';
import {MatAutocomplete, MatAutocompleteTrigger, MatOption} from '@angular/material/autocomplete';
import {MatChipGrid, MatChipInput, MatChipRow} from '@angular/material/chips';
import {MatIconModule} from '@angular/material/icon';
import {MatError, MatFormField, MatInput, MatLabel} from '@angular/material/input';
import {MatTooltipModule} from '@angular/material/tooltip';
import {DefaultProperty, HasExtends, NamedElement} from '@esmf/aspect-model-loader';
import {TranslatePipe} from '@ngx-translate/core';
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
    MatFormField,
    MatTooltipModule,
    MatLabel,
    MatChipGrid,
    ReactiveFormsModule,
    MatChipRow,
    MatIconModule,
    MatAutocompleteTrigger,
    MatChipInput,
    MatInput,
    MatAutocomplete,
    AsyncPipe,
    MatOption,
    MatError,
    TranslatePipe,
  ],
})
export class SeeInputFieldComponent extends InputFieldComponent<NamedElement> implements OnInit {
  @ViewChild('see', {static: true}) seeInput;
  @ViewChild('chipList', {static: true, read: MatChipGrid}) chipList: MatChipGrid;

  public shapes$: Observable<NamedElement[]>;
  public searchControl = new FormControl('', {
    validators: [EditorDialogValidators.seeURI],
    updateOn: 'change',
  });
  public chipControl = new FormControl();
  public elements: SeeElement[] = [];

  get isInherited(): boolean {
    const control = this.parentForm.get(this.fieldName);
    const extending = this.metaModelElement as HasExtends;
    return extending.extends_ && extending.extends_?.see && control.value === extending.extends_?.see?.join(',');
  }

  get modelElements() {
    return this.mxGraphService.getAllCells().map(cell => MxGraphHelper.getModelElement(cell));
  }

  constructor() {
    super();
    this.fieldName = 'see';
    this.mxGraphService = inject(MxGraphService);
  }

  ngOnInit(): void {
    this.getMetaModelData()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.setSeeControl());

    this.searchControl.statusChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(status => {
      this.chipList.errorState = status === 'INVALID';
    });
  }

  getCurrentValue() {
    return (
      this.previousData?.[this.fieldName] ||
      this.metaModelElement?.see?.join(',') ||
      (this.metaModelElement as HasExtends)?.extends_?.see?.join(',') ||
      ''
    );
  }

  removeElement(element: SeeElement) {
    this.elements = this.elements.filter(e => e !== element);
    this.parentForm.get(this.fieldName).setValue(this.elements.map(({urn}) => urn).join(','));
  }

  addElementToList(elementName?: string) {
    if (this.searchControl.valid) {
      this.elements.push({urn: this.searchControl.value, name: elementName || ''});
      this.seeInput.nativeElement.value = '';
      this.searchControl.setValue('');

      this.parentForm.get(this.fieldName).setValue(this.elements.map(({urn}) => urn).join(','));
      this.chipList.errorState = false;
    } else {
      this.chipList.errorState = true;
      this.seeInput.nativeElement.blur();
    }
  }

  private isDisabled() {
    return this.metaModelElement instanceof DefaultProperty && !!this.metaModelElement?.extends_;
  }

  private setSeeControl() {
    this.parentForm.setControl(
      this.fieldName,
      new FormControl(
        {
          value: this.decodeUriComponent(this.getCurrentValue()),
          disabled:
            this.metaModelDialogService.isReadOnly() || this.loadedFiles.isElementExtern(this.metaModelElement) || this.isDisabled(),
        },
        {
          validators: [EditorDialogValidators.seeURI],
        },
      ),
    );

    if (this.parentForm.get(this.fieldName).disabled) {
      this.searchControl.disable();
      this.chipControl.disable();
    }
    this.elements = [...(this.decodeUriComponent(this.getCurrentValue())?.split(',') || [])].map(urn => ({
      name: urn.includes('#') && urn.startsWith('urn:samm') ? urn.split('#')[1] : '',
      urn,
    }));

    this.shapes$ = this.searchControl.valueChanges.pipe(
      map((fieldValue: string) =>
        !fieldValue
          ? []
          : this.modelElements.filter(
              ({name, aspectModelUrn}) =>
                name?.toLowerCase().includes(fieldValue?.toLowerCase()) && !this.elements.find(el => el.urn === aspectModelUrn),
            ),
      ),
    );
  }

  private decodeUriComponent(seeReference: string): string {
    return seeReference ? decodeURIComponent(seeReference) : null;
  }
}
