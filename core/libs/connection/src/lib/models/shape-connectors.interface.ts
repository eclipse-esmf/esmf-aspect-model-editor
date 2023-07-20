import {ModelInfo} from '@ame/mx-graph';
import {mxgraph} from 'mxgraph-factory';

import mxCell = mxgraph.mxCell;

export interface SingleShapeConnector<T> {
  connect(metaModel: T, source: mxCell, modelInfo?: ModelInfo): void;
}

export interface MultiShapeConnector<T, R> {
  connect(parentMetaModel: T, childMetaModel: R, parent: mxCell, child: mxCell): void;
}

export interface MultiShapeConnectorWithProperty<T, R> {
  connect(parentMetaModel: T, childMetaModel: R, parent: mxCell, child: mxCell, property: string): void;
}
