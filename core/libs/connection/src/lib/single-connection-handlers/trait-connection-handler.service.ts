import {FiltersService} from '@ame/loader-filters';
import {DefaultTrait, ModelElementNamingService, DefaultCharacteristic, DefaultConstraint} from '@ame/meta-model';
import {MxGraphService, MxGraphHelper} from '@ame/mx-graph';
import {Injectable} from '@angular/core';
import {SingleShapeConnector} from '../models';
import {mxgraph} from 'mxgraph-factory';

@Injectable({
  providedIn: 'root',
})
export class TraitConnectionHandler implements SingleShapeConnector<DefaultTrait> {
  constructor(
    private mxGraphService: MxGraphService,
    private modelElementNamingService: ModelElementNamingService,
    private filtersService: FiltersService
  ) {}

  public connect(trait: DefaultTrait, source: mxgraph.mxCell) {
    const defaultElement =
      trait.getBaseCharacteristic() == null ? DefaultCharacteristic.createInstance() : DefaultConstraint.createInstance();
    const metaModelElement = this.modelElementNamingService.resolveMetaModelElement(defaultElement);
    const child = this.mxGraphService.renderModelElement(
      this.filtersService.createNode(metaModelElement, {parent: MxGraphHelper.getModelElement(source)})
    );
    trait.update(defaultElement);
    this.mxGraphService.assignToParent(child, source);
    this.mxGraphService.moveCells([child], source.getGeometry().x + 30, source.getGeometry().y + 60);
    this.mxGraphService.formatCell(child);
    this.mxGraphService.formatShapes();
  }
}
