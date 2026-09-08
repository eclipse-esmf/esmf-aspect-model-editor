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
import {Component, computed, effect, inject, input, signal} from '@angular/core';
import {toSignal} from '@angular/core/rxjs-interop';
import {MatIcon} from '@angular/material/icon';
import {MatSlideToggle} from '@angular/material/slide-toggle';
import {TranslocoDirective} from '@jsverse/transloco';
import {EditorModelService} from '../../../editor-model.service';
import {EditorSignalFormContext} from '../../../forms/editor-signal-form-context';
import {ElementListComponent} from '../../element-list';
import {BaseInputComponent} from '../../fields';

@Component({
  selector: 'ame-trait-characteristic',
  templateUrl: './trait-characteristic.component.html',
  styleUrls: ['../../fields/field.scss'],
  imports: [BaseInputComponent, ElementListComponent, TranslocoDirective, MatSlideToggle, MatIcon],
})
export class TraitCharacteristicComponent {
  readonly signalForm = input(EditorSignalFormContext.create());
  private loadedFilesService = inject(LoadedFilesService);
  public metaModelDialogService = inject(EditorModelService);
  public element = toSignal(this.metaModelDialogService.getMetaModelElement());

  public isAnonymous = signal(false);
  public canBeAnonymous = computed(() => {
    const el = this.element();
    return Boolean(el && !el.isPredefined && !this.loadedFilesService.isElementExtern(el) && el.parents && el.parents.length > 0);
  });

  constructor() {
    effect(() => {
      const el = this.element();
      if (el) {
        this.isAnonymous.set(Boolean(el.isAnonymous?.()));
      }
    });
  }

  onAnonymousToggleChange(checked: boolean) {
    this.isAnonymous.set(checked);
    const elem = this.element();
    if (elem) {
      elem.anonymous = checked;
      if (checked) {
        elem.name = '[Trait]';
        this.signalForm().set('name', '[Trait]');
        this.signalForm().set('isAnonymous', true);
      } else {
        elem.name = 'Trait';
        this.signalForm().set('name', 'Trait');
        this.signalForm().set('isAnonymous', false);
      }
      this.metaModelDialogService.updateMetaModelElement(elem);
    }
  }
}
