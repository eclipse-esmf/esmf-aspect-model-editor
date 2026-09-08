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
} from '@esmf/aspect-model-loader';
import {describe, expect, it} from 'vitest';
import {EdgeStyles, ModelStyle, ModelStyleResolver} from './model-style';

describe('ModelStyle', () => {
  it('should define correct style names', () => {
    expect(ModelStyle.ASPECT).toBe('aspect');
    expect(ModelStyle.PROPERTY).toBe('property');
    expect(ModelStyle.ABSTRACT_PROPERTY).toBe('abstractProperty');
    expect(ModelStyle.OPERATION).toBe('operation');
    expect(ModelStyle.CHARACTERISTIC).toBe('characteristic');
    expect(ModelStyle.CONSTRAINT).toBe('constraint');
    expect(ModelStyle.ENTITY).toBe('entity');
    expect(ModelStyle.UNIT).toBe('unit');
    expect(ModelStyle.TRAIT).toBe('trait');
    expect(ModelStyle.ENTITY_INSTANCE).toBe('entityInstance');
    expect(ModelStyle.ABSTRACT_ENTITY).toBe('abstractEntity');
    expect(ModelStyle.EVENT).toBe('event');
    expect(ModelStyle.VALUE).toBe('value');
    expect(ModelStyle.ASPECT_PROP).toBe('aspect_property');
  });

  it('should define edge styles', () => {
    expect(EdgeStyles.entityValueEntityEdge).toBe('entityValueEntityEdge');
    expect(EdgeStyles.optionalPropertyEdge).toBe('optionalPropertyEdge');
    expect(EdgeStyles.abstractPropertyEdge).toBe('abstractPropertyEdge');
    expect(EdgeStyles.abstractElementEdge).toBe('abstractElementEdge');
    expect(EdgeStyles.defaultEdge).toBe('defaultEdge');
  });

  describe('ModelStyleResolver', () => {
    it('should resolve DefaultAspect to ModelStyle.ASPECT', () => {
      const aspect = new DefaultAspect({name: 'TestAspect', aspectModelUrn: 'urn:test#TestAspect', metaModelVersion: '2.1.0'});
      expect(ModelStyleResolver.resolve(aspect)).toBe(ModelStyle.ASPECT);
    });

    it('should resolve concrete DefaultProperty to ModelStyle.PROPERTY', () => {
      const prop = new DefaultProperty({name: 'testProp', aspectModelUrn: 'urn:test#testProp', metaModelVersion: '2.1.0'});
      expect(ModelStyleResolver.resolve(prop)).toBe(ModelStyle.PROPERTY);
    });

    it('should resolve abstract DefaultProperty to ModelStyle.ABSTRACT_PROPERTY', () => {
      const prop = new DefaultProperty({
        name: 'testProp',
        aspectModelUrn: 'urn:test#testProp',
        isAbstract: true,
        metaModelVersion: '2.1.0',
      });
      expect(ModelStyleResolver.resolve(prop)).toBe(ModelStyle.ABSTRACT_PROPERTY);
    });

    it('should resolve DefaultOperation to ModelStyle.OPERATION', () => {
      const op = new DefaultOperation({name: 'testOp', aspectModelUrn: 'urn:test#testOp', input: [], metaModelVersion: '2.1.0'});
      expect(ModelStyleResolver.resolve(op)).toBe(ModelStyle.OPERATION);
    });

    it('should resolve DefaultConstraint to ModelStyle.CONSTRAINT', () => {
      const constraint = new DefaultConstraint({
        name: 'testConstraint',
        aspectModelUrn: 'urn:test#testConstraint',
        metaModelVersion: '2.1.0',
      });
      expect(ModelStyleResolver.resolve(constraint)).toBe(ModelStyle.CONSTRAINT);
    });

    it('should resolve DefaultTrait to ModelStyle.TRAIT', () => {
      const trait = new DefaultTrait({name: 'testTrait', aspectModelUrn: 'urn:test#testTrait', metaModelVersion: '2.1.0'});
      expect(ModelStyleResolver.resolve(trait)).toBe(ModelStyle.TRAIT);
    });

    it('should resolve DefaultCharacteristic to ModelStyle.CHARACTERISTIC', () => {
      const characteristic = new DefaultCharacteristic({name: 'testChar', aspectModelUrn: 'urn:test#testChar', metaModelVersion: '2.1.0'});
      expect(ModelStyleResolver.resolve(characteristic)).toBe(ModelStyle.CHARACTERISTIC);
    });

    it('should resolve concrete DefaultEntity to ModelStyle.ENTITY', () => {
      const entity = new DefaultEntity({name: 'testEntity', aspectModelUrn: 'urn:test#testEntity', metaModelVersion: '2.1.0'});
      expect(ModelStyleResolver.resolve(entity)).toBe(ModelStyle.ENTITY);
    });

    it('should resolve abstract DefaultEntity to ModelStyle.ABSTRACT_ENTITY', () => {
      const entity = new DefaultEntity({
        name: 'testAbstractEntity',
        aspectModelUrn: 'urn:test#testAbstractEntity',
        isAbstract: true,
        metaModelVersion: '2.1.0',
      });
      expect(ModelStyleResolver.resolve(entity)).toBe(ModelStyle.ABSTRACT_ENTITY);
    });

    it('should resolve DefaultUnit to ModelStyle.UNIT', () => {
      const unit = new DefaultUnit({name: 'testUnit', aspectModelUrn: 'urn:test#testUnit', quantityKinds: [], metaModelVersion: '2.1.0'});
      expect(ModelStyleResolver.resolve(unit)).toBe(ModelStyle.UNIT);
    });

    it('should resolve DefaultEntityInstance to ModelStyle.ENTITY_INSTANCE', () => {
      const entity = new DefaultEntity({name: 'testEntity', aspectModelUrn: 'urn:test#testEntity', metaModelVersion: '2.1.0'});
      const entityInstance = new DefaultEntityInstance({
        name: 'testInstance',
        aspectModelUrn: 'urn:test#testInstance',
        type: entity,
        metaModelVersion: '2.1.0',
      });
      expect(ModelStyleResolver.resolve(entityInstance)).toBe(ModelStyle.ENTITY_INSTANCE);
    });

    it('should resolve DefaultEvent to ModelStyle.EVENT', () => {
      const event = new DefaultEvent({name: 'testEvent', aspectModelUrn: 'urn:test#testEvent', metaModelVersion: '2.1.0'});
      expect(ModelStyleResolver.resolve(event)).toBe(ModelStyle.EVENT);
    });

    it('should resolve DefaultValue to ModelStyle.VALUE', () => {
      const value = new DefaultValue({name: 'testVal', aspectModelUrn: 'urn:test#testVal', value: '42', metaModelVersion: '2.1.0'});
      expect(ModelStyleResolver.resolve(value)).toBe(ModelStyle.VALUE);
    });

    it('should return null for unknown element', () => {
      expect(ModelStyleResolver.resolve({} as any)).toBeNull();
    });
  });
});
