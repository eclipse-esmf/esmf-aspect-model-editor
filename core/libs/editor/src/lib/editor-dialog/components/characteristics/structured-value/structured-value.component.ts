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

import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormControl, Validators} from '@angular/forms';
import {MatDialog} from '@angular/material/dialog';
import {DefaultProperty, DefaultStructuredValue} from '@esmf/aspect-model-loader';
import {Subscription, debounceTime, take} from 'rxjs';
import {EditorDialogValidators} from '../../../validators';
import {InputFieldComponent} from '../../fields';
import {StructuredValueVanillaGroups} from './elements-input-field/model';
import {StructuredValuePropertiesComponent} from './elements-input-field/structured-value-properties/structured-value-properties.component';
import {PredefinedRulesService} from './predefined-rules.service';

const customRule = '--custom-rule--';

@Component({
  selector: 'ame-structured-value',
  templateUrl: './structured-value.component.html',
  styleUrls: ['./structured-value.component.scss'],
})
export class StructuredValueComponent extends InputFieldComponent<DefaultStructuredValue> implements OnInit, OnDestroy {
  public deconstructionRule = '';
  public selectedRule = customRule;
  public customRuleActive = true;
  public groups: StructuredValueVanillaGroups[] = [];
  public splitters: StructuredValueVanillaGroups[] = [];
  public elements: (DefaultProperty | string)[] = [];
  public predefinedRules: Array<{regex: string; name: string}>;

  private subscription$: Subscription;

  get hasGroupsError() {
    if (this.groups.length <= 0) {
      return false;
    }
    const hasErrors = this.groups.some(group => !group.property);
    const controller = this.parentForm.get('elements');

    hasErrors &&
      this.parentForm.get('elements')?.setErrors({
        ...controller.errors,
        noFilledGroups: {error: true},
      });
    return hasErrors;
  }

  constructor(
    private predefinedRulesService: PredefinedRulesService,
    private matDialog: MatDialog,
  ) {
    super();
    this.predefinedRules = Object.entries(this.predefinedRulesService.rules).map(([key, value]) => ({
      regex: key,
      name: (value as any).name,
    }));
  }

  ngOnInit(): void {
    this.subscription = this.getMetaModelData().subscribe(() => {
      this.initForm();
      this.subscribeToRuleChanging();
    });
  }

  ngOnDestroy() {
    super.ngOnDestroy();
    this.subscription$?.unsubscribe();
    this.parentForm.removeControl('deconstructionRule');
    this.parentForm.removeControl('elements');
  }

  initForm() {
    this.deconstructionRule = this.metaModelElement.deconstructionRule || '';
    this.customRuleActive = !this.predefinedRulesService.rules[this.deconstructionRule];
    this.elements = [...(this.metaModelElement.elements || [])];

    this.selectedRule = this.customRuleActive ? customRule : this.deconstructionRule;

    this.parentForm.setControl(
      'deconstructionRule',
      new FormControl(
        {
          value: this.deconstructionRule || '',
          disabled: !this.customRuleActive || this.loadedFiles.isElementExtern(this.metaModelElement),
        },
        {validators: [Validators.required, EditorDialogValidators.regexValidator]},
      ),
    );
    this.parentForm.get('deconstructionRule').markAsTouched();

    this.parentForm.setControl(
      'elements',
      new FormControl({value: [...this.elements], disabled: this.loadedFiles.isElementExtern(this.metaModelElement)}),
    );

    this.rebuildElements();
  }

  selectPredefinedRule(selectedRule: {regex: string; name: string}) {
    const predefinedRule = this.predefinedRulesService.getRule(selectedRule.regex);
    if (!predefinedRule) {
      return;
    }

    this.handlePredefinedRegex();
    this.selectedRule = selectedRule.regex;
    const deconstructionRuleControl = this.parentForm.get('deconstructionRule');
    deconstructionRuleControl?.setValue(selectedRule.regex);
    deconstructionRuleControl?.disable();
    this.parentForm.get('elements')?.setValue([...predefinedRule.elements]);
  }

  openModal() {
    this.matDialog
      .open(StructuredValuePropertiesComponent, {
        data: {groups: this.groups},
      })
      .afterClosed()
      .pipe(take(1))
      .subscribe(value => {
        if (!value) {
          return;
        }

        for (const group of this.groups) {
          const key = `[${group.start}-${group.end}] -> ${group.text}`;
          group.property = value[key];
        }

        this.setElementsControllerValue();
      });
  }

  setCustomRule() {
    const deconstructionRuleControl = this.parentForm.get('deconstructionRule');
    deconstructionRuleControl?.setValue(this.deconstructionRule);
    deconstructionRuleControl.enable();
  }

  private subscribeToRuleChanging() {
    this.subscription$?.unsubscribe();
    this.subscription$ = new Subscription();
    this.subscription$.add(
      this.parentForm
        .get('deconstructionRule')
        ?.valueChanges.pipe(debounceTime(500))
        .subscribe((value: string) => {
          this.selectedRule = this.predefinedRulesService.rules[value] ? value : customRule;
          this.elements = this.parentForm.get('elements')?.value || this.elements;
          this.rebuildElements();
        }),
    );
  }

