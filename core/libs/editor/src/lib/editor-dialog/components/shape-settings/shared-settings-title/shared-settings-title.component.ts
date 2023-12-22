/*
 * Copyright (c) 2023 Robert Bosch Manufacturing Solutions GmbH
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
import {ChangeDetectionStrategy, Component, Input, OnInit} from '@angular/core';

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

  ngOnInit(): void {
    this.elementName = this.getTitle();
  }

  getTitle(): string {
    if (this.metaModelElement === undefined || this.metaModelElement === null) {
      return 'Edit';
    } else {
      let name = `${this.metaModelElement.getPreferredName('en') || this.metaModelElement.name}`;
      name = name.length > 150 ? `${name.substring(0, 100)}...` : name;
      return this.metaModelElement.isExternalReference() ? name : 'Edit element';
    }
  }
}
