import {Injectable} from '@angular/core';
import {DefaultProperty} from '@bame/meta-model';
import {LanguageSettingsService} from '@bame/settings-dialog';
import {mxgraph} from 'mxgraph-factory';
import {MxGraphHelper} from '../../helpers';
import {RendererUpdatePayload} from '../../models';
import {MxGraphService} from '../mx-graph.service';
import {BaseRenderService} from './base-render-service';

@Injectable({
  providedIn: 'root',
})
export class PropertyRenderService extends BaseRenderService {
  constructor(mxGraphService: MxGraphService, languageSettingsService: LanguageSettingsService) {
    super(mxGraphService, languageSettingsService);
  }

  update({cell, callback}: RendererUpdatePayload) {
    const parents = this.mxGraphService.resolveParents(cell);
    for (const parent of parents) {
      MxGraphHelper.updateLabel(parent, this.mxGraphService.graph, this.languageSettingsService);
    }
    super.update({cell, callback});
  }

  isApplicable(cell: mxgraph.mxCell): boolean {
    return MxGraphHelper.getModelElement(cell) instanceof DefaultProperty;
  }
}
