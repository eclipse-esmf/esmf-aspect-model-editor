import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import {
  DefaultEntity,
  DefaultEntityValue,
  DefaultEnumeration,
  DefaultProperty,
  DefaultTrait,
  OverWrittenProperty,
  Property,
} from '@bame/meta-model';
import {EditorModelService, FormFieldHelper} from '@bame/editor';
import {NamespacesCacheService} from '@bame/cache';
import {MatTableDataSource} from '@angular/material/table';
import {map, Observable, startWith} from 'rxjs';
import {ModalWindowService} from '@bci-web-core/core';

@Component({
  selector: 'bci-entity-value-modal-table',
  templateUrl: './entity-value-modal-table.component.html',
  styleUrls: ['./entity-value-modal-table.component.scss'],
})
export class EntityValueModalTableComponent implements OnChanges {
  @Input()
  public form: FormGroup;

  @Input()
  public enumeration: DefaultEnumeration;

  @Input()
  public entityValue: DefaultEntityValue;

  @Input()
  public entity: DefaultEntity;

  public dataSource: MatTableDataSource<DefaultProperty>;

  public filteredEntityValues$: {[key: string]: Observable<any[]>} = {};

  // only used for displaying the name of an entity value within an input as string
  public displayFormGroup = new FormGroup({});

  public readonly displayedColumns = ['key', 'value'];

  constructor(
    public metaModelDialogService: EditorModelService,
    public namespacesCacheService: NamespacesCacheService,
    public modalWindowService: ModalWindowService
  ) {}

  get propertiesFormGroup(): FormGroup {
    return this.form.get('properties') as FormGroup;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.hasOwnProperty('entity') && this.entity) {
      this.dataSource = new MatTableDataSource(this.entity.properties.map(property => property.property));
      this.entity.properties.forEach((property: OverWrittenProperty) => {
        this.initFilteredEntityValues(property.property);
      });
    }
  }

  isComplexProperty(property: Property) {
    return FormFieldHelper.isComplexProperty(property);
  }

  isEnumerationProperty(property: DefaultProperty) {
    return FormFieldHelper.isEnumerationProperty(property);
  }

  // get the dropdown suggestions for creating a new entity value for a complex property (not enumeration)
  getPropertyValues(property: Property): DefaultEntityValue[] {
    const entityValueFilter = (entityValue: DefaultEntityValue) => {
      const characteristic =
        property?.characteristic instanceof DefaultTrait ? property.characteristic.baseCharacteristic : property.characteristic;
      return entityValue.entity.aspectModelUrn === characteristic?.dataType?.['aspectModelUrn'];
    };
    const existingEntityValues = this.namespacesCacheService.getCurrentCachedFile().getCachedEntityValues().filter(entityValueFilter);
    const newEntityValues = this.form.get('newEntityValues')?.value?.filter(entityValueFilter) || [];
    return [...existingEntityValues, ...newEntityValues];
  }

  showCreateNewEntityOption(entityValueName: string, entityValues: DefaultEntityValue[]): boolean {
    if (
      entityValueName &&
      entityValueName !== this.form.get('name')?.value &&
      (entityValues.length === 0 || !entityValues.some(ev => ev.name === entityValueName)) &&
      entityValueName.indexOf(' ') < 0
    ) {
      const namespace = this.entity.aspectModelUrn.split('#')[0];
      return (
        !this.namespacesCacheService.getCurrentCachedFile().getCachedElement(`${namespace}#${entityValueName}`) &&
        !this.form.get('newEntityValues')?.value?.some(ev => ev.name === entityValueName)
      );
    }
    return false;
  }

  changeSelection(property, propertyValue) {
    this.displayFormGroup.get(property.name).setValue(propertyValue.name);
    this.displayFormGroup.get(property.name).disable();
    this.propertiesFormGroup.get(property.name).setValue(propertyValue);
  }

  getControl(propertyControlName: string): FormControl {
    return this.propertiesFormGroup.get(propertyControlName) as FormControl;
  }

  getComplexDisplayControl(propertyControlName: string): FormControl {
    const formControl = this.displayFormGroup.get(propertyControlName);
    if (formControl) {
      return formControl as FormControl;
    } else {
      this.displayFormGroup.setControl(propertyControlName, new FormControl(null));
      return this.displayFormGroup.get(propertyControlName) as FormControl;
    }
  }

  unlockEntityValue(property: Property) {
    this.getComplexDisplayControl(property.name).enable();
    this.getComplexDisplayControl(property.name).patchValue('');
    const removedEntityValue = this.propertiesFormGroup.get(property.name).value;
    if (this.form.get('newEntityValues')?.value?.includes(removedEntityValue)) {
      this.form.get('newEntityValues').setValue(this.form.get('newEntityValues').value.filter(ev => ev !== removedEntityValue));
    }
    this.propertiesFormGroup.get(property.name).patchValue(null);
  }

  createNewEntityValue(property, entityValueName) {
    const characteristic =
      property?.characteristic instanceof DefaultTrait ? property.characteristic.baseCharacteristic : property.characteristic;
    const urn = `${property.aspectModelUrn.split('#')?.[0]}#${entityValueName}`;
    const newEntityValue = new DefaultEntityValue(
      property.metaModelVersion,
      entityValueName,
      urn,
      characteristic?.dataType as DefaultEntity,
      (characteristic?.dataType?.['properties'] as OverWrittenProperty[]) || []
    );
    this.propertiesFormGroup.get(property.name).setValue(newEntityValue);
    if (this.form.get('newEntityValues')?.value) {
      const newEntityValues = this.form.get('newEntityValues').value;
      this.form.get('newEntityValues').setValue([...newEntityValues, newEntityValue]);
    } else {
      this.form.setControl('newEntityValues', new FormControl([newEntityValue]));
    }
    this.getComplexDisplayControl(property.name).disable();
  }

  // initialize the observables for the dropdown options for a specific property
  private initFilteredEntityValues(property: Property) {
    const entityValues = this.getPropertyValues(property);

    this.filteredEntityValues$[property.name] = this.getComplexDisplayControl(property.name)?.valueChanges.pipe(
      map(
        (value: string) => this.getPropertyValues(property).filter(entityValue => entityValue.name.startsWith(value)),
        startWith(entityValues)
      )
    );
  }
}
