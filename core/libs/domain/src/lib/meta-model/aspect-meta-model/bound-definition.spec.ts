import {describe, expect, it} from 'vitest';
import {BoundDefinition} from './bound-definition';

describe('BoundDefinition', () => {
  it('should define all bound definition constants', () => {
    expect(BoundDefinition.OPEN).toBe('OPEN');
    expect(BoundDefinition.AT_LEAST).toBe('AT_LEAST');
    expect(BoundDefinition.GREATER_THAN).toBe('GREATER_THAN');
    expect(BoundDefinition.LESS_THAN).toBe('LESS_THAN');
    expect(BoundDefinition.AT_MOST).toBe('AT_MOST');
  });
});
