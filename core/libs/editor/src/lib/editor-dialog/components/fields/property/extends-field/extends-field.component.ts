import {NamespacesCacheService} from '@ame/cache';
import {DefaultProperty, DefaultAbstractProperty, CanExtend} from '@ame/meta-model';
import {MxGraphService} from '@ame/mx-graph';
import {RdfService} from '@ame/rdf/services';
import {NotificationsService, SearchService} from '@ame/shared';
import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormControl} from '@angular/forms';
import {combineLatest, map, Observable, of} from 'rxjs';
import {EditorModelService} from '../../../../editor-model.service';
import {EditorDialogValidators} from '../../../../validators';
import {InputFieldComponent} from '../../input-field.component';

@Component({
  selector: 'ame-property-extends-field',
  templateUrl: './extends-field.component.html',
  styleUrls: ['./extends-field.component.scss'],
})
export class PropertyExtendsFieldComponent extends InputFieldComponent<DefaultProperty> implements OnInit, OnDestroy {
  public filteredAbstractProperties$: Observable<any[]>;

  public extendsValueControl: FormControl;
  public extendsControl: FormControl;

  constructor(
    private notificationsService: NotificationsService,
    public metaModelDialogService: EditorModelService,
    public namespacesCacheService: NamespacesCacheService,
    public rdfService: RdfService,
    public searchService?: SearchService,
    public mxGraphService?: MxGraphService
  ) {
    super(metaModelDialogService, namespacesCacheService, searchService, mxGraphService);
    this.fieldName = 'extends';
  }

  ngOnInit(): void {
    this.subscription = this.getMetaModelData().subscribe(() => this.setExtendsControl());
  }

  ngOnDestroy() {
    super.ngOnDestroy();
    this.parentForm.removeControl('extendsValue');
    this.parentForm.removeControl('extends');
  }

  getCurrentValue() {
    return this.previousData?.[this.fieldName] || this.metaModelElement?.extendedElement || null;
  }

  setExtendsControl() {
    const extendsElement = this.getCurrentValue();
    const value = extendsElement?.name || '';

    this.parentForm.setControl(
      'extendsValue',
      new FormControl(
        {
          value,
          disabled: !!value || this.metaModelElement.isExternalReference(),
        },
        {
          validators: [
            EditorDialogValidators.duplicateNameWithDifferentType(
              this.namespacesCacheService,
              this.metaModelElement,
              this.rdfService.externalRdfModels,
              DefaultAbstractProperty
            ),
            EditorDialogValidators.duplicateNameWithDifferentType(
              this.namespacesCacheService,
              this.metaModelElement,
              this.rdfService.externalRdfModels,
              DefaultProperty
            ),
          ],
        }
      )
    );

    this.parentForm.setControl(
      'extends',
      new FormControl({
        value: extendsElement,
        disabled: this.metaModelElement?.isExternalReference(),
      })
    );

    this.extendsValueControl = this.parentForm.get('extendsValue') as FormControl;
    this.extendsControl = this.parentForm.get('extends') as FormControl;

    this.filteredAbstractProperties$ = combineLatest([
      this.metaModelElement instanceof DefaultProperty ? this.initFilteredPropertyTypes(this.extendsValueControl) : of([]),
      this.initFilteredAbstractPropertyTypes(this.extendsValueControl),
    ]).pipe(
      map(([a, b]) => [...a, ...b].filter(e => e.name !== this.metaModelElement.name && !this.isRecursive(this.getElementFromCache(e))))
    );
  }

  onSelectionChange(newValue: any) {
    if (newValue === null) {
      return; // happens on reset form
    }

    const foundProperty: any = this.getElementFromCache(newValue);
    this.parentForm.setControl('extends', new FormControl(foundProperty));

    this.extendsValueControl.patchValue(newValue.name);
    this.extendsControl.setValue(foundProperty);
    this.extendsValueControl.disable();
  }

  createNewAbstractProperty(propertyName: string) {
    if (!this.isLowerCase(propertyName)) {
      return;
    }

    const urn = `${this.metaModelElement.aspectModelUrn.split('#')?.[0]}#${propertyName}`;

    if (this.metaModelElement.aspectModelUrn === urn || this.parentForm.get('name').value === propertyName) {
      this.notificationsService.error('Element left cannot link itself');
      this.extendsValueControl.setValue('');
      return;
    }

    const newAbstractProperty = new DefaultAbstractProperty(this.metaModelElement.metaModelVersion, urn, propertyName, null);
    this.parentForm.setControl('extends', new FormControl(newAbstractProperty));

    this.extendsValueControl.patchValue(propertyName);
    this.extendsControl.setValue(newAbstractProperty);
    this.extendsValueControl.disable();
  }

  unlockExtends() {
    this.extendsValueControl.enable();
    this.extendsValueControl.patchValue('');
    this.extendsControl.patchValue(null);
    this.extendsControl.markAllAsTouched();
  }

  private isRecursive(foundProperty: CanExtend) {
    if (!foundProperty) {
      return false;
    }

    return this.metaModelElement.aspectModelUrn === foundProperty.aspectModelUrn || this.isRecursive(foundProperty.extendedElement);
  }

  private getElementFromCache(newValue: any) {
    let foundProperty: any = this.currentCachedFile
      .getCachedAbstractProperties()
      .find(abstractProperty => abstractProperty.aspectModelUrn === newValue.urn);

    if (!foundProperty) {
      foundProperty = this.currentCachedFile.getCachedProperties().find(property => property.aspectModelUrn === newValue.urn);
    }

    if (!foundProperty) {
      foundProperty = this.namespacesCacheService.findElementOnExtReference<DefaultProperty>(newValue.urn);
    }

    return foundProperty;
  }
}
