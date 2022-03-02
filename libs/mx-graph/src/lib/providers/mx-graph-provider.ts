import {mxgraphFactory} from 'mxgraph-factory';

export const {
  mxGraph,
  mxUtils,
  mxEvent,
  mxEditor,
  mxConstants,
  mxStackLayout,
  mxCompactTreeLayout,
  mxHierarchicalLayout,
  mxLayoutManager,
  mxCell,
  mxGeometry,
  mxPoint,
  mxOutline,
  mxCodec,
  mxCellOverlay,
  mxImage,
  mxRectangle,
} = mxgraphFactory({
  mxImageBasePath: 'assets/mxgraph/images',
  mxBasePath: 'assets/mxgraph',
  mxLoadResources: false,
  mxLoadStylesheets: false,
  mxResourceExtension: '.properties',
});
