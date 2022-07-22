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

import {Component, Input, OnInit} from '@angular/core';
import {FormControl, Validators} from '@angular/forms';
import {NamespacesCacheService} from '@ame/cache';
import {EditorDialogValidators} from '@ame/editor';
import {DefaultProperty, OverWrittenProperty} from '@ame/meta-model';
import {RdfService} from '@ame/rdf/services';
import {debounceTime, map, Observable, startWith} from 'rxjs';

@Component({
  selector: 'ame-structured-value-property-field',
  templateUrl: './structured-value-property-field.component.html',
  styleUrls: ['./structured-value-property-field.component.scss'],
})
export class StructuredValuePropertyFieldComponent implements OnInit {
  @Input() public overwrittenProperty: OverWrittenProperty = null;
  @Input() public fieldControl: FormControl;

  public filteredProperties$: Observable<any>;
  public control: FormControl;

  get currentCacheFile() {
    return this.namespaceCacheService.getCurrentCachedFile();
  }

  constructor(private namespaceCacheService: NamespacesCacheService, private rdfService: RdfService) {}

  ngOnInit() {
    this.control = new FormControl(
      {
        value: this.overwrittenProperty?.property?.name || '',
        disabled: !!this.overwrittenProperty?.property?.name || this.overwrittenProperty?.property?.isExternalReference(),
      },
      [Validators.required, EditorDialogValidators.namingLowerCase]
    );
    this.filteredProperties$ = this.control.valueChanges.pipe(
      startWith([]),
      debounceTime(250),
      map(value => this.currentCacheFile.getCachedProperties().filter(property => property.name.includes(value)))
    );
  }

  unlock() {
    this.control.enable();
    this.control.patchValue('');
    this.fieldControl.setValue('');
    this.overwrittenProperty = null;
  }

  isLowerCase(value: string) {
    return /[a-z]/.test(value?.[0] || '');
  }

  createNewProperty(name: string) {
    const namespace = this.rdfService.currentRdfModel.getAspectModelUrn();
    const version = this.rdfService.currentRdfModel.getMetaModelVersion();
    const newProperty = new DefaultProperty(version, namespace + name, name, null, false);
    this.fieldControl.setValue(newProperty);
    this.control.disable();
  }

  onSelectionChange(property: DefaultProperty) {
    this.fieldControl.setValue(property);
    this.control.disable();
  }
}
