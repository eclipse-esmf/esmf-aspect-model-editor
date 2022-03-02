import {DefaultEntityValue} from '../aspect-meta-model';
import {mxgraph} from 'mxgraph-factory';

export interface SearchResult {
  cell?: mxgraph.mxCell;
  entityValue?: DefaultEntityValue;
  namespacePrefix?: string;
}
