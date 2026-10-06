import {describe, expect, it} from 'vitest';
import {ModelInfo} from './model-info';

describe('ModelInfo', () => {
  it('should define all expected enum values', () => {
    expect(ModelInfo.IS_OPERATION_INPUT).toBe(0);
    expect(ModelInfo.IS_OPERATION_OUTPUT).toBe(1);
    expect(ModelInfo.IS_CHARACTERISTIC).toBe(2);
    expect(ModelInfo.IS_CHARACTERISTIC_DATATYPE).toBe(3);
    expect(ModelInfo.IS_EITHER_LEFT).toBe(4);
    expect(ModelInfo.IS_EITHER_RIGHT).toBe(5);
  });
});
