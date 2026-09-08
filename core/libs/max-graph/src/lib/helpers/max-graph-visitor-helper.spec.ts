import {SammLanguageSettingsService} from '@ame/settings-dialog';
import {
  DefaultAspect,
  DefaultCharacteristic,
  DefaultConstraint,
  DefaultEncodingConstraint,
  DefaultEntity,
  DefaultEnumeration,
  DefaultEvent,
  DefaultFixedPointConstraint,
  DefaultLanguageConstraint,
  DefaultLengthConstraint,
  DefaultLocaleConstraint,
  DefaultOperation,
  DefaultProperty,
  DefaultQuantityKind,
  DefaultRangeConstraint,
  DefaultRegularExpressionConstraint,
  DefaultScalar,
  DefaultState,
  DefaultStructuredValue,
  DefaultUnit,
  DefaultValue,
} from '@esmf/aspect-model-loader';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {MaxGraphVisitorHelper} from './max-graph-visitor-helper';

describe('MaxGraphVisitorHelper', () => {
  let sammLangService: SammLanguageSettingsService;

  beforeEach(() => {
    sammLangService = {
      addSammLanguageCode: vi.fn(),
      setSammLanguageCodes: vi.fn(),
    } as unknown as SammLanguageSettingsService;
  });

  describe('addDataType', () => {
    it('should return null when dataType is not present', () => {
      const char = new DefaultCharacteristic({name: 'test', aspectModelUrn: 'urn:test#test', metaModelVersion: '2.1.0'});
      expect(MaxGraphVisitorHelper.addDataType(char)).toBeNull();
    });

    it('should return label for valid dataType', () => {
      const char = new DefaultCharacteristic({
        name: 'test',
        aspectModelUrn: 'urn:test#test',
        dataType: new DefaultScalar({urn: 'http://www.w3.org/2001/XMLSchema#string', metaModelVersion: '2.1.0'}),
        metaModelVersion: '2.1.0',
      });
      const result = MaxGraphVisitorHelper.addDataType(char);
      expect(result).toBeDefined();
      expect(result.key).toBe('dataType');
      expect(result.label).toContain('string');
    });
  });

  describe('addValues', () => {
    it('should return null for non-enumeration', () => {
      const char = new DefaultCharacteristic({name: 'test', aspectModelUrn: 'urn:test#test', metaModelVersion: '2.1.0'});
      expect(MaxGraphVisitorHelper.addValues(char)).toBeNull();
    });

    it('should return shape attribute for enumeration with scalar values', () => {
      const enumeration = new DefaultEnumeration({
        name: 'testEnum',
        aspectModelUrn: 'urn:test#testEnum',
        values: ['VAL1', 'VAL2'] as any,
        metaModelVersion: '2.1.0',
      });
      const result = MaxGraphVisitorHelper.addValues(enumeration);
      expect(result).toBeDefined();
      expect(result.key).toBe('values');
    });
  });

  describe('addDefaultValue', () => {
    it('should return null if not DefaultState or no defaultValue', () => {
      const char = new DefaultCharacteristic({name: 'test', aspectModelUrn: 'urn:test#test', metaModelVersion: '2.1.0'});
      expect(MaxGraphVisitorHelper.addDefaultValue(char)).toBeNull();
    });

    it('should return label for DefaultState with defaultValue', () => {
      const val = new DefaultValue({name: 'val', aspectModelUrn: 'urn:test#val', value: 'ACTIVE', metaModelVersion: '2.1.0'});
      const state = new DefaultState({
        name: 'testState',
        aspectModelUrn: 'urn:test#testState',
        values: [val],
        defaultValue: val,
        metaModelVersion: '2.1.0',
      });
      const result = MaxGraphVisitorHelper.addDefaultValue(state);
      expect(result).toBeDefined();
      expect(result.key).toBe('defaultValue');
      expect(result.label).toContain('ACTIVE');
    });
  });

  describe('addLocalizedDescriptions & addLocalizedPreferredNames', () => {
    it('should extract descriptions with language tags', () => {
      const prop = new DefaultProperty({
        name: 'testProp',
        aspectModelUrn: 'urn:test#testProp',
        descriptions: new Map([['en', 'Test English description']]),
        metaModelVersion: '2.1.0',
      });
      const results = MaxGraphVisitorHelper.addLocalizedDescriptions(prop, sammLangService);
      expect(results).toHaveLength(1);
      expect(results[0].key).toBe('description');
      expect(results[0].lang).toBe('en');
      expect(results[0].label).toContain('Test English description');
    });

    it('should extract preferredNames with language tags', () => {
      const prop = new DefaultProperty({
        name: 'testProp',
        aspectModelUrn: 'urn:test#testProp',
        preferredNames: new Map([['en', 'Test Name']]),
        metaModelVersion: '2.1.0',
      });
      const results = MaxGraphVisitorHelper.addLocalizedPreferredNames(prop, sammLangService);
      expect(results).toHaveLength(1);
      expect(results[0].key).toBe('preferredName');
      expect(results[0].lang).toBe('en');
      expect(results[0].label).toContain('Test Name');
    });
  });

  describe('addExtends', () => {
    it('should return null when element does not extend anything', () => {
      const entity = new DefaultEntity({name: 'testEntity', aspectModelUrn: 'urn:test#testEntity', metaModelVersion: '2.1.0'});
      expect(MaxGraphVisitorHelper.addExtends(entity)).toBeNull();
    });

    it('should return extends attribute when element has extends_', () => {
      const parentEntity = new DefaultEntity({name: 'ParentEntity', aspectModelUrn: 'urn:test#ParentEntity', metaModelVersion: '2.1.0'});
      const entity = new DefaultEntity({
        name: 'ChildEntity',
        aspectModelUrn: 'urn:test#ChildEntity',
        extends_: parentEntity,
        metaModelVersion: '2.1.0',
      });
      const result = MaxGraphVisitorHelper.addExtends(entity);
      expect(result).toBeDefined();
      expect(result.label).toBe('extends = ParentEntity');
    });
  });

  describe('addValue', () => {
    it('should return value for DefaultEncodingConstraint', () => {
      const constraint = new DefaultEncodingConstraint({
        name: 'enc',
        aspectModelUrn: 'urn:test#enc',
        value: 'UTF-8',
        metaModelVersion: '2.1.0',
      });
      const result = MaxGraphVisitorHelper.addValue(constraint);
      expect(result).toBeDefined();
      expect(result.label).toContain('UTF-8');
    });

    it('should return value for DefaultRegularExpressionConstraint', () => {
      const constraint = new DefaultRegularExpressionConstraint({
        name: 'regex',
        aspectModelUrn: 'urn:test#regex',
        value: '^[a-z]+$',
        metaModelVersion: '2.1.0',
      });
      const result = MaxGraphVisitorHelper.addValue(constraint);
      expect(result).toBeDefined();
      expect(result.label).toContain('^[a-z]+$');
    });

    it('should return value for DefaultValue', () => {
      const val = new DefaultValue({
        name: 'val',
        aspectModelUrn: 'urn:test#val',
        value: '123',
        metaModelVersion: '2.1.0',
      });
      const result = MaxGraphVisitorHelper.addValue(val);
      expect(result).toBeDefined();
      expect(result.label).toBe('value = "123"');
    });
  });

  describe('addSee', () => {
    it('should return null if no see references', () => {
      const aspect = new DefaultAspect({name: 'TestAspect', aspectModelUrn: 'urn:test#TestAspect', metaModelVersion: '2.1.0'});
      expect(MaxGraphVisitorHelper.addSee(aspect)).toBeNull();
    });

    it('should return formatted see attribute', () => {
      const aspect = new DefaultAspect({
        name: 'TestAspect',
        aspectModelUrn: 'urn:test#TestAspect',
        see: ['urn:samm:org.eclipse.esmf#Documentation'],
        metaModelVersion: '2.1.0',
      });
      const result = MaxGraphVisitorHelper.addSee(aspect);
      expect(result).toBeDefined();
      expect(result.label).toBe('see = Documentation');
    });
  });

  describe('addMinValue & addMaxValue & addBoundDefinition', () => {
    it('should return min and max value for LengthConstraint', () => {
      const constraint = new DefaultLengthConstraint({
        name: 'len',
        aspectModelUrn: 'urn:test#len',
        minValue: 1,
        maxValue: 10,
        metaModelVersion: '2.1.0',
      });
      expect(MaxGraphVisitorHelper.addMinValue(constraint)).toEqual({label: 'minValue = 1', key: 'minValue'});
      expect(MaxGraphVisitorHelper.addMaxValue(constraint)).toEqual({label: 'maxValue = 10', key: 'maxValue'});
    });

    it('should return bound definitions for RangeConstraint', () => {
      const constraint = new DefaultRangeConstraint({
        name: 'range',
        aspectModelUrn: 'urn:test#range',
        lowerBoundDefinition: 'AT_LEAST' as any,
        upperBoundDefinition: 'LESS_THAN' as any,
        metaModelVersion: '2.1.0',
      });
      const bounds = MaxGraphVisitorHelper.addBoundDefinition(constraint);
      expect(bounds).toHaveLength(2);
      expect(bounds[0].key).toBe('upperBoundDefinition');
      expect(bounds[1].key).toBe('lowerBoundDefinition');
    });
  });

  describe('constraint helpers', () => {
    it('should handle LanguageConstraint', () => {
      const constraint = new DefaultLanguageConstraint({
        name: 'lang',
        aspectModelUrn: 'urn:test#lang',
        languageCode: 'de',
        metaModelVersion: '2.1.0',
      });
      expect(MaxGraphVisitorHelper.addLanguageCode(constraint)).toEqual({
        label: 'languageCode = de',
        key: 'languageCode',
      });
    });

    it('should handle FixedPointConstraint scale and integer', () => {
      const constraint = new DefaultFixedPointConstraint({
        name: 'fixed',
        aspectModelUrn: 'urn:test#fixed',
        scale: 2,
        integer: 5,
        metaModelVersion: '2.1.0',
      });
      expect(MaxGraphVisitorHelper.addScale(constraint)).toEqual({label: 'scale = 2', key: 'scale'});
      expect(MaxGraphVisitorHelper.addInteger(constraint)).toEqual({label: 'integer = 5', key: 'integer'});
    });

    it('should handle LocaleConstraint', () => {
      const constraint = new DefaultLocaleConstraint({
        name: 'loc',
        aspectModelUrn: 'urn:test#loc',
        localeCode: 'en-US',
        metaModelVersion: '2.1.0',
      });
      expect(MaxGraphVisitorHelper.addLocaleCode(constraint)).toEqual({
        label: 'localeCode = en-US',
        key: 'localeCode',
      });
    });
  });

  describe('unit helpers', () => {
    it('should extract conversion factor, symbol, code, referenceUnit', () => {
      const refUnit = new DefaultUnit({name: 'meter', aspectModelUrn: 'urn:test#meter', quantityKinds: [], metaModelVersion: '2.1.0'});
      const unit = new DefaultUnit({
        name: 'kilometer',
        aspectModelUrn: 'urn:test#kilometer',
        conversionFactor: '1000',
        symbol: 'km',
        code: 'KMT',
        referenceUnit: refUnit,
        quantityKinds: [
          new DefaultQuantityKind({name: 'Length', aspectModelUrn: 'urn:test#Length', label: 'Length', metaModelVersion: '2.1.0'}),
        ],
        metaModelVersion: '2.1.0',
      });

      expect(MaxGraphVisitorHelper.addConversionFactor(unit)).toEqual({label: 'conversionFactor = 1000', key: 'conversionFactor'});
      expect(MaxGraphVisitorHelper.addSymbol(unit)).toEqual({label: 'symbol = km', key: 'symbol'});
      expect(MaxGraphVisitorHelper.addCode(unit)).toEqual({label: 'code = KMT', key: 'code'});
      expect(MaxGraphVisitorHelper.addReferenceUnit(unit)).toEqual({label: 'referenceUnit = meter', key: 'referenceUnit'});
      expect(MaxGraphVisitorHelper.addQuantityKinds(unit.quantityKinds)).toEqual({label: 'quantityKinds = Length', key: 'quantityKinds'});
    });
  });

  describe('aspect and property helpers', () => {
    it('should extract isCollectionAspect', () => {
      const aspect = new DefaultAspect({
        name: 'TestAspect',
        aspectModelUrn: 'urn:test#TestAspect',
        isCollectionAspect: true,
        metaModelVersion: '2.1.0',
      });
      expect(MaxGraphVisitorHelper.addIsCollectionAspect(aspect)).toEqual({
        label: 'isCollectionAspect = true',
        key: 'isCollectionAspect',
      });
    });

    it('should extract exampleValue', () => {
      const prop = new DefaultProperty({
        name: 'testProp',
        aspectModelUrn: 'urn:test#testProp',
        exampleValue: {value: '100'} as any,
        metaModelVersion: '2.1.0',
      });
      expect(MaxGraphVisitorHelper.addExampleValue(prop)).toEqual({
        label: 'exampleValue = 100',
        key: 'exampleValue',
      });
    });
  });

  describe('structured value helpers', () => {
    it('should extract deconstructionRule and elements', () => {
      const sv = new DefaultStructuredValue({
        name: 'sv',
        aspectModelUrn: 'urn:test#sv',
        deconstructionRule: '([A-Z]+)',
        elements: ['part1', 'part2'],
        metaModelVersion: '2.1.0',
      });
      expect(MaxGraphVisitorHelper.addDeconstructionRule(sv)).toEqual({
        label: 'deconstructionRule = ([A-Z]+)',
        key: 'deconstructionRule',
      });
      expect(MaxGraphVisitorHelper.addElements(sv)).toEqual({
        label: 'elements = part1 part2',
        key: 'elements',
      });
    });
  });

  describe('getElementProperties for all elements', () => {
    it('should route DefaultAspect', () => {
      const aspect = new DefaultAspect({name: 'A', aspectModelUrn: 'urn:test#A', metaModelVersion: '2.1.0'});
      const props = MaxGraphVisitorHelper.getElementProperties(aspect, sammLangService);
      expect(Array.isArray(props)).toBe(true);
    });

    it('should route DefaultOperation', () => {
      const op = new DefaultOperation({name: 'Op', aspectModelUrn: 'urn:test#Op', input: [], metaModelVersion: '2.1.0'});
      const props = MaxGraphVisitorHelper.getElementProperties(op, sammLangService);
      expect(Array.isArray(props)).toBe(true);
    });

    it('should route DefaultEntity', () => {
      const entity = new DefaultEntity({name: 'E', aspectModelUrn: 'urn:test#E', metaModelVersion: '2.1.0'});
      const props = MaxGraphVisitorHelper.getElementProperties(entity, sammLangService);
      expect(Array.isArray(props)).toBe(true);
    });

    it('should route DefaultUnit', () => {
      const unit = new DefaultUnit({name: 'U', aspectModelUrn: 'urn:test#U', quantityKinds: [], metaModelVersion: '2.1.0'});
      const props = MaxGraphVisitorHelper.getElementProperties(unit, sammLangService);
      expect(Array.isArray(props)).toBe(true);
    });

    it('should route DefaultProperty', () => {
      const prop = new DefaultProperty({name: 'P', aspectModelUrn: 'urn:test#P', metaModelVersion: '2.1.0'});
      const props = MaxGraphVisitorHelper.getElementProperties(prop, sammLangService);
      expect(Array.isArray(props)).toBe(true);
    });

    it('should route DefaultCharacteristic', () => {
      const char = new DefaultCharacteristic({name: 'C', aspectModelUrn: 'urn:test#C', metaModelVersion: '2.1.0'});
      const props = MaxGraphVisitorHelper.getElementProperties(char, sammLangService);
      expect(Array.isArray(props)).toBe(true);
    });

    it('should route DefaultConstraint', () => {
      const constraint = new DefaultConstraint({name: 'Cn', aspectModelUrn: 'urn:test#Cn', metaModelVersion: '2.1.0'});
      const props = MaxGraphVisitorHelper.getElementProperties(constraint, sammLangService);
      expect(Array.isArray(props)).toBe(true);
    });

    it('should route DefaultEvent', () => {
      const event = new DefaultEvent({name: 'Ev', aspectModelUrn: 'urn:test#Ev', metaModelVersion: '2.1.0'});
      const props = MaxGraphVisitorHelper.getElementProperties(event, sammLangService);
      expect(Array.isArray(props)).toBe(true);
    });

    it('should route DefaultValue', () => {
      const val = new DefaultValue({name: 'V', aspectModelUrn: 'urn:test#V', value: 'hello', metaModelVersion: '2.1.0'});
      const props = MaxGraphVisitorHelper.getElementProperties(val, sammLangService);
      expect(Array.isArray(props)).toBe(true);
    });

    it('should return null for unknown element', () => {
      expect(MaxGraphVisitorHelper.getElementProperties({} as any, sammLangService)).toBeNull();
    });
  });
});
