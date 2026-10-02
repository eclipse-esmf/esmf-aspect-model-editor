import {DefaultAspect, DefaultProperty} from '@esmf/aspect-model-loader';
import {describe, expect, it} from 'vitest';
import {ModelRelationArray} from './base';

describe('ModelRelationArray', () => {
  it('should push unique items and ignore duplicates based on aspectModelUrn', () => {
    const list = new ModelRelationArray<DefaultAspect | DefaultProperty>();
    const aspect1 = new DefaultAspect({name: 'Aspect1', aspectModelUrn: 'urn:test#Aspect1', metaModelVersion: '2.2.0'});
    const aspect2 = new DefaultAspect({name: 'Aspect2', aspectModelUrn: 'urn:test#Aspect2', metaModelVersion: '2.2.0'});
    const aspect1Duplicate = new DefaultAspect({name: 'Aspect1', aspectModelUrn: 'urn:test#Aspect1', metaModelVersion: '2.2.0'});

    const count1 = list.push(aspect1, aspect2);
    expect(count1).toBe(2);
    expect(list.length).toBe(2);

    const count2 = list.push(aspect1Duplicate);
    expect(count2).toBe(0);
    expect(list.length).toBe(2);
  });

  it('should skip null or undefined items safely', () => {
    const list = new ModelRelationArray<DefaultAspect>();
    const count = list.push(null as any, undefined as any);
    expect(count).toBe(0);
    expect(list.length).toBe(0);
  });
});
