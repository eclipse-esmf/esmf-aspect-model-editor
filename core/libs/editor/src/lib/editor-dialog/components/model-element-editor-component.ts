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
import {Directive, inject, OnDestroy} from '@angular/core';
import {tap} from 'rxjs/operators';
import {Subscription} from 'rxjs';
import {EditorModelService} from '../editor-model.service';
import {FormControl, FormGroup} from '@angular/forms';
import {BaseMetaModelElement} from '@ame/meta-model';
import {RdfModelUtil} from '@ame/rdf/utils';

@Directive()
export abstract class ModelElementEditorComponent<T extends BaseMetaModelElement> implements OnDestroy {
  public metaModelDialogService = inject(EditorModelService);
  public metaModelElement: T;
  public subscription: Subscription;
  public formSubscription: Subscription = new Subscription(); // subscriptions from form controls are added here
  public formGroup: FormGroup;

  ngOnDestroy() {
    this.subscription?.unsubscribe();
    this.cleanSubscriptions();
    this.resetForm();
  }

  getValueWithoutUrnDefinition(value: string): string {
    return RdfModelUtil.getValueWithoutUrnDefinition(value);
  }

  getMetaModelData() {
    return this.metaModelDialogService.getMetaModelElement().pipe(
      tap(metaModelElement => {
        this.metaModelElement = <T>metaModelElement;
      }),
    );
  }

  cleanSubscriptions() {
    this.formSubscription.unsubscribe();
    this.formSubscription = new Subscription();
  }

  private resetForm() {
    if (!this.formGroup) {
      return;
    }
    Object.keys(this.formGroup.controls).forEach((key: string) => {
      this.formGroup.setControl(key, new FormControl());
    });
    this.formGroup.reset();
  }
}
