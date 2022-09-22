import {mxgraph} from 'mxgraph-factory';
import {BaseMetaModelElement} from '../../aspect-meta-model';

export interface PredefinedRemove {
  delete(cell: mxgraph.mxCell): boolean;
  decouple(edge: mxgraph.mxCell, source: BaseMetaModelElement): boolean;
}
