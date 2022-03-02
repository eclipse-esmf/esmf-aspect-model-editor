import {mxgraph} from 'mxgraph-factory';

export interface RendererUpdatePayload {
  cell: mxgraph.mxCell;
  form?: {[key: string]: any};
  callback?: Function;
}
