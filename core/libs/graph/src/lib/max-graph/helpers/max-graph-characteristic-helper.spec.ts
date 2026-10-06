import {DefaultEntity, DefaultEntityInstance} from '@esmf/aspect-model-loader';
import {Cell} from '@maxgraph/core';
import {describe, expect, it} from 'vitest';
import {MaxGraphCharacteristicHelper} from './max-graph-characteristic-helper';

describe('MaxGraphCharacteristicHelper', () => {
  describe('findObsoleteEntityValues', () => {
    it('should find obsolete entity value cells when edges <= 2', () => {
      const entityValueCell = {
        style: {fillColor: 'entityValue'},
        edges: [{}, {}],
      } as unknown as Cell;

      const edge = {
        source: {
          edges: [
            {
              target: entityValueCell,
            },
          ],
        },
      } as unknown as Cell;

      const result = MaxGraphCharacteristicHelper.findObsoleteEntityValues(edge);
      expect(result).toHaveLength(1);
      expect(result[0]).toBe(entityValueCell);
    });

    it('should push edge instead of cell when entity value has more than 2 edges', () => {
      const entityValueCell = {
        style: {fillColor: 'entityValue'},
        edges: [{}, {}, {}],
      } as unknown as Cell;

      const enumerationEntityValueEdge = {
        target: entityValueCell,
      } as unknown as Cell;

      const edge = {
        source: {
          edges: [enumerationEntityValueEdge],
        },
      } as unknown as Cell;

      const result = MaxGraphCharacteristicHelper.findObsoleteEntityValues(edge);
      expect(result).toHaveLength(1);
      expect(result[0]).toBe(enumerationEntityValueEdge);
    });

    it('should filter out non entityValue edges', () => {
      const otherCell = {
        style: {fillColor: 'entity'},
        edges: [{}],
      } as unknown as Cell;

      const edge = {
        source: {
          edges: [
            {
              target: otherCell,
            },
          ],
        },
      } as unknown as Cell;

      const result = MaxGraphCharacteristicHelper.findObsoleteEntityValues(edge);
      expect(result).toHaveLength(0);
    });
  });

  describe('getChildEntityValuesToDelete', () => {
    it('should recursively find child entity values', () => {
      const entity = new DefaultEntity({name: 'TestEntity', aspectModelUrn: 'urn:test#TestEntity', metaModelVersion: '2.1.0'});
      const childValue = new DefaultEntityInstance({
        name: 'ChildVal',
        aspectModelUrn: 'urn:test#ChildVal',
        type: entity,
        metaModelVersion: '2.1.0',
      });
      const parentValue = new DefaultEntityInstance({
        name: 'ParentVal',
        aspectModelUrn: 'urn:test#ParentVal',
        type: entity,
        metaModelVersion: '2.1.0',
      });

      parentValue.setAssertion('urn:test#prop', childValue);

      const notInclude: DefaultEntityInstance[] = [];
      const result = MaxGraphCharacteristicHelper.getChildEntityValuesToDelete(parentValue, notInclude);

      expect(result).toContain(childValue);
      expect(notInclude).toContain(childValue);
    });

    it('should skip entity values already in notInclude array', () => {
      const entity = new DefaultEntity({name: 'TestEntity', aspectModelUrn: 'urn:test#TestEntity', metaModelVersion: '2.1.0'});
      const childValue = new DefaultEntityInstance({
        name: 'ChildVal',
        aspectModelUrn: 'urn:test#ChildVal',
        type: entity,
        metaModelVersion: '2.1.0',
      });
      const parentValue = new DefaultEntityInstance({
        name: 'ParentVal',
        aspectModelUrn: 'urn:test#ParentVal',
        type: entity,
        metaModelVersion: '2.1.0',
      });

      parentValue.setAssertion('urn:test#prop', childValue);

      const notInclude: DefaultEntityInstance[] = [childValue];
      const result = MaxGraphCharacteristicHelper.getChildEntityValuesToDelete(parentValue, notInclude);

      expect(result).toHaveLength(0);
    });
  });
});
