/*
 * Copyright (c) 2023 Robert Bosch Manufacturing Solutions GmbH
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

import {Component, Injector, OnInit, ViewChild} from '@angular/core';
import {FormControl} from '@angular/forms';
import {BaseMetaModelElement, CanExtend, DefaultProperty} from '@ame/meta-model';
import {EditorModelService} from '../../../../editor-model.service';
import {EditorDialogValidators} from '../../../../validators';
import {InputFieldComponent} from '../../input-field.component';
import {MxGraphHelper, MxGraphService} from '@ame/mx-graph';
import {map, Observable} from 'rxjs';
import {MatChipList} from '@angular/material/chips';

interface SeeElement {
  name?: string;
  urn: string;
}

@Component({
  selector: 'ame-see-input-field',
  templateUrl: './see-input-field.component.html',
  styleUrls: ['./see-input-field.component.scss'],
})
export class SeeInputFieldComponent extends InputFieldComponent<BaseMetaModelElement> implements OnInit {
  @ViewChild('see', {static: true}) seeInput;
  @ViewChild('chipList', {static: true, read: MatChipList}) chipList: MatChipList;

  public shapes$: Observable<BaseMetaModelElement[]>;
  public searchControl = new FormControl('', {
    validators: [EditorDialogValidators.seeURI],
    updateOn: 'change',
  });
  public elements: SeeElement[] = [];

  get isInherited(): boolean {
    const control = this.parentForm.get(this.fieldName);
    return (
      this.metaModelElement instanceof CanExtend &&
      this.metaModelElement.extendedSee &&
      control.value === this.metaModelElement.extendedSee?.join(',')
    );
  }

  get modelElements() {
    return this.mxGraphService.getAllCells().map(cell => MxGraphHelper.getModelElement(cell));
  }

  constructor(public metaModelDialogService: EditorModelService, private injector: Injector) {
    super(metaModelDialogService);
    this.fieldName = 'see';
    this.mxGraphService = this.injector.get(MxGraphService);
  }

  ngOnInit(): void {
    this.subscription = this.getMetaModelData().subscribe(() => this.setSeeControl());
    this.subscription.add(
      this.searchControl.statusChanges.subscribe(status => {
        this.chipList.errorState = status === 'INVALID';
      })
    );
  }

  getCurrentValue() {
    return (
      this.previousData?.[this.fieldName] ||
      this.metaModelElement?.getSeeReferences()?.join(',') ||
      (this.metaModelElement as CanExtend)?.extendedSee?.join(',') ||
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
    return this.metaModelElement instanceof DefaultProperty && !!this.metaModelElement?.extendedElement;
  }

  private setSeeControl() {
    this.parentForm.setControl(
      this.fieldName,
      new FormControl(
        {
          value: this.decodeUriComponent(this.getCurrentValue()),
          disabled: this.metaModelDialogService.isReadOnly() || this.metaModelElement?.isExternalReference() || this.isDisabled(),
        },
        {
          validators: [EditorDialogValidators.seeURI],
        }
      )
    );

    if (this.parentForm.get(this.fieldName).disabled) {
      this.searchControl.disable();
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
                name?.toLowerCase().includes(fieldValue?.toLowerCase()) && !this.elements.find(el => el.urn === aspectModelUrn)
            )
      )
    );
  }

  private decodeUriComponent(seeReference: string): string {
    return seeReference ? decodeURIComponent(seeReference) : null;
  }
}
