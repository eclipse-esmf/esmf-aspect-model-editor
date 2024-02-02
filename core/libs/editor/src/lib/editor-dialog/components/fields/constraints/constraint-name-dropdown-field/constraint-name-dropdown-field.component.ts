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

import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {NamespacesCacheService} from '@ame/cache';
import {
  BaseMetaModelElement,
  Constraint,
  DefaultConstraint,
  DefaultEncodingConstraint,
  DefaultFixedPointConstraint,
  DefaultLanguageConstraint,
  DefaultLengthConstraint,
  DefaultLocaleConstraint,
  DefaultRangeConstraint,
  DefaultRegularExpressionConstraint,
} from '@ame/meta-model';
import {ModelService} from '@ame/rdf/services';
import {SammLanguageSettingsService} from '@ame/settings-dialog';
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
    public namespacesCacheService: NamespacesCacheService,
    public languageSettings: SammLanguageSettingsService
  ) {
    super(editorModelService, modelService, languageSettings);
  }

  ngOnInit(): void {
    this.initConstraintList();
    this.subscription.add(
      this.getMetaModelData().subscribe(() => {
        this.selectedMetaModelElement = this.metaModelElement;
        this.setMetaModelClassName();
        this.selectedConstraint.emit(this.metaModelClassName);
      })
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
    this.metaModelElement.aspectModelUrn = `${this.modelService.getLoadedAspectModel().rdfModel.getAspectModelUrn()}${modelElement.name}`;
  }

  private initConstraintList(): void {
    if (this.listConstraints.size <= 0) {
      this.listConstraints.set('Constraint', DefaultConstraint.createInstance);
      this.listConstraints.set('EncodingConstraint', DefaultEncodingConstraint.createInstance);
      this.listConstraints.set('FixedPointConstraint', DefaultFixedPointConstraint.createInstance);
      this.listConstraints.set('LanguageConstraint', DefaultLanguageConstraint.createInstance);
      this.listConstraints.set('LengthConstraint', DefaultLengthConstraint.createInstance);
      this.listConstraints.set('LocaleConstraint', DefaultLocaleConstraint.createInstance);
      this.listConstraints.set('RangeConstraint', DefaultRangeConstraint.createInstance);
      this.listConstraints.set('RegularExpressionConstraint', DefaultRegularExpressionConstraint.createInstance);
      this.listConstraintNames = [...this.listConstraints.keys()];
    }
  }

  private migrateCommonAttributes(oldMetaModelElement: BaseMetaModelElement) {
    Object.keys(oldMetaModelElement).forEach(oldKey => {
      if (Object.keys(this.metaModelElement).find(key => key === oldKey) && oldKey !== 'aspectModelUrn' && oldKey !== 'name') {
        this.metaModelElement[oldKey] = oldMetaModelElement[oldKey];
      }
    });
  }
}
