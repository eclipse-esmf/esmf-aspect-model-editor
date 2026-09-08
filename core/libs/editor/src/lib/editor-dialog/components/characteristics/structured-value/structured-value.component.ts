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

import {Component, inject, OnDestroy, OnInit, signal} from '@angular/core';
import {takeUntilDestroyed, toObservable} from '@angular/core/rxjs-interop';
import {disabled, form, FormField, required, validate} from '@angular/forms/signals';
import {MatButton} from '@angular/material/button';
import {MatDialog} from '@angular/material/dialog';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatError, MatInput, MatLabel} from '@angular/material/input';
import {MatOption, MatSelect} from '@angular/material/select';
import {DefaultProperty, DefaultStructuredValue} from '@esmf/aspect-model-loader';
import {TranslocoDirective} from '@jsverse/transloco';
import {debounceTime, Subscription, take} from 'rxjs';
import {InputFieldComponent} from '../../fields';
import {StructuredValueVanillaGroups} from './elements-input-field/model';
import {StructuredValuePropertiesComponent} from './elements-input-field/structured-value-properties/structured-value-properties.component';
import {PredefinedRulesService} from './predefined-rules.service';

const customRule = '--custom-rule--';

@Component({
  selector: 'ame-structured-value',
  templateUrl: './structured-value.component.html',
  styleUrls: ['./structured-value.component.scss'],
  imports: [
    MatFormFieldModule,
    MatLabel,
    MatSelect,
    MatOption,
    FormField,
    MatError,
    MatInput,
    MatIconModule,
    MatButton,
    TranslocoDirective,
  ],
})
export class StructuredValueComponent extends InputFieldComponent<DefaultStructuredValue> implements OnInit, OnDestroy {
  private predefinedRulesService = inject(PredefinedRulesService);
  private matDialog = inject(MatDialog);

  public deconstructionRule = '';
  public groups: StructuredValueVanillaGroups[] = [];
  public splitters: StructuredValueVanillaGroups[] = [];
  public elements: (DefaultProperty | string)[] = [];

  public selectedRule = signal(customRule);
  public customRuleActive = signal(true);
  public predefinedRules = signal<{regex: string; name: string}[]>([]);
  private readonly deconstructionRuleModel = signal('');
  private readonly elementsModel = signal<(DefaultProperty | string)[]>([]);
  private readonly ruleLocked = signal(false);
  private readonly blocked = signal(false);
  private readonly ruleChanges = toObservable(this.deconstructionRuleModel);
  private ruleSubscription: Subscription;
  private unregisterRule = () => undefined;

  readonly deconstructionRuleField = form(this.deconstructionRuleModel, path => {
    required(path);
    validate(path, ({value}) => {
      try {
        new RegExp(value());
        return null;
      } catch (error) {
        return {kind: 'regexValidator', message: (error as Error).message};
      }
    });
    disabled(path, {when: () => this.ruleLocked() || this.blocked()});
  });

  get hasGroupsError() {
    return this.groups.length > 0 && this.groups.some(group => !group.property);
  }

  constructor() {
    super();
    this.resetFormOnDestroy = false;
    this.predefinedRules.set(
      Object.entries(this.predefinedRulesService.rules).map(([key, value]) => ({
        regex: key,
        name: (value as any).name,
      })),
    );
  }

  ngOnInit(): void {
    this.getMetaModelData()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.initForm();
        this.subscribeToRuleChanging();
      });
  }

  ngOnDestroy() {
    this.ruleSubscription?.unsubscribe();
    this.unregisterRule();
    this.signalForm().remove('elements');
    super.ngOnDestroy();
  }

  initForm() {
    this.deconstructionRule = this.metaModelElement.deconstructionRule || '';
    this.customRuleActive.set(!this.predefinedRulesService.rules[this.deconstructionRule]);
    this.elements = [...(this.metaModelElement.elements || [])];

    this.selectedRule.set(this.customRuleActive() ? customRule : this.deconstructionRule);
    this.blocked.set(this.loadedFiles.isElementExtern(this.metaModelElement));
    this.ruleLocked.set(!this.customRuleActive());
    this.deconstructionRuleModel.set(this.deconstructionRule);
    this.elementsModel.set([...this.elements]);
    this.deconstructionRuleField().markAsTouched();
    this.unregisterRule = this.signalForm().register('deconstructionRule', this.deconstructionRuleField);
    this.signalForm().set('elements', [...this.elements]);

    this.rebuildElements();
  }

  selectPredefinedRule(selectedRule: {regex: string; name: string}) {
    const predefinedRule = this.predefinedRulesService.getRule(selectedRule.regex);
    if (!predefinedRule) {
      return;
    }

    this.selectedRule.set(selectedRule.regex);
    this.deconstructionRuleModel.set(selectedRule.regex);
    this.ruleLocked.set(true);
    this.elementsModel.set([...predefinedRule.elements]);
    this.elements = predefinedRule.elements;
    this.signalForm().set('elements', [...predefinedRule.elements]);
    this.handlePredefinedRegex();
  }

  openModal() {
    this.rebuildElements();
    this.matDialog
      .open(StructuredValuePropertiesComponent, {
        data: {
          groups: this.groups,
          parentProperties: this.metaModelElement?.parents || [],
        },
      })
      .beforeClosed()
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
    this.deconstructionRuleModel.set(this.deconstructionRule);
    this.ruleLocked.set(false);
  }

  private subscribeToRuleChanging() {
    this.ruleSubscription = this.ruleChanges.pipe(debounceTime(500)).subscribe((value: string) => {
      this.selectedRule.set(this.predefinedRulesService.rules[value] ? value : customRule);
      this.elements = this.elementsModel() || this.elements;
      this.rebuildElements();
    });
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

    const filteredPure = allGroups.map(v => (v.isSplitter ? v.text : v.property)).filter(e => (typeof e === 'string' ? !!e.length : true));
    this.elementsModel.set(filteredPure);
    this.signalForm().set('elements', filteredPure);
  }

  private handlePredefinedRegex() {
    const deconstructionRule = this.deconstructionRuleModel();
    const ruleName = Object.keys(this.predefinedRulesService.rules).find(
      key => this.predefinedRulesService.rules[key].rule === deconstructionRule,
    );

    const predefinedRule = this.predefinedRulesService.getRule(ruleName);
    if (!predefinedRule) {
      return;
    }

    this.elementsModel.set([...predefinedRule.elements]);
    this.elements = predefinedRule.elements;
    this.signalForm().set('elements', [...predefinedRule.elements]);

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
    const deconstructionRule = this.deconstructionRuleModel();
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
        if (currentSplitter) currentSplitter.end = index - 1;
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
    if (this.signalForm().get('expertMode')) {
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

  private setElementsControllerValue() {
    this.elements = [...(this.splitters || []), ...(this.groups || [])]
      .sort((a, b) => a.start - b.start)
      .map(v => (v.isSplitter ? v.text : v.property));

    const filteredElements = this.elements.filter(e => (typeof e === 'string' ? !!e.length : true));
    this.elementsModel.set([...filteredElements]);
    this.signalForm().set('elements', [...filteredElements]);
  }

  hasRuleError(kind: string): boolean {
    return this.deconstructionRuleField()
      .errors()
      .some(error => error.kind === kind);
  }
}
