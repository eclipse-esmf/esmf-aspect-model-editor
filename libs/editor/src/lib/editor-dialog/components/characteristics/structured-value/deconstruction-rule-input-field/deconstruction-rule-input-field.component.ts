import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormControl, Validators} from '@angular/forms';
import {DefaultStructuredValue, DefaultProperty} from '@bame/meta-model';
import {ConfigurationService} from '@bame/settings-dialog';
import {combineLatest} from 'rxjs';
import {EditorModelService} from '../../../../editor-model.service';
import {EditorDialogValidators} from '../../../../validators';
import {InputFieldComponent} from '../../../fields';
import {PredefinedRulesService, predefinedRules} from './predefined-rules.service';

@Component({
  selector: 'bci-deconstruction-rule-input-field',
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
