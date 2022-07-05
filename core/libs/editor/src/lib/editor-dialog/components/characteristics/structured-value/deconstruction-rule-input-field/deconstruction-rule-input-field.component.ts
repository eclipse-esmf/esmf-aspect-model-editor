/*
 * Copyright (c) 2022 Robert Bosch Manufacturing Solutions GmbH
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

import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormControl, Validators} from '@angular/forms';
import {DefaultProperty, DefaultStructuredValue} from '@ame/meta-model';
import {ConfigurationService} from '@ame/settings-dialog';
import {combineLatest} from 'rxjs';
import {EditorDialogValidators, EditorModelService, InputFieldComponent, predefinedRules, PredefinedRulesService} from '@ame/editor';

@Component({
  selector: 'ame-deconstruction-rule-input-field',
  templateUrl: './deconstruction-rule-input-field.component.html',
})
export class DeconstructionRuleInputFieldComponent extends InputFieldComponent<DefaultStructuredValue> implements OnInit, OnDestroy {
  structuredValueElement: string;
  predefinedRules = Object.keys(predefinedRules).map(key => ({
    rule: predefinedRules[key].rule,
    name: key,
  }));

  private expertMode = false;

  constructor(
    private predefinedRulesService: PredefinedRulesService,
    public metaModelDialogService: EditorModelService,
    public configurationService: ConfigurationService
  ) {
    super(metaModelDialogService);
    this.fieldName = 'deconstructionRule';
  }

  ngOnInit() {
    this.subscription = combineLatest([this.configurationService.settings$, this.getMetaModelData()]).subscribe(([settings]) => {
      this.expertMode = settings.deconstructionRuleExpertModeActive;

      if (settings.deconstructionRuleExpertModeActive) {
        const deconstructionRule = this.metaModelElement.deconstructionRule;
        const rules = Object.values(predefinedRules).map(({rule}) => rule);

        if (!rules.includes(deconstructionRule)) {
          this.predefinedRules.push({rule: deconstructionRule, name: 'Current Model Rule'});
        }
      }

      if (this.metaModelElement && this.metaModelElement.elements) {
        this.structuredValueElement = this.metaModelElement.elements
          .map(element => (element instanceof DefaultProperty ? element.name : element))
          .join(' ');
      }

      this.initForm();
    });
  }

  ngOnDestroy() {
    super.ngOnDestroy();
    this.parentForm.removeControl(this.fieldName);
  }

  initForm() {
    this.parentForm.setControl(
      'deconstructionRule',
      new FormControl(
        {value: this.metaModelElement?.deconstructionRule, disabled: this.metaModelElement?.isExternalReference()},
        {validators: [Validators.required, EditorDialogValidators.regexValidator]}
      )
    );
  }

  selectPredefinedRule(rule) {
    const predefinedRule = this.predefinedRulesService.getRule(rule.name);
    if (!predefinedRule) {
      return;
    }

    this.parentForm.setControl('expertMode', new FormControl(this.expertMode));
    this.parentForm.get('elements')?.setValue(predefinedRule.elements);
  }
}
