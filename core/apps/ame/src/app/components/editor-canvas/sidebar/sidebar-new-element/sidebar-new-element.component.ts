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
import {ElementModel} from '@ame/shared';
import {FiltersService} from '@ame/loader-filters';
import {ModelService} from '@ame/rdf/services';
import {
  DefaultAbstractEntity,
  DefaultAbstractProperty,
  DefaultAspect,
  DefaultCharacteristic,
  DefaultConstraint,
  DefaultEntity,
  DefaultEvent,
  DefaultOperation,
  DefaultProperty,
  DefaultTrait,
  DefaultUnit,
} from '@ame/meta-model';
import {LanguageTranslationService} from '@ame/translation';
import {finalize} from 'rxjs';
import {LangChangeEvent} from '@ngx-translate/core';

const elementMap = {
  aspect: DefaultAspect,
  abstractProperty: DefaultAbstractProperty,
  property: DefaultProperty,
  characteristic: DefaultCharacteristic,
  abstractEntity: DefaultAbstractEntity,
  entity: DefaultEntity,
  unit: DefaultUnit,
  constraint: DefaultConstraint,
  trait: DefaultTrait,
  operation: DefaultOperation,
  event: DefaultEvent,
};

@Component({
  selector: 'ame-sidebar-new-element',
  templateUrl: './sidebar-new-element.component.html',
  styleUrls: ['./sidebar-new-element.component.scss'],
})
export class SidebarNewElementComponent implements OnInit {
  @Output()
  public openWorkspaces: EventEmitter<void> = new EventEmitter();

  public elements: ElementModel[];

  constructor(private filtersService: FiltersService, private modelService: ModelService, private translate: LanguageTranslationService) {}

  public ngOnInit() {
    this.updateElements(); // Initial population

    const onLangChange$ = this.translate.translateService.onLangChange
      .pipe(finalize(() => onLangChange$.unsubscribe()))
      .subscribe((event: LangChangeEvent) => {
        this.translate.translateService.getTranslation(event.lang).subscribe(() => this.updateElements());
      });
  }

  private updateElements() {
    this.elements = [
      new ElementModel(null, 'Aspect', 'aspect', this.translate.language.ELEMENT_MODEL_DESCRIPTION.ASPECT),
      new ElementModel(null, 'AbstractProperty', 'abstractProperty', this.translate.language.ELEMENT_MODEL_DESCRIPTION.ABSTRACT_PROPERTY),
      new ElementModel(null, 'Property', 'property', this.translate.language.ELEMENT_MODEL_DESCRIPTION.PROPERTY),
      new ElementModel(null, 'Characteristic', 'characteristic', this.translate.language.ELEMENT_MODEL_DESCRIPTION.CHARACTERISTIC),
      new ElementModel(null, 'AbstractEntity', 'abstractEntity', this.translate.language.ELEMENT_MODEL_DESCRIPTION.ABSTRACT_ENTITY),
      new ElementModel(null, 'Entity', 'entity', this.translate.language.ELEMENT_MODEL_DESCRIPTION.ENTITY),
      new ElementModel(null, 'Unit', 'unit', this.translate.language.ELEMENT_MODEL_DESCRIPTION.UNIT),
      new ElementModel(null, 'Constraint', 'constraint', this.translate.language.ELEMENT_MODEL_DESCRIPTION.CONSTRAINT),
      new ElementModel(null, 'Trait', 'trait', this.translate.language.ELEMENT_MODEL_DESCRIPTION.TRAIT),
      new ElementModel(null, 'Operation', 'operation', this.translate.language.ELEMENT_MODEL_DESCRIPTION.OPERATION),
      new ElementModel(null, 'Event', 'event', this.translate.language.ELEMENT_MODEL_DESCRIPTION.EVENT),
    ];
  }

  public isVisible(element: ElementModel) {
    const visibleElements = this.filtersService.currentFilter.visibleElements;
    if (this.isAspectHidden(element)) {
      return false;
    }

    return visibleElements.some(c => elementMap[element.type] === c);
  }

  private isAspectHidden(element: ElementModel): boolean {
    return !!(element.type === 'aspect' && this.modelService.getLoadedAspectModel().aspect);
  }
}
