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
import {ElementIconComponent, sammElements} from '@ame/shared';
import {LanguageTranslationService} from '@ame/translation';
import {ChangeDetectionStrategy, Component, computed, inject, input} from '@angular/core';
import {toSignal} from '@angular/core/rxjs-interop';
import {NamedElement} from '@esmf/aspect-model-loader';
import {ModelElementParserPipe} from '../../element-list/element-list.pipe';

@Component({
  selector: 'ame-shared-settings-title',
  templateUrl: './shared-settings-title.component.html',
  styleUrls: ['./shared-settings-title.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ElementIconComponent, ModelElementParserPipe],
})
export class SharedSettingsTitleComponent {
  private translate = inject(LanguageTranslationService);
  private loadedFilesService = inject(LoadedFilesService);

  readonly metaModelElement = input<NamedElement>();

  private currentLang = toSignal(this.translate.translateService.langChanges$, {
    initialValue: this.translate.translateService.getActiveLang ? this.translate.translateService.getActiveLang() : 'en',
  });

  readonly elementName = computed(() => {
    this.currentLang();
    const element = this.metaModelElement();
    if (element === undefined || element === null) {
      return this.translate.language.editorCanvas.shapeSetting.edit;
    } else {
      let name = `${element.getPreferredName('en') || element.name}`;
      name = name.length > 150 ? `${name.substring(0, 100)}...` : name;
      return this.loadedFilesService.isElementExtern(element)
        ? name
        : this.translate.translateService.translate('editorCanvas.shapeSetting.edit', {value: 'element'});
    }
  });

  getTitle(): string {
    return this.elementName();
  }

  protected readonly sammElements = sammElements;
}
