/*
 * Copyright (c) 2020 Bosch Software Innovations GmbH. All rights reserved.
 */
import {Directive, OnDestroy} from '@angular/core';
import {tap} from 'rxjs/operators';
import {Subscription} from 'rxjs';
import {EditorModelService} from '../editor-model.service';
import {FormControl, FormGroup} from '@angular/forms';
import {BaseMetaModelElement} from '@bame/meta-model';
import {RdfModelUtil} from '@bame/rdf/utils';

@Directive()
export abstract class ModelElementEditorComponent<T extends BaseMetaModelElement> implements OnDestroy {
  metaModelElement: T;

  subscription: Subscription;
  formSubscription: Subscription = new Subscription(); // subscriptions from form controls are added here
  formGroup: FormGroup;

  protected constructor(public metaModelDialogService: EditorModelService) {}

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
      })
    );
  }

  cleanSubscriptions() {
    this.formSubscription.unsubscribe();
    this.formSubscription = new Subscription();
  }

  removeAllControls(formGroup: FormGroup) {
    if (!formGroup) {
      return;
    }
    Object.keys(formGroup.controls).forEach((key: string) => {
      formGroup.removeControl(key);
    });
  }

  setFormGroup(formGroup: FormGroup) {
    this.formGroup = formGroup;
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
