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

import {Component, DestroyRef, inject, OnInit, output, signal} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {disabled, form, FormField} from '@angular/forms/signals';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatLabel} from '@angular/material/input';
import {MatOption, MatSelect} from '@angular/material/select';
import {
  Constraint,
  DefaultConstraint,
  DefaultEncodingConstraint,
  DefaultFixedPointConstraint,
  DefaultLanguageConstraint,
  DefaultLengthConstraint,
  DefaultLocaleConstraint,
  DefaultRangeConstraint,
  DefaultRegularExpressionConstraint,
  NamedElement,
} from '@esmf/aspect-model-loader';
import {DropdownFieldComponent} from '../../dropdown-field.component';

@Component({
  selector: 'ame-constraint-name-dropdown-field',
  templateUrl: './constraint-name-dropdown-field.component.html',
  imports: [MatFormFieldModule, MatLabel, MatSelect, FormField, MatOption],
})
export class ConstraintNameDropdownFieldComponent extends DropdownFieldComponent<DefaultConstraint> implements OnInit {
  private destroyRef = inject(DestroyRef);
  private readonly classModel = signal('');

  readonly classField = form(this.classModel, path =>
    disabled(path, {when: () => !!this.selectedMetaModelElement && this.loadedFilesService.isElementExtern(this.selectedMetaModelElement)}),
  );

  public listConstraintNames: Array<string>;
  public listConstraints: Map<string, () => NamedElement> = new Map();

  readonly selectedConstraint = output<string>();

  ngOnInit(): void {
    this.initConstraintList();
    this.getMetaModelData()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.selectedMetaModelElement = this.metaModelElement;
        this.setMetaModelClassName();
        this.classModel.set(this.metaModelClassName);
        this.selectedConstraint.emit(this.metaModelClassName);
      });
  }

  onConstraintChange(constraint: string) {
    this.classModel.set(constraint);
    this.setPreviousData();

    const createInstanceFunction = this.listConstraints.get(constraint);
    const newConstraintType = this.getMetaModelElementTypeWhenChange(createInstanceFunction);

    const oldMetaModelElement = this.metaModelElement;
    this.metaModelElement = newConstraintType;
    this.metaModelElement.anonymous = Boolean(oldMetaModelElement?.isAnonymous?.());

    this.metaModelElement.name = this.metaModelElement.isAnonymous?.() ? `[${constraint}]` : oldMetaModelElement.name;
    this.metaModelElement.aspectModelUrn = oldMetaModelElement.aspectModelUrn;
    this.migrateCommonAttributes(oldMetaModelElement);

    this.addLanguageSettings(this.metaModelElement);
    this.setMetaModelElementAspectUrn(newConstraintType);

    if (this.metaModelElement.isAnonymous?.()) {
      this.signalForm().set('name', this.metaModelElement.name);
      this.signalForm().set('isAnonymous', true);
    }

    this.updateFields(newConstraintType);

    this.selectedConstraint.emit(constraint);
  }

  private getMetaModelElementTypeWhenChange(createInstanceFunction: () => NamedElement) {
    const modelElementType = createInstanceFunction();
    if (modelElementType.aspectModelUrn === this.selectedMetaModelElement.aspectModelUrn) {
      this.metaModelElement = this.selectedMetaModelElement;
    }

    return modelElementType;
  }

  private setMetaModelElementAspectUrn(modelElement: Constraint) {
    if (this.metaModelElement?.isAnonymous?.()) {
      return;
    }
    this.metaModelElement.aspectModelUrn = `${this.loadedFilesService.currentLoadedFile?.rdfModel?.getAspectModelUrn()}${modelElement.name}`;
  }

  private initConstraintList(): void {
    if (this.listConstraints.size <= 0) {
      this.listConstraints.set(
        'EncodingConstraint',
        () => new DefaultEncodingConstraint({name: '', aspectModelUrn: '', metaModelVersion: '', value: ''}),
      );
      this.listConstraints.set(
        'FixedPointConstraint',
        () => new DefaultFixedPointConstraint({name: '', aspectModelUrn: '', metaModelVersion: '', scale: 0, integer: 0}),
      );
      this.listConstraints.set(
        'LanguageConstraint',
        () => new DefaultLanguageConstraint({name: '', aspectModelUrn: '', metaModelVersion: '', languageCode: ''}),
      );
      this.listConstraints.set('LengthConstraint', () => new DefaultLengthConstraint({name: '', aspectModelUrn: '', metaModelVersion: ''}));
      this.listConstraints.set(
        'LocaleConstraint',
        () => new DefaultLocaleConstraint({name: '', aspectModelUrn: '', metaModelVersion: '', localeCode: ''}),
      );
      this.listConstraints.set('RangeConstraint', () => new DefaultRangeConstraint({name: '', aspectModelUrn: '', metaModelVersion: ''}));
      this.listConstraints.set(
        'RegularExpressionConstraint',
        () => new DefaultRegularExpressionConstraint({name: '', aspectModelUrn: '', metaModelVersion: '', value: ''}),
      );
      this.listConstraintNames = [...this.listConstraints.keys()];
    }
  }

  private migrateCommonAttributes(oldMetaModelElement: NamedElement) {
    Object.keys(oldMetaModelElement).forEach(oldKey => {
      if (
        !['aspectModelUrn', 'name', '_name', 'className'].includes(oldKey) &&
        Object.keys(this.metaModelElement).find(key => key === oldKey)
      ) {
        this.metaModelElement[oldKey] = oldMetaModelElement[oldKey];
      }
    });
  }
}
