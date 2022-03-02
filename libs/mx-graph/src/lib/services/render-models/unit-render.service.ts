import {Injectable} from '@angular/core';
import {NamespacesCacheService} from '@bame/cache';
import {DefaultUnit} from '@bame/meta-model';
import {LanguageSettingsService} from '@bame/settings-dialog';
import {mxgraph} from 'mxgraph-factory';
import {MxGraphHelper} from '../../helpers';
import {MxGraphSetupVisitor} from '../../visitors';
import {MxGraphShapeOverlayService} from '../mx-graph-shape-overlay.service';
import {MxGraphService} from '../mx-graph.service';
import {BaseRenderService} from './base-render-service';

@Injectable({
  providedIn: 'root',
})
export class UnitRenderService extends BaseRenderService {
  constructor(
    mxGraphService: MxGraphService,
    languageSettingsService: LanguageSettingsService,
    private mxGraphShapeOverlayService: MxGraphShapeOverlayService,
    private namespacesCacheService: NamespacesCacheService
  ) {
    super(mxGraphService, languageSettingsService);
  }

  create(parentCell: mxgraph.mxCell, unit: DefaultUnit) {
    this.removeFrom(parentCell);

    // create shape for new unit
    new MxGraphSetupVisitor(
      this.mxGraphService,
      this.mxGraphShapeOverlayService,
      this.namespacesCacheService,
      this.languageSettingsService,
      null
    ).visitUnit(unit, parentCell);
  }

  removeFrom(parentCell: mxgraph.mxCell) {
    const edges = this.mxGraphService.graph.getOutgoingEdges(parentCell);
    const unitCell = edges.find(edge => MxGraphHelper.getModelElement(edge?.target) instanceof DefaultUnit);
    if (unitCell && (MxGraphHelper.getModelElement(unitCell.target) as DefaultUnit).isPredefined()) {
      this.mxGraphService.graph.removeCells([unitCell.target], true);
    } else if (unitCell) {
      this.mxGraphService.graph.removeCells([unitCell], true);
    }
  }

  isApplicable(cell: mxgraph.mxCell): boolean {
    return MxGraphHelper.getModelElement(cell) instanceof DefaultUnit;
  }
}
