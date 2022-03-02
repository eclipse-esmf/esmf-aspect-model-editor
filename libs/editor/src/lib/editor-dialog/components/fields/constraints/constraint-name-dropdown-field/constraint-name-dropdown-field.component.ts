import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {NamespacesCacheService} from '@bame/cache';
import {
  BaseMetaModelElement,
  DefaultConstraint,
  DefaultEncodingConstraint,
  DefaultFixedPointConstraint,
  DefaultLanguageConstraint,
  DefaultLengthConstraint,
  DefaultLocaleConstraint,
  DefaultRangeConstraint,
  DefaultRegularExpressionConstraint,
} from '@bame/meta-model';
import {ModelService} from '@bame/rdf/services';
import {LanguageSettingsService} from '@bame/settings-dialog';
import {EditorModelService} from '../../../../editor-model.service';
import {DropdownFieldComponent} from '../../dropdown-field.component';

@Component({
  selector: 'bci-constraint-name-dropdown-field',
  templateUrl: './constraint-name-dropdown-field.component.html',
})
export class ConstraintNameDropdownFieldComponent extends DropdownFieldComponent<DefaultConstraint> implements OnInit {
  public listConstraintNames: Array<string>;
  public listConstraints: Map<string, Function> = new Map();

  @Output() selectedConstraint = new EventEmitter<string>();

  constructor(
    public metaModelDialogService: EditorModelService,
    public modelService: ModelService,
    public namespacesCacheService: NamespacesCacheService,
    public languageSettings: LanguageSettingsService
  ) {
    super(metaModelDialogService, modelService, languageSettings);
  }

  ngOnInit(): void {
    this.initConstraintList();
    this.subscription.add(
      this.getMetaModelData().subscribe(() => {
        this.selectedMetaModelElement = this.metaModelElement;
        this.setMetaModelClassName();
        this.selectedConstraint.emit(this.metaModelClassName);
      })
    );
  }

  onConstraintChange(constraint: string) {
    this.setPreviousData();

    const createInstanceFunction = this.listConstraints.get(constraint);
    const defaultConstraint = createInstanceFunction();

    const oldMetaModelElement = this.metaModelElement;
    this.metaModelElement = defaultConstraint;

    this.metaModelElement.name = oldMetaModelElement.name;
    this.migrateCommonAttributes(oldMetaModelElement);

    this.addLanguageSettings(this.metaModelElement);
    this.updateFields(defaultConstraint);

    this.selectedConstraint.emit(constraint);
  }

  private initConstraintList(): void {
    if (this.listConstraints.size <= 0) {
      this.listConstraints.set('Constraint', DefaultConstraint.createInstance);
      this.listConstraints.set('EncodingConstraint', DefaultEncodingConstraint.createInstance);
      this.listConstraints.set('FixedPointConstraint', DefaultFixedPointConstraint.createInstance);
      this.listConstraints.set('LanguageConstraint', DefaultLanguageConstraint.createInstance);
      this.listConstraints.set('LengthConstraint', DefaultLengthConstraint.createInstance);
      this.listConstraints.set('LocaleConstraint', DefaultLocaleConstraint.createInstance);
      this.listConstraints.set('RangeConstraint', DefaultRangeConstraint.createInstance);
      this.listConstraints.set('RegularExpressionConstraint', DefaultRegularExpressionConstraint.createInstance);
      this.listConstraintNames = [...this.listConstraints.keys()];
    }
  }

  private migrateCommonAttributes(oldMetaModelElement: BaseMetaModelElement) {
    Object.keys(oldMetaModelElement).forEach(oldKey => {
      if (Object.keys(this.metaModelElement).find(key => key === oldKey) && oldKey !== 'aspectModelUrn' && oldKey !== 'name') {
        this.metaModelElement[oldKey] = oldMetaModelElement[oldKey];
      }
    });
  }
}
