import {SelectionModel} from '@angular/cdk/collections';
import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {ModalWindowService} from '@bci-web-core/core';
import {filter} from 'rxjs/operators';
import {EntityValueModalComponent} from '..';
import {DefaultEntityValue, DefaultEnumeration, EntityValueProperty} from '@bame/meta-model';
import {EditorModelService} from '../../../editor-model.service';
import {FormControl, FormGroup} from '@angular/forms';

@Component({
  selector: 'bci-entity-value-view',
  templateUrl: './entity-value-view.component.html',
  styleUrls: ['./entity-value-view.component.scss'],
})
export class EntityValueViewComponent implements OnInit, OnDestroy {
  private _complexValues: DefaultEntityValue[];
  private _enumeration: DefaultEnumeration;

  public searchFilter: string;
  public selection: SelectionModel<EntityValueProperty> = new SelectionModel<EntityValueProperty>();

  readonly displayedColumns = ['key', 'value'];

  @Input() public parentForm: FormGroup;

  @Input()
  public set complexValues(newValues: DefaultEntityValue[]) {
    if (newValues?.length > 0 && newValues.some(val => val instanceof DefaultEntityValue)) {
      newValues = this.checkInnerComplexValues(newValues);
    } else {
      newValues = [];
    }
    this._complexValues = newValues;
    // keep the original entity references
    this._complexValues.forEach((complexValue: DefaultEntityValue) => {
      complexValue.entity = newValues.find(newValue => newValue.aspectModelUrn === complexValue.aspectModelUrn).entity;
    });
  }

  public get complexValues(): DefaultEntityValue[] {
    return this._complexValues;
  }

  @Input()
  public set enumeration(value: DefaultEnumeration) {
    this._enumeration = value;
  }

  public get enumeration(): DefaultEnumeration {
    return this._enumeration;
  }

  @Output() complexValueChange = new EventEmitter<DefaultEntityValue[]>();

  constructor(private modalWindowService: ModalWindowService, private editorModelService: EditorModelService) {}

  ngOnInit() {
    this.parentForm.setControl('deletedEntityValues', new FormControl([]));
    this.parentForm.setControl('newEntityValues', new FormControl([]));
  }

  ngOnDestroy() {
    this.parentForm.removeControl('deletedEntityValues');
    this.parentForm.removeControl('newEntityValues');
    this.complexValues = [];
  }

  trackProperty(index: number, item: EntityValueProperty): string {
    return `${item?.key.property.name}`;
  }

  trackValue(index: number, item: DefaultEntityValue): string {
    return `${item?.name}`;
  }

  onNew(): void {
    const config = {
      data: {
        metaModel: this.enumeration,
        dataType: this.parentForm.get('newDataType')?.value || this.parentForm.get('dataTypeEntity')?.value || this.enumeration.dataType,
        complexValues: this.complexValues,
      },
      minWidth: '600px',
      maxHeight: '600px',
    };
    this.modalWindowService
      .openDialogWithComponent(EntityValueModalComponent, config)
      .afterClosed()
      .pipe(filter(entityValue => entityValue))
      .subscribe(entityValueConfig => {
        if (!entityValueConfig) {
          return;
        }
        this.complexValues.push(entityValueConfig.entityValue);
        this.complexValueChange.emit(this.complexValues);
        const previousNewEntityValues = this.parentForm.get('newEntityValues').value;
        this.parentForm.get('newEntityValues').setValue([...previousNewEntityValues, entityValueConfig['newEntityValues']]);
      });
  }

  onDelete(item: DefaultEntityValue, event: Event): void {
    event.stopPropagation();
    const filterEv = (ev: DefaultEntityValue) => ev.aspectModelUrn !== item.aspectModelUrn;
    this.complexValues = this._complexValues.filter(filterEv);
    if (this.parentForm.get('newEntityValues').value.includes(item)) {
      // new value, no need to delete from model
      this.parentForm.get('newEntityValues').setValue(this.parentForm.get('newEntityValues').value.filter(filterEv));
    } else {
      // existing value
      this.parentForm.get('deletedEntityValues').setValue([...this.parentForm.get('deletedEntityValues').value, item]);
    }
    this.complexValueChange.emit([...this.complexValues]);
  }

  private checkInnerComplexValues(newValue: DefaultEntityValue[]) {
    newValue.forEach(value =>
      value?.properties.forEach(innerVal => {
        innerVal.isComplex = innerVal.value instanceof DefaultEntityValue;
      })
    );
    return newValue.filter(value => value instanceof DefaultEntityValue);
  }
}
