/*
 * Copyright (c) 2020 Bosch Software Innovations GmbH. All rights reserved.
 */
import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormControl, Validators} from '@angular/forms';
import {Observable, of} from 'rxjs';
import * as locale from 'locale-codes';
import {DefaultLocaleConstraint} from '@bame/meta-model';
import {InputFieldComponent} from '../../input-field.component';
import {EditorModelService} from '../../../../editor-model.service';
import {RdfModelUtil} from '@bame/rdf/utils';

@Component({
  selector: 'bci-locale-code-input-field',
  templateUrl: './locale-code-input-field.component.html',
})
export class LocaleCodeInputFieldComponent extends InputFieldComponent<DefaultLocaleConstraint> implements OnInit, OnDestroy {
  public filteredLanguages: Observable<Array<locale.ILocale>>;

  constructor(public metaModelDialogService: EditorModelService) {
    super(metaModelDialogService);
    this.resetFormOnDestroy = false;
    this.fieldName = 'localeCode';
  }

  doFilterLanguages(enteredLang: string) {
    this.filteredLanguages = enteredLang
      ? of(
          locale.all.filter(
            lang =>
              lang.location != null &&
              (lang.tag.toLowerCase().includes(enteredLang.toLowerCase()) || lang.name.toLowerCase().includes(enteredLang.toLowerCase()))
          )
        )
      : null;
  }

  ngOnInit() {
    this.subscription = this.getMetaModelData().subscribe(() => {
      this.initForm();
    });
  }

  ngOnDestroy() {
    super.ngOnDestroy();

    this.parentForm.removeControl(this.fieldName);
  }

  initForm() {
    this.parentForm.setControl(
      this.fieldName,
      new FormControl(
        {
          value: RdfModelUtil.getValueWithoutUrnDefinition(this.getCurrentValue(this.fieldName)),
          disabled: this.metaModelElement.isExternalReference(),
        },
        Validators.required
      )
    );

    const localeCodeControl = this.parentForm.get(this.fieldName);
    this.formSubscription.add(
      localeCodeControl.valueChanges.subscribe(value => {
        this.doFilterLanguages(value);
      })
    );
  }
}
