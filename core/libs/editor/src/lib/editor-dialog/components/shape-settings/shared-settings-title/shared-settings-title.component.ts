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

import {BaseMetaModelElement} from '@ame/meta-model';
import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit} from '@angular/core';
import {LanguageTranslationService} from '@ame/translation';
import {finalize} from 'rxjs';
import {LangChangeEvent} from '@ngx-translate/core';

@Component({
  selector: 'ame-shared-settings-title',
  templateUrl: './shared-settings-title.component.html',
  styleUrls: ['./shared-settings-title.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SharedSettingsTitleComponent implements OnInit {
  public metaModelElement: BaseMetaModelElement;
  public metaModelClassName: string;

  @Input() set metaModelElementInput(value: BaseMetaModelElement) {
    this.metaModelElement = value;
    this.elementName = this.getTitle();
  }

  @Input() set metaModelClassNameInput(value: string) {
    this.metaModelClassName = value;
    this.elementName = this.getTitle();
  }

  elementName: string;

  constructor(private cd: ChangeDetectorRef, private translate: LanguageTranslationService) {}

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
      return this.metaModelElement.isExternalReference()
        ? name
        : this.translate.translateService.instant('EDITOR_CANVAS.SHAPE_SETTING.EDIT', {value: 'element'});
    }
  }
}
