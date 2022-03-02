import {Injectable} from '@angular/core';
import {mxgraph} from 'mxgraph-factory';
import {
  CharacteristicRenderService,
  ConstraintRenderService,
  EnumerationRenderService,
  EventRenderService,
  PropertyRenderService,
  TraitRenderService,
  UnitRenderService,
} from '.';
import {AspectRenderService} from './aspect-render.service';
import {BaseRenderService} from './base-render-service';
import {EntityRenderService} from './entity-render.service';
import {EntityValueRenderService} from './entity-value-render.service';

@Injectable({
  providedIn: 'root',
})
export class ModelRenderService {
  constructor(
    private aspectRenderService: AspectRenderService,
    private characteristicRenderService: CharacteristicRenderService,
    private entityRenderService: EntityRenderService,
    private propertyRenderService: PropertyRenderService,
    private traitRenderService: TraitRenderService,
    private entityValueRenderService: EntityValueRenderService,
    private enumerationRenderService: EnumerationRenderService,
    private eventRenderService: EventRenderService,
    private unitRenderService: UnitRenderService,
    private constraintRenderService: ConstraintRenderService
  ) {}

  update(cell: mxgraph.mxCell) {
    this.getElementModelService(cell)?.update({cell});
  }

  private getElementModelService(cell: mxgraph.mxCell): BaseRenderService {
    // Order is important
    const elementServices: BaseRenderService[] = [
      this.aspectRenderService,
      this.unitRenderService,
      this.traitRenderService,
      this.constraintRenderService,
      this.enumerationRenderService,
      this.characteristicRenderService,
      this.entityValueRenderService,
      this.entityRenderService,
      this.eventRenderService,
      this.propertyRenderService,
    ];

    // choose the applicable model service
    for (const elementModelService of elementServices) {
      if (elementModelService.isApplicable(cell)) {
        return elementModelService;
      }
    }
    return null;
  }
}
