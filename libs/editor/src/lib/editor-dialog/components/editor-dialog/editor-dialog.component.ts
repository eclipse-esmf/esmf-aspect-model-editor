/*
 *  Copyright (c) 2020 Robert Bosch Manufacturing Solutions GmbH, Germany. All rights reserved.
 */
import {
  AfterViewChecked,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnInit,
  Output,
  ViewEncapsulation,
} from '@angular/core';
import {FormGroup} from '@angular/forms';
import {
  BaseMetaModelElement,
  Characteristic,
  DefaultAspect,
  DefaultCharacteristic,
  DefaultConstraint,
  DefaultEntity,
  DefaultEvent,
  DefaultOperation,
  DefaultProperty,
  DefaultTrait,
  DefaultUnit,
  Unit,
} from '@bame/meta-model';
import {MasterDetailViewComponent} from '@bci-web-core/core';
import {EditorModelService} from '../../editor-model.service';
import {LanguageSettingsService} from '@bame/settings-dialog';
import {LogService} from '@bame/shared';
import {ModelService} from '@bame/rdf/services';
import {RdfModelUtil} from '@bame/rdf/utils';

@Component({
  selector: 'bci-editor-dialog',
  templateUrl: './editor-dialog.component.html',
  styleUrls: ['./editor-dialog.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class EditorDialogComponent implements AfterViewChecked, OnInit {
  public metaModelClassName: string;
  public metaModelElement: BaseMetaModelElement;
  public selectedMetaModelElement: BaseMetaModelElement;
  public dialogOpen = false;
  public listConstraintNames: string[];
  public listCharacteristics: Map<string, Function> = new Map();
  public tmpCharacteristic: Characteristic;
  public units: Unit[] = [];
  public formGroup: FormGroup = new FormGroup({});

  @Input() masterDetailViewComponent: MasterDetailViewComponent;

  @Output() save = new EventEmitter<FormGroup>();
  @Output() closeDetailView = new EventEmitter();

  @HostListener('window:keydown.control.enter')
  saveOnKeyControlEnterEvent() {
    if (this.isShown()) {
      this.onSave();
    }
  }

  isShown() {
    return this.dialogOpen;
  }

  constructor(
    public metaModelDialogService: EditorModelService,
    private modelService: ModelService,
    private loggerService: LogService,
    private languageSettings: LanguageSettingsService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.metaModelDialogService.getMetaModelElement().subscribe(metaModelElement => {
      this.metaModelElement = metaModelElement;
    });
  }

  ngAfterViewChecked() {
    this.cdr.detectChanges();
  }

  onSave(): void {
    if (this.formGroup?.valid) {
      this.save.emit(this.formGroup.getRawValue());
      this.formGroup.reset();
      this.onClose();
    }
  }

  onClose(): void {
    this.dialogOpen = false;
    this.formGroup.reset();
    this.masterDetailViewComponent.closeDetails();
    this.closeDetailView.emit();
  }

  isOfType(types: string[]): boolean {
    return types.includes(this.metaModelElement.className);
  }

  onEdit(selectedModelElement: BaseMetaModelElement) {
    if (selectedModelElement) {
      this.dialogOpen = true;
      this.metaModelElement = selectedModelElement;
      this.selectedMetaModelElement = selectedModelElement;
      this.addLanguageSettings(selectedModelElement);
      this.metaModelDialogService._updateMetaModelElement(this.metaModelElement);
      if (this.metaModelElement instanceof DefaultCharacteristic || this.metaModelElement instanceof DefaultConstraint) {
        this.tmpCharacteristic = this.metaModelElement;
      }
      if (
        RdfModelUtil.isCharacteristicInstance(
          selectedModelElement.aspectModelUrn,
          this.modelService.getLoadedAspectModel().rdfModel.BAMMC()
        )
      ) {
        this.metaModelClassName = selectedModelElement.aspectModelUrn.split('#')[1].replace('Default', '');
      } else {
        this.metaModelClassName = selectedModelElement.className.replace('Default', '');
      }

      this.masterDetailViewComponent.openDetails();
    } else {
      this.loggerService.logWarn('Selected element is null. The dialog will not shown.');
    }
  }

  getTitle(): string {
    if (this.metaModelElement === undefined || this.metaModelElement === null) {
      return 'Edit';
    }
    let name = `${this.metaModelElement.getPreferredName('en') || this.metaModelElement.name}`;
    name = name.length > 150 ? `${name.substr(0, 100)}...` : name;
    return this.metaModelElement.isExternalReference() ? name : `Edit ${this.getMetaModelElementType()} ${name}`;
  }

  addLanguageSettings(metaModelElement: BaseMetaModelElement) {
    if (this.languageSettings.getLanguageCodes()) {
      this.languageSettings.getLanguageCodes().forEach(languageCode => {
        if (!metaModelElement.getPreferredName(languageCode) && !metaModelElement.getDescription(languageCode)) {
          metaModelElement.addPreferredName(languageCode, '');
          metaModelElement.addDescription(languageCode, '');
        }
      });
    }
  }

  getMetaModelElementType(): string {
    if (this.isAspect()) {
      return 'Aspect';
    }
    if (this.isProperty()) {
      return 'Property';
    }
    if (this.isOperation()) {
      return 'Operation';
    }
    if (this.isCharacteristic()) {
      return 'Characteristic';
    }
    if (this.isConstraint()) {
      return 'Constraint';
    }
    if (this.isEntity()) {
      return 'Entity';
    }
    if (this.isUnit()) {
      return 'Unit';
    }
    if (this.isEvent()) {
      return 'Event';
    }
    return '';
  }

  isAspect(): boolean {
    return this.dialogOpen && this.metaModelElement instanceof DefaultAspect;
  }

  isProperty(): boolean {
    return this.dialogOpen && this.metaModelElement instanceof DefaultProperty;
  }

  isOperation(): boolean {
    return this.dialogOpen && this.metaModelElement instanceof DefaultOperation;
  }

  isEntity(): boolean {
    return this.dialogOpen && this.metaModelElement instanceof DefaultEntity;
  }

  isUnit(): boolean {
    return this.dialogOpen && this.metaModelElement instanceof DefaultUnit;
  }

  isCharacteristic(): boolean {
    return this.dialogOpen && this.metaModelElement instanceof DefaultCharacteristic;
  }

  isTrait(): boolean {
    return this.dialogOpen && this.metaModelElement instanceof DefaultTrait;
  }

  isConstraint(): boolean {
    return this.metaModelElement instanceof DefaultConstraint;
  }

  isEvent(): boolean {
    return this.dialogOpen && this.metaModelElement instanceof DefaultEvent;
  }
}
