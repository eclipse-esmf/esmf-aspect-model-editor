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
import {AfterViewInit, ChangeDetectorRef, Component, Input, OnDestroy, inject} from '@angular/core';
import {FormGroup} from '@angular/forms';
import {EditorModelService} from '../../editor-model.service';
import {PreviousFormDataSnapshot} from '../../interfaces';

@Component({
  selector: 'ame-constraint',
  templateUrl: './constraint.component.html',
})
export class ConstraintComponent implements OnDestroy, AfterViewInit {
  @Input() parentForm: FormGroup;

  public selectedConstraint: string;
  public previousData: PreviousFormDataSnapshot = {};
  public metaModelDialogService = inject(EditorModelService);
  public element$ = this.metaModelDialogService.getMetaModelElement();

  constructor(private changeDetector: ChangeDetectorRef) {}

  ngAfterViewInit(): void {
    this.changeDetector.detectChanges();
  }

  ngOnDestroy() {
    this.previousData = {};
  }

  onPreviousDataChange(previousData: PreviousFormDataSnapshot) {
    this.previousData = previousData;
    this.changeDetector.detectChanges();
  }

  onClassChange(constraint: string) {
    this.selectedConstraint = constraint;
    this.changeDetector.detectChanges();
  }
}