  private rebuildElements() {
    this.serializeGroups();
    this.fillElementsWithBlanks();
    this.handlePureRegex();
  }

  private handlePureRegex() {
    const elements: any[] = this.elements || [];

    const allGroups = [...(this.splitters || []), ...(this.groups || [])].sort((a, b) => a.start - b.start);
    const lastIndex = this.lastMatchingIndex(allGroups, elements);

    for (let index = 0; index < allGroups.length; index++) {
      if (!allGroups[index].isSplitter) {
        if (index < lastIndex) {
          allGroups[index].property = elements[index];
        } else {
          allGroups[index].property = undefined;
        }
      }
    }

    this.parentForm
      .get('elements')
      ?.setValue(allGroups.map(v => (v.isSplitter ? v.text : v.property)).filter(e => (typeof e === 'string' ? !!e.length : true)));
  }

  private handlePredefinedRegex() {
    const deconstructionRule: string = this.parentForm.get('deconstructionRule')?.value;
    const ruleName = Object.keys(this.predefinedRulesService.rules).find(
      key => this.predefinedRulesService.rules[key].rule === deconstructionRule,
    );

    const predefinedRule = this.predefinedRulesService.getRule(ruleName);
    if (!predefinedRule) {
      return;
    }

    this.parentForm.get('elements')?.setValue(predefinedRule.elements);
    this.elements = predefinedRule.elements;

    this.fillElementsWithBlanks();
    this.serializeGroups();
    const allGroups = [...(this.splitters || []), ...(this.groups || [])].sort((a, b) => a.start - b.start);
    this.syncData(allGroups);
  }

  private syncData(allGroups: StructuredValueVanillaGroups[]) {
    for (let index = 0; index < allGroups.length; index++) {
      if (!allGroups[index].isSplitter) {
        allGroups[index].property = this.elements[index] as DefaultProperty;
      }
    }
  }

  private serializeGroups() {
    const deconstructionRule: string = this.parentForm.get('deconstructionRule')?.value;
    if (!deconstructionRule) {
      return;
    }

    const stack: string[] = [];
    this.groups = [];
    this.splitters = [{start: 0, text: '', end: null, isSplitter: true}];

    for (let index = 0; index < deconstructionRule.length; index++) {
      const char = deconstructionRule[index];
      const currentGroup = this.groups.find(group => group.end === null);
      const currentSplitter = this.splitters.find(splitter => splitter.end === null);

      // when '(' found inside a group, put it in the current group
      if (char === '(' && currentGroup) {
        currentGroup.text = `${currentGroup.text}${char}`;
        stack.push(char);
        continue;
      }

      // when '(' found outside a group, create a new group
      if (char === '(' && deconstructionRule[index - 1] !== '\\') {
        this.groups.push({start: index, end: null, text: char});
        currentSplitter && (currentSplitter.end = index - 1);
        continue;
      }

      if (char === ')' && currentGroup) {
        currentGroup.text = `${currentGroup.text}${char}`;
        if (stack.length) {
          stack.pop();
        } else if (deconstructionRule[index - 1] !== '\\') {
          currentGroup.end = index;
          this.splitters.push({start: index + 1, text: '', end: null, isSplitter: true});
        }
        continue;
      }

      if (currentGroup) {
        currentGroup.text = `${currentGroup.text}${char}`;
      } else if (currentSplitter) {
        currentSplitter.text = `${currentSplitter.text || ''}${char}`;
      } else {
        this.splitters.push({start: index, text: char, end: null, isSplitter: true});
      }
    }
  }

  private lastMatchingIndex(generated = [], elements = []) {
    for (let index = 0; index < generated.length; index++) {
      if (elements[index] && typeof elements[index] === 'string' && !generated[index].isSplitter) {
        return index;
      }
    }

    return generated.length;
  }

  private fillElementsWithBlanks() {
    if (this.parentForm.get('expertMode')?.value) {
      this.elements = [...(this.metaModelElement.elements || [])];
    } else {
      this.elements = this.elements || [];
    }

    if (this.elements && typeof this.elements[0] !== 'string') {
      this.elements.unshift('');
    }

    let index = 1;
    while (index < this.elements.length) {
      const previous = this.elements[index - 1];
      const current = this.elements[index];

      if (typeof previous === typeof current) {
        this.elements.splice(index, 0, '');
        index++;
      }

      index++;
    }

    if (this.elements && typeof this.elements[index - 1] !== 'string') {
      this.elements.push('');
    }
  }

  private setElementsControllerValue(setPropertiesFromElements?: boolean) {
    this.elements = [...(this.splitters || []), ...(this.groups || [])]
      .sort((a, b) => a.start - b.start)
      .map(v => (v.isSplitter ? v.text : v.property));

    this.parentForm.get('elements')?.setValue([...this.elements.filter(e => (typeof e === 'string' ? !!e.length : true))]);

    if (setPropertiesFromElements) {
      const filtered = this.elements.filter(e => typeof e !== 'string');
      for (const index in this.groups) {
        if (this.groups[index] && filtered[index]) {
          this.groups[index].property = filtered[index] as DefaultProperty;
        }
      }
    }
  }
}
