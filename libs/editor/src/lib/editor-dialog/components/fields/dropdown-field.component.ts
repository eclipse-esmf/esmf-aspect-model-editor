import {Directive, EventEmitter, Input, OnDestroy, Output} from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import {EditorModelService} from '../../editor-model.service';
import {tap} from 'rxjs/operators';
import {Subscription} from 'rxjs';
import {DefaultCharacteristic, DefaultConstraint} from '@bame/meta-model';
import {LanguageSettingsService} from '@bame/settings-dialog';
import {RdfModelUtil} from '@bame/rdf/utils';
import {ModelService} from '@bame/rdf/services';
import {PreviousFormDataSnapshot} from '../../interfaces';

@Directive()
export abstract class DropdownFieldComponent<T extends DefaultCharacteristic | DefaultConstraint> implements OnDestroy {
  @Input() parentForm: FormGroup;
  @Input() previousDataSnapshot: PreviousFormDataSnapshot = {};

  public metaModelElement: T;
  public subscription: Subscription = new Subscription();
  public selectedMetaModelElement: T;
  public metaModelClassName: string;

  protected _previousData: PreviousFormDataSnapshot = {};

  @Output() previousData = new EventEmitter<PreviousFormDataSnapshot>();

  protected constructor(
    public metaModelDialogService: EditorModelService,
    public modelService: ModelService,
    public languageSettings: LanguageSettingsService
  ) {}

  protected setPreviousData() {
    if (this.metaModelElement instanceof DefaultCharacteristic && this.metaModelElement.isPredefined()) {
      return;
    }

    this._previousData = {
      ...this.previousDataSnapshot,
      ...this._previousData,
      ...(this.parentForm.value || {}),
      value: {
        ...(this.previousDataSnapshot.value || {}),
        ...(this._previousData.value || {}),
        [this.metaModelElement.className]: this.parentForm.value?.value || '',
      },
      minValue: {
        ...(this.previousDataSnapshot.minValue || {}),
        ...(this._previousData.minValue || {}),
        [this.metaModelElement.className]: this.parentForm.value?.minValue || '',
      },
      maxValue: {
        ...(this.previousDataSnapshot.maxValue || {}),
        ...(this._previousData.maxValue || {}),
        [this.metaModelElement.className]: this.parentForm.value?.maxValue || '',
      },
    };

    this.previousData.emit(this._previousData);
  }

  public getMetaModelData() {
    return this.metaModelDialogService.getMetaModelElement().pipe(
      tap(metaModelElement => {
        this.metaModelElement = <T>metaModelElement;
      })
    );
  }

  public setMetaModelClassName(): void {
    if (
      RdfModelUtil.isCharacteristicInstance(
        this.selectedMetaModelElement.aspectModelUrn,
        this.modelService.getLoadedAspectModel().rdfModel.BAMMC()
      )
    ) {
      this.metaModelClassName = this.selectedMetaModelElement.aspectModelUrn.split('#')[1].replace('Default', '');
    } else {
      this.metaModelClassName = this.selectedMetaModelElement.className.replace('Default', '');
    }
  }

  public addLanguageSettings(metaModelElement: T) {
    if (this.languageSettings.getLanguageCodes()) {
      this.languageSettings.getLanguageCodes().forEach(languageCode => {
        if (!metaModelElement.getPreferredName(languageCode) && !metaModelElement.getDescription(languageCode)) {
          metaModelElement.addPreferredName(languageCode, '');
          metaModelElement.addDescription(languageCode, '');
        }
      });
    }
  }

  public updateFields(modelElement: T) {
    this.metaModelElement.metaModelVersion = this.modelService.getLoadedAspectModel().rdfModel.getMetaModelVersion();
    this.metaModelDialogService._updateMetaModelElement(this.metaModelElement);
    this.parentForm.setControl('changedMetaModel', new FormControl(modelElement));
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
