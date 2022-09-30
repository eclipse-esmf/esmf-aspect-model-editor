import {NamespacesCacheService} from '@ame/cache';
import {MetaModelElementInstantiator, PredefinedEntityInstantiator} from '@ame/instantiator';
import {DefaultAbstractEntity, DefaultEntity} from '@ame/meta-model';
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
  selector: 'ame-entity-extends-field',
  templateUrl: './extends-field.component.html',
  styleUrls: ['./extends-field.component.scss'],
})
export class EntityExtendsFieldComponent extends InputFieldComponent<DefaultEntity> implements OnInit, OnDestroy {
  public filteredAbstractEntities$: Observable<any[]>;
  public filteredEntities$: Observable<any[]>;

  public extendsValueControl: FormControl;
  public extendsControl: FormControl;
  public predefinedEntities: {
    name: string;
    entity: DefaultAbstractEntity;
    urn: string;
    description: string;
    complex: boolean;
    namespace?: string;
  }[];

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
    const predefinedEntities = new PredefinedEntityInstantiator(new MetaModelElementInstantiator(this.rdfService.currentRdfModel, null))
      .entityInstances;
    this.predefinedEntities = Object.values(predefinedEntities)
      .map(value => {
        const entity = value();

        return {
          name: entity.name,
          description: entity.getDescription('en') || '',
          urn: entity.getUrn(),
          complex: false,
          entity,
        };
      })
      .filter(({entity}) => (this.metaModelElement instanceof DefaultAbstractEntity ? entity instanceof DefaultAbstractEntity : true))
      .sort(({name: a}, {name: b}) => (a > b ? 1 : -1));
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
          disabled: !!value || this.metaModelElement.isExternalReference() || this.metaModelElement.isPredefined(),
        },
        {
          validators: [
            EditorDialogValidators.duplicateNameWithDifferentType(
              this.namespacesCacheService,
              this.metaModelElement,
              this.rdfService.externalRdfModels,
              DefaultAbstractEntity
            ),
            EditorDialogValidators.duplicateNameWithDifferentType(
              this.namespacesCacheService,
              this.metaModelElement,
              this.rdfService.externalRdfModels,
              DefaultEntity
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

    this.filteredAbstractEntities$ = combineLatest([
      this.metaModelElement instanceof DefaultEntity ? this.initFilteredEntities(this.extendsValueControl) : of([]),
      this.initFilteredAbstractEntities(this.extendsValueControl),
    ]).pipe(map(([a, b]) => [...a, ...b].filter(e => e.name !== this.metaModelElement.name)));

    this.filteredEntities$ = this.initFilteredEntities(this.extendsValueControl);
  }

  onSelectionChange(newValue: any) {
    if (newValue === null) {
      return; // happens on reset form
    }

    let foundEntity: DefaultEntity | DefaultAbstractEntity = this.currentCachedFile
      .getCachedAbstractEntities()
      .find(entity => entity.aspectModelUrn === newValue.urn);

    if (!foundEntity) {
      foundEntity = this.currentCachedFile.getCachedEntities().find(entity => entity.aspectModelUrn === newValue.urn) as DefaultEntity;
    }

    if (!foundEntity) {
      foundEntity = this.namespacesCacheService.findElementOnExtReference<DefaultEntity>(newValue.urn);
    }

    if (!foundEntity) {
      foundEntity = newValue.entity;
    }

    this.parentForm.setControl('extends', new FormControl(foundEntity));

    this.extendsValueControl.patchValue(newValue.name);
    this.extendsControl.setValue(foundEntity);
    this.extendsValueControl.disable();
  }

  createNewAbstractEntity(entityName: string) {
    if (!this.isUpperCase(entityName)) {
      return;
    }

    const urn = `${this.metaModelElement.aspectModelUrn.split('#')?.[0]}#${entityName}`;

    if (this.metaModelElement.aspectModelUrn === urn || this.parentForm.get('name').value === entityName) {
      this.notificationsService.error({title: 'Element left cannot link itself'});
      this.extendsValueControl.setValue('');
      return;
    }

    const newAbstractEntity = new DefaultAbstractEntity(this.metaModelElement.metaModelVersion, urn, entityName, []);
    this.parentForm.setControl('extends', new FormControl(newAbstractEntity));

    this.extendsValueControl.patchValue(entityName);
    this.extendsControl.setValue(newAbstractEntity);
    this.extendsValueControl.disable();
  }

  createEntity(entityName: string) {
    if (!this.isUpperCase(entityName)) {
      return;
    }

    const urn = `${this.metaModelElement.aspectModelUrn.split('#')?.[0]}#${entityName}`;

    if (this.metaModelElement.aspectModelUrn === urn || this.parentForm.get('name').value === entityName) {
      this.notificationsService.error({title: 'Element left cannot link itself'});
      this.extendsValueControl.setValue('');
      return;
    }

    const newAbstractEntity = new DefaultEntity(this.metaModelElement.metaModelVersion, urn, entityName, []);
    this.parentForm.setControl('extends', new FormControl(newAbstractEntity));

    this.extendsValueControl.patchValue(entityName);
    this.extendsControl.setValue(newAbstractEntity);
    this.extendsValueControl.disable();
  }

  unlockExtends() {
    this.extendsValueControl.enable();
    this.extendsValueControl.patchValue('');
    this.extendsControl.patchValue(null);
    this.extendsControl.markAllAsTouched();
  }
}
