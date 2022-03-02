import {Injectable} from '@angular/core';
import {DefaultAspect} from '@bame/meta-model';
import {MxGraphHelper} from '@bame/mx-graph';
import {LanguageSettingsService} from '@bame/settings-dialog';
import {mxgraph} from 'mxgraph-factory';
import {RendererUpdatePayload} from '../../models';
import {MxGraphService} from '../mx-graph.service';
import {BaseRenderService} from './base-render-service';

@Injectable({
  providedIn: 'root',
})
export class AspectRenderService extends BaseRenderService {
  constructor(mxGraphService: MxGraphService, languageSettingsService: LanguageSettingsService) {
    super(mxGraphService, languageSettingsService);
  }

  update({cell}: RendererUpdatePayload) {
    super.update({
      cell,
      callback: () => {
        this.renderOptionalProperties(cell);
      },
    });
  }

  isApplicable(cell: mxgraph.mxCell): boolean {
    return MxGraphHelper.getModelElement(cell) instanceof DefaultAspect;
  }
}
