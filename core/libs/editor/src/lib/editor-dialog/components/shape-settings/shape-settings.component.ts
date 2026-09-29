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

import {LoadedFilesService, SammLanguageSettingsService} from '@ame/domain';
import {ChangeDetectorRef, Component, DestroyRef, effect, inject, input, OnInit, output, signal, untracked} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {MatButton, MatIconButton} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {DefaultCharacteristic, DefaultConstraint, NamedElement, Unit} from '@esmf/aspect-model-loader';
import {TranslocoDirective} from '@jsverse/transloco';
import {EditorModelService} from '../../editor-model.service';
import {EditorFormModel, EditorSignalFormContext} from '../../forms/editor-signal-form-context';
import {AbstractEntityComponent} from '../abstract-entities/abstract-entity.component';
import {AbstractPropertyComponent} from '../abstract-property/abstract-property.component';
import {AspectComponent} from '../aspect/aspect.component';
import {CharacteristicComponent} from '../characteristics/characteristic.component';
import {TraitCharacteristicComponent} from '../characteristics/trait-characteristic/trait-characteristic.component';
import {ConstraintComponent} from '../constraints/constraint.component';
import {EntityComponent} from '../entities/entity.component';
import {EntityInstanceComponent} from '../entity-instance/entity-instance.component';
import {EventComponent} from '../events/event.component';
import {LocateElementComponent} from '../fields/base/locate-element/locate-element.component';
import {OperationComponent} from '../operations/operation.component';
import {PropertyComponent} from '../properties/property.component';
import {UnitComponent} from '../units/unit.component';
import {ValueComponent} from '../value/value.component';
import {SharedSettingsTitleComponent} from './shared-settings-title/shared-settings-title.component';

@Component({
  selector: 'ame-shape-settings',
  host: {
    '(window:keydown.control.enter)': 'saveOnKeyControlEnterEvent()',
  },
  templateUrl: './shape-settings.component.html',
  styleUrls: ['./shape-settings.component.scss'],
  imports: [
    SharedSettingsTitleComponent,
    LocateElementComponent,
    MatIconButton,
    MatIconModule,
    AspectComponent,
    CharacteristicComponent,
    ConstraintComponent,
    PropertyComponent,
    AbstractPropertyComponent,
    OperationComponent,
    AbstractEntityComponent,
    EntityComponent,
    UnitComponent,
    TraitCharacteristicComponent,
    EntityInstanceComponent,
    TranslocoDirective,
    MatButton,
    ValueComponent,
    EventComponent,
  ],
})
export class ShapeSettingsComponent implements OnInit {
  private destroyRef = inject(DestroyRef);
  private languageSettings = inject(SammLanguageSettingsService);
  private changeDetector = inject(ChangeDetectorRef);

  public metaModelDialogService = inject(EditorModelService);
  public loadedFilesService = inject(LoadedFilesService);

  public selectedMetaModelElement: NamedElement;
  public tmpCharacteristic: DefaultCharacteristic | DefaultConstraint;
  public units: Unit[] = [];
  public signalForm = new EditorSignalFormContext<EditorFormModel>({changedMetaModel: null});

  public metaModelElement = signal<NamedElement>(undefined);

  readonly isOpened = input(false);
  readonly modelElement = input<NamedElement>(null);

  readonly save = output<EditorFormModel>();
  readonly afterClose = output();

  constructor() {
    effect(() => {
      const modelElement = this.modelElement();
      if (!modelElement) {
        return;
      }

      untracked(() => this.onEdit(modelElement));
    });
  }

  saveOnKeyControlEnterEvent() {
    if (this.isOpened()) {
      this.onSave();
    }
  }

  ngOnInit() {
    this.metaModelDialogService
      .getMetaModelElement()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(metaModelElement => {
        this.metaModelElement.set(metaModelElement);
      });
  }

  onSave(): void {
    if (this.signalForm.valid()) {
      this.save.emit(this.signalForm.value());
      this.signalForm.reset({changedMetaModel: null});
      this.onClose();
    }
  }

  onClose(): void {
    this.signalForm.reset({changedMetaModel: null});
    this.afterClose.emit();
  }

  isOfType(types: string[]): boolean {
    return types.includes(this.metaModelElement().className);
  }

  onEdit(selectedModelElement: NamedElement) {
    if (selectedModelElement) {
      this.metaModelElement.set(selectedModelElement);
      this.selectedMetaModelElement = selectedModelElement;
      this.addLanguageSettings(selectedModelElement);
      this.metaModelDialogService.updateMetaModelElement(this.metaModelElement());
      if (this.metaModelElement() instanceof DefaultCharacteristic || this.metaModelElement() instanceof DefaultConstraint) {
        this.tmpCharacteristic = this.metaModelElement();
      }
    } else {
      console.warn('Selected element is null. The dialog will not shown.');
    }
  }

  addLanguageSettings(metaModelElement: NamedElement) {
    if (this.languageSettings.getSammLanguageCodes()) {
      this.languageSettings.getSammLanguageCodes().forEach(languageCode => {
        if (!metaModelElement.getPreferredName(languageCode) && !metaModelElement.getDescription(languageCode)) {
          metaModelElement.preferredNames.set(languageCode, '');
          metaModelElement.descriptions.set(languageCode, '');
        }
      });
    }
  }

  isCharacteristic(): boolean {
    return this.isOpened() && this.metaModelElement() instanceof DefaultCharacteristic;
  }

  isConstraint(): boolean {
    return this.metaModelElement() instanceof DefaultConstraint;
  }
}
