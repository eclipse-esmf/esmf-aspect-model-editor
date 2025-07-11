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
import {ModelService} from '@ame/rdf/services';
import {SammLanguageSettingsService} from '@ame/settings-dialog';
import {Component, EventEmitter, OnInit, Output} from '@angular/core';
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
import {EditorModelService} from '../../../../editor-model.service';
import {DropdownFieldComponent} from '../../dropdown-field.component';

@Component({
  selector: 'ame-constraint-name-dropdown-field',
  templateUrl: './constraint-name-dropdown-field.component.html',
})
export class ConstraintNameDropdownFieldComponent extends DropdownFieldComponent<DefaultConstraint> implements OnInit {
  public listConstraintNames: Array<string>;
  public listConstraints: Map<string, Function> = new Map();

  @Output() selectedConstraint = new EventEmitter<string>();

  constructor(
    public editorModelService: EditorModelService,
    public modelService: ModelService,
    public languageSettings: SammLanguageSettingsService,
    public loadedFilesService: LoadedFilesService,
  ) {
    super(editorModelService, modelService, languageSettings, loadedFilesService);
  }

  ngOnInit(): void {
    this.initConstraintList();
    this.subscription.add(
      this.getMetaModelData().subscribe(() => {
        this.selectedMetaModelElement = this.metaModelElement;
        this.setMetaModelClassName();
        this.selectedConstraint.emit(this.metaModelClassName);
      }),
    );
  }

  onConstraintChange(constraint: string) {
    this.setPreviousData();

    const createInstanceFunction = this.listConstraints.get(constraint);
    const newConstraintType = this.getMetaModelElementTypeWhenChange(createInstanceFunction);

    const oldMetaModelElement = this.metaModelElement;
    this.metaModelElement = newConstraintType;

    this.metaModelElement.name = oldMetaModelElement.name;
    this.metaModelElement.aspectModelUrn = oldMetaModelElement.aspectModelUrn;
    this.migrateCommonAttributes(oldMetaModelElement);

    this.addLanguageSettings(this.metaModelElement);
    this.setMetaModelElementAspectUrn(newConstraintType);
    this.updateFields(newConstraintType);

    this.selectedConstraint.emit(constraint);
  }

  private getMetaModelElementTypeWhenChange(createInstanceFunction: Function) {
    const modelElementType = createInstanceFunction();
    if (modelElementType.aspectModelUrn === this.selectedMetaModelElement.aspectModelUrn) {
      this.metaModelElement = this.selectedMetaModelElement;
      return;
    }
    return modelElementType;
  }

  private setMetaModelElementAspectUrn(modelElement: Constraint) {
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
      if (!['aspectModelUrn', 'name', 'className'].includes(oldKey) && Object.keys(this.metaModelElement).find(key => key === oldKey)) {
        this.metaModelElement[oldKey] = oldMetaModelElement[oldKey];
      }
    });
  }
}
