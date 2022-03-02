import {Base, DefaultAspect, DefaultEntity, OverWrittenPropertyKeys} from '@bame/meta-model';
import {LanguageSettingsService} from '@bame/settings-dialog';
import {mxgraph} from 'mxgraph-factory';
import {MxGraphHelper, MxGraphVisitorHelper} from '../../helpers';
import {MxGraphService} from '../mx-graph.service';
import {RendererUpdatePayload} from '../../models';

export abstract class BaseRenderService {
  get graph(): mxgraph.mxGraph {
    return this.mxGraphService.graph;
  }

  constructor(protected mxGraphService: MxGraphService, protected languageSettingsService: LanguageSettingsService) {}
  public abstract isApplicable(cell: mxgraph.mxCell): boolean;

  public update({cell, callback}: RendererUpdatePayload) {
    const modelElement = MxGraphHelper.getModelElement(cell);

    cell.setId(modelElement.name);
    cell.setAttribute('name', modelElement.name);

    cell['configuration'] = MxGraphVisitorHelper.getElementProperties(modelElement, this.languageSettingsService);
    this.graph.labelChanged(cell, MxGraphHelper.createPropertiesLabel(cell));

    if (typeof callback === 'function') {
      callback();
    }

    this.mxGraphService.formatShapes();
  }

  protected renderOptionalProperties(cell: mxgraph.mxCell) {
    const modelElement = MxGraphHelper.getModelElement<DefaultAspect | DefaultEntity>(cell);
    this.graph.getOutgoingEdges(cell)?.forEach((e: mxgraph.mxCell) => {
      const property = MxGraphHelper.getModelElement(e.target);
      const keys: OverWrittenPropertyKeys = modelElement.properties.find(
        ({property: prop}) => prop.aspectModelUrn === property.aspectModelUrn
      ).keys;

      this.graph.removeCells([e]);
      this.graph.insertEdge(
        this.graph.getDefaultParent(),
        null,
        null,
        e.source,
        e.target,
        keys.optional ? 'optionalPropertyEdge' : 'defaultEdge'
      );
    });
  }

  protected inMxGraph(modelElement: Base) {
    return this.mxGraphService
      ?.getAllCells()
      ?.find(cell => MxGraphHelper.getModelElement(cell)?.aspectModelUrn === modelElement?.aspectModelUrn);
  }
}
