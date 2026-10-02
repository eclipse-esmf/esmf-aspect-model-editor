import {TestBed} from '@angular/core/testing';
import {
  DefaultAspect,
  DefaultCharacteristic,
  DefaultConstraint,
  DefaultEntity,
  DefaultEntityInstance,
  DefaultEvent,
  DefaultOperation,
  DefaultProperty,
  DefaultTrait,
  DefaultUnit,
  DefaultValue,
  PredefinedEntitiesEnum,
} from '@esmf/aspect-model-loader';
import {beforeEach, describe, expect, it} from 'vitest';
import {AbstractEntityModelService} from './abstract-entity-model.service';
import {AbstractPropertyModelService} from './abstract-property-model.service';
import {AspectModelService} from './aspect-model.service';
import {CharacteristicModelService} from './characteristic-model.service';
import {ConstraintModelService} from './constraint-model.service';
import {EntityModelService} from './entity-model.service';
import {EntityValueModelService} from './entity-value-model.service';
import {EventModelService} from './event-model.service';
import {ModelRootService} from './model-root.service';
import {OperationModelService} from './operation-model.service';
import {FileResourceRemoveService, Point3dRemoveService, TimeSeriesEntityRemoveService} from './predefined-elements';
import {PropertyModelService} from './property-model.service';
import {TraitModelService} from './trait-model.service';
import {UnitModelService} from './unit-model.service';
import {ValueModelService} from './value-model.service';

describe('ModelRootService', () => {
  let service: ModelRootService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ModelRootService,
        {provide: AbstractEntityModelService, useValue: {isApplicable: (el: any) => el instanceof DefaultEntity && el.isAbstractEntity()}},
        {provide: AbstractPropertyModelService, useValue: {isApplicable: (el: any) => el instanceof DefaultProperty && el.isAbstract}},
        {provide: AspectModelService, useValue: {isApplicable: (el: any) => el instanceof DefaultAspect}},
        {provide: CharacteristicModelService, useValue: {isApplicable: (el: any) => el instanceof DefaultCharacteristic}},
        {provide: ConstraintModelService, useValue: {isApplicable: (el: any) => el instanceof DefaultConstraint}},
        {provide: EntityModelService, useValue: {isApplicable: (el: any) => el instanceof DefaultEntity}},
        {provide: EntityValueModelService, useValue: {isApplicable: (el: any) => el instanceof DefaultEntityInstance}},
        {provide: EventModelService, useValue: {isApplicable: (el: any) => el instanceof DefaultEvent}},
        {provide: OperationModelService, useValue: {isApplicable: (el: any) => el instanceof DefaultOperation}},
        {provide: PropertyModelService, useValue: {isApplicable: (el: any) => el instanceof DefaultProperty}},
        {provide: TraitModelService, useValue: {isApplicable: (el: any) => el instanceof DefaultTrait}},
        {provide: UnitModelService, useValue: {isApplicable: (el: any) => el instanceof DefaultUnit}},
        {provide: ValueModelService, useValue: {isApplicable: (el: any) => el instanceof DefaultValue}},
        {provide: TimeSeriesEntityRemoveService, useValue: {}},
        {provide: Point3dRemoveService, useValue: {}},
        {provide: FileResourceRemoveService, useValue: {}},
      ],
    });

    service = TestBed.inject(ModelRootService);
  });

  it('should resolve correct element model service', () => {
    const aspect = new DefaultAspect({name: 'A', aspectModelUrn: 'urn:test#A', metaModelVersion: '2.2.0'});
    expect(service.getElementModelService(aspect)).toBeDefined();

    const prop = new DefaultProperty({name: 'P', aspectModelUrn: 'urn:test#P', metaModelVersion: '2.2.0'});
    expect(service.getElementModelService(prop)).toBeDefined();

    const char = new DefaultCharacteristic({name: 'C', aspectModelUrn: 'urn:test#C', metaModelVersion: '2.2.0'});
    expect(service.getElementModelService(char)).toBeDefined();
  });

  it('should identify predefined elements and return their remove service', () => {
    const predefinedEntity = new DefaultEntity({
      name: PredefinedEntitiesEnum.TimeSeriesEntity,
      aspectModelUrn: 'urn:test#TimeSeriesEntity',
      metaModelVersion: '2.2.0',
      isPredefined: true,
    });

    expect(service.isPredefined(predefinedEntity)).toBeTruthy();
    expect(service.getPredefinedService(predefinedEntity)).toBeDefined();
  });

  it('should return null for non-predefined element', () => {
    const customEntity = new DefaultEntity({
      name: 'CustomEntity',
      aspectModelUrn: 'urn:test#CustomEntity',
      metaModelVersion: '2.2.0',
      isPredefined: false,
    });

    expect(service.isPredefined(customEntity)).toBeFalsy();
    expect(service.getPredefinedService(customEntity)).toBeNull();
  });
});
