import {Graph} from '@maxgraph/core';
import {describe, expect, it} from 'vitest';
import {EdgeStyles} from '../../models';
import {GraphStylesRegistry} from './graph-styles.registry';

describe('GraphStylesRegistry', () => {
  it('should resolve edge styles with arrows', () => {
    const div = document.createElement('div');
    const graph = new Graph(div);
    GraphStylesRegistry.setupStyles(graph);

    const parent = graph.insertVertex(graph.getDefaultParent(), null, 'p', 0, 0, 100, 100);
    const child = graph.insertVertex(graph.getDefaultParent(), null, 'c', 200, 200, 100, 100);

    const defaultEdge = graph.insertEdge(graph.getDefaultParent(), null, null, parent, child, {
      baseStyleNames: [EdgeStyles.defaultEdge],
    });

    const defaultStyle = graph.getCellStyle(defaultEdge);
    expect(defaultStyle.endArrow).toBe('block');
    expect(defaultStyle.shape).toBe('connector');
    expect(defaultStyle.edgeStyle).toBe('orthogonalEdgeStyle');

    const optionalEdge = graph.insertEdge(graph.getDefaultParent(), null, null, parent, child, {
      baseStyleNames: [EdgeStyles.optionalPropertyEdge],
    });
    const optionalStyle = graph.getCellStyle(optionalEdge);
    expect(optionalStyle.endArrow).toBe('block');
    expect(optionalStyle.dashed).toBe(true);

    const abstractEdge = graph.insertEdge(graph.getDefaultParent(), null, null, parent, child, {
      baseStyleNames: [EdgeStyles.abstractElementEdge],
    });
    const abstractStyle = graph.getCellStyle(abstractEdge);
    expect(abstractStyle.endArrow).toBe('block');
  });
});
