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
import {sammElements} from '@ame/shared';
import {LanguageTranslationService} from '@ame/translation';
import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit} from '@angular/core';
import {NamedElement} from '@esmf/aspect-model-loader';
import {LangChangeEvent} from '@ngx-translate/core';
import {finalize} from 'rxjs';

@Component({
  selector: 'ame-shared-settings-title',
  templateUrl: './shared-settings-title.component.html',
  styleUrls: ['./shared-settings-title.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SharedSettingsTitleComponent implements OnInit {
  public metaModelElement: NamedElement;
  public metaModelClassName: string;

  @Input() set metaModelElementInput(value: NamedElement) {
    this.metaModelElement = value;
    this.elementName = this.getTitle();
  }

  elementName: string;

  constructor(
    private cd: ChangeDetectorRef,
    private translate: LanguageTranslationService,
    public loadedFilesService: LoadedFilesService,
  ) {}

  ngOnInit(): void {
    this.elementName = this.getTitle();

    const onLangChange$ = this.translate.translateService.onLangChange
      .pipe(finalize(() => onLangChange$.unsubscribe()))
      .subscribe((event: LangChangeEvent) => {
        this.translate.translateService.getTranslation(event.lang).subscribe(() => {
          this.elementName = this.getTitle();
          this.cd.detectChanges();
        });
      });
  }

  getTitle(): string {
    if (this.metaModelElement === undefined || this.metaModelElement === null) {
      return this.translate.language.EDITOR_CANVAS.SHAPE_SETTING.EDIT;
    } else {
      let name = `${this.metaModelElement.getPreferredName('en') || this.metaModelElement.name}`;
      name = name.length > 150 ? `${name.substring(0, 100)}...` : name;
      return this.loadedFilesService.isElementExtern(this.metaModelElement)
        ? name
        : this.translate.translateService.instant('EDITOR_CANVAS.SHAPE_SETTING.EDIT', {value: 'element'});
    }
  }

  protected readonly sammElements = sammElements;
}
