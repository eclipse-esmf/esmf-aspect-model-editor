import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormControl} from '@angular/forms';
import {map, startWith} from 'rxjs/operators';
import {Observable, of} from 'rxjs';
import {InputFieldComponent} from '../../input-field.component';
import {DefaultCharacteristic, DefaultEither, DefaultEntity, DefaultScalar, DefaultStructuredValue} from '@bame/meta-model';
import {DataTypeService} from '@bame/shared';
import {EditorModelService} from '../../../../editor-model.service';
import {NamespacesCacheService} from '@bame/cache';
import {RdfModelUtil} from '@bame/rdf/utils';
import {MxGraphHelper, MxGraphService} from '@bame/mx-graph';

@Component({
  selector: 'bci-data-type-input-field',
  templateUrl: './data-type-input-field.component.html',
})
export class DataTypeInputFieldComponent extends InputFieldComponent<DefaultCharacteristic> implements OnInit, OnDestroy {
  filteredDataTypes$: Observable<any[]>;
  filteredEntityTypes$: Observable<any[]>;

  dataTypeControl: FormControl;
  dataTypeEntityControl: FormControl;

  entitiesDisabled = false;

  constructor(
    public metaModelDialogService: EditorModelService,
    public namespacesCacheService: NamespacesCacheService,
    public dataTypeService: DataTypeService,
    private mxGraphService: MxGraphService
  ) {
    super(metaModelDialogService, namespacesCacheService);
    this.fieldName = 'dataTypeEntity';
  }

  ngOnInit(): void {
    this.subscription = this.getMetaModelData().subscribe(() => {
      this.setDataTypeControl();
      this.entitiesDisabled = this.metaModelElement instanceof DefaultStructuredValue || this.hasStructuredValueAsGrandParent();
    });
  }

  ngOnDestroy() {
    super.ngOnDestroy();
    this.parentForm.removeControl('dataType');
  }

  getCurrentValue() {
    return (
      this.previousData?.['dataType'] ||
      this.previousData?.['newDataType'] ||
      this.previousData?.[this.fieldName] ||
      this.metaModelElement?.dataType
    );
  }

  setDataTypeControl() {
    if (this.metaModelElement instanceof DefaultEither) {
      return;
    }
    const dataType = this.getCurrentValue();
    const value = dataType ? RdfModelUtil.getValueWithoutUrnDefinition(dataType?.getUrn()) : null;

    this.parentForm.setControl(
      'dataType',
      new FormControl({
        value,
        disabled: !!value || this.metaModelElement?.isExternalReference(),
      })
    );
    this.parentForm.setControl(
      'dataTypeEntity',
      new FormControl({value: dataType, disabled: this.metaModelElement?.isExternalReference()})
    );
    this.dataTypeControl = this.parentForm.get('dataType') as FormControl;
    this.dataTypeEntityControl = this.parentForm.get('dataTypeEntity') as FormControl;

    this.initFilteredDataTypes();
    this.initFilteredEntityTypes();
  }

  onSelectionChange(fieldPath: string, newValue: any) {
    if (fieldPath !== 'dataType') {
      return;
    }

    if (newValue === null) {
      return; // happens on reset form
    }

    if (newValue.complex) {
      const entity = this.currentCachedFile.getCachedElement(newValue.urn);
      this.parentForm.setControl('dataTypeEntity', new FormControl(entity));
    } else {
      this.parentForm.setControl('dataTypeEntity', new FormControl(new DefaultScalar(newValue.urn)));
    }

    this.dataTypeControl.patchValue(newValue.name);
    this.dataTypeControl.disable();
  }

  createNewEntity(entityName: string) {
    if (!this.isUpperCase(entityName)) {
      return;
    }

    const urn = `${this.metaModelElement.aspectModelUrn.split('#')?.[0]}#${entityName}`;
    const newEntity = new DefaultEntity(this.metaModelElement.metaModelVersion, urn, entityName);

    // set the control of newDatatype
    this.parentForm.setControl('newDataType', new FormControl(newEntity));

    this.dataTypeControl.patchValue(entityName);
    this.dataTypeEntityControl.setValue(newEntity);
    this.dataTypeControl.disable();
  }

  unlockDataType() {
    this.dataTypeControl.enable();
    this.dataTypeControl.patchValue('');
    this.dataTypeEntityControl.patchValue('');
    this.parentForm.setControl('newDataType', new FormControl(null));
    this.dataTypeEntityControl.markAllAsTouched();
  }

  private initFilteredDataTypes() {
    const types = Object.keys(this.dataTypeService.getDataTypes()).map(key => {
      const type = this.dataTypeService.getDataType(key);
      return {
        name: key,
        description: type.description || '',
        urn: type.isDefinedBy,
        complex: false,
      };
    });

    this.filteredDataTypes$ = this.dataTypeControl?.valueChanges.pipe(
      map((value: string) => (value ? types.filter(type => this.inSearchList(type, value)) : types)),
      startWith(types)
    );
  }

  private initFilteredEntityTypes() {
    this.filteredEntityTypes$ = this.entitiesDisabled
      ? of([])
      : this.dataTypeControl?.valueChanges.pipe(
          map((value: string) => {
            const entities = this.currentCachedFile.getCachedEntities()?.map(entity => ({
              name: entity.name,
              description: entity.getDescription('en') || '',
              urn: entity.getUrn(),
              complex: true,
              entity,
            }));

            return value ? entities?.filter(type => this.inSearchList(type, value)) : entities;
          }),
          startWith([])
        );
  }

  private hasStructuredValueAsGrandParent() {
    const cell = this.mxGraphService.resolveCellByModelElement(this.metaModelElement);
    return this.mxGraphService.graph
      .getIncomingEdges(cell)
      .some(firstEdge =>
        this.mxGraphService.graph
          .getIncomingEdges(firstEdge.source)
          .some(secondEdge => MxGraphHelper.getModelElement(secondEdge.source) instanceof DefaultStructuredValue)
      );
  }
}
