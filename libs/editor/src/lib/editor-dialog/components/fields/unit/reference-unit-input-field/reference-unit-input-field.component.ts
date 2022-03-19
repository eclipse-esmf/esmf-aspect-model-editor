import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormControl} from '@angular/forms';
import {DefaultDuration, DefaultUnit, Unit} from '@bame/meta-model';
import {EditorModelService} from '../../../../editor-model.service';
import {InputFieldComponent} from '../../input-field.component';
import {Observable} from 'rxjs';
import {BammUnitInstantiator, MetaModelElementInstantiator} from '@bame/instantiator';
import {NamespacesCacheService} from '@bame/cache';
import {ModelService} from '@bame/rdf/services';

declare const bammuDefinition: any;

@Component({
  selector: 'bci-reference-unit-input-field',
  templateUrl: './reference-unit-input-field.component.html',
})
export class ReferenceUnitInputFieldComponent extends InputFieldComponent<DefaultUnit> implements OnInit, OnDestroy {
  filteredPredefinedUnits$: Observable<Array<any>>;
  filteredUnits$: Observable<Array<DefaultUnit>>;
  units: Array<Unit> = [];
  unitDisplayControl: FormControl;
  private bammUnitInstantiator: BammUnitInstantiator;

  constructor(
    public metaModelDialogService: EditorModelService,
    public namespacesCacheService: NamespacesCacheService,
    private modelService: ModelService
  ) {
    super(metaModelDialogService, namespacesCacheService);
    this.bammUnitInstantiator = new BammUnitInstantiator(
      new MetaModelElementInstantiator(this.modelService.getLoadedAspectModel().rdfModel, this.currentCachedFile)
    );
  }

  ngOnInit(): void {
    this.subscription = this.getMetaModelData().subscribe(metaModelElement => {
      this.units = metaModelElement ? Object.keys(bammuDefinition.units).map(key => bammuDefinition.units[key]) : null;
      if (this.metaModelElement instanceof DefaultDuration) {
        this.units = this.units.filter(unit => unit.quantityKinds && unit.quantityKinds.includes('time'));
      }
      this.initReferenceUnitControl();
    });
  }

  ngOnDestroy() {
    super.ngOnDestroy();
    this.parentForm.removeControl('referenceUnit');
  }

  initReferenceUnitControl() {
    const referenceUnit = this.metaModelElement?.referenceUnit;

    this.unitDisplayControl = new FormControl({
      value: referenceUnit?.name,
      disabled: referenceUnit || this.metaModelElement.isExternalReference(),
    });

    this.parentForm.setControl(
      'referenceUnit',
      new FormControl({
        value: this.metaModelElement?.referenceUnit,
        disabled: this.metaModelDialogService.isReadOnly() || this.metaModelElement?.isExternalReference(),
      })
    );

    this.filteredUnits$ = this.initFilteredUnits(this.unitDisplayControl);
    this.filteredPredefinedUnits$ = this.initFilteredPredefinedUnits(this.unitDisplayControl, this.units);
  }

  unlockUnit() {
    this.unitDisplayControl.enable();
    this.unitDisplayControl.patchValue('');
    this.parentForm.get('referenceUnit').setValue(null);
    this.parentForm.get('referenceUnit').markAllAsTouched();
  }

  onPredefinedUnitChange(predefinedUnit: Unit) {
    if (predefinedUnit) {
      const newPredefinedUnit = this.bammUnitInstantiator.getUnit(predefinedUnit?.name);
      this.parentForm.get('referenceUnit').setValue(newPredefinedUnit);
      this.unitDisplayControl.patchValue(newPredefinedUnit.name);
      this.unitDisplayControl.disable();
    }
  }
}
