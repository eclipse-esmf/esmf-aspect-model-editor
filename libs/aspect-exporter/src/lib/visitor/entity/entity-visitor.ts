import {Injectable} from '@angular/core';
import {mxgraph} from 'mxgraph-factory';
import {ListProperties, RdfListService} from '../../rdf-list';
import {BaseVisitor} from '../base-visitor';
import {Characteristic, DefaultCharacteristic, DefaultEntity} from '@bame/meta-model';
import {MxGraphService, MxGraphHelper} from '@bame/mx-graph';
import {RdfNodeService} from '../../rdf-node/rdf-node.service';
import {RdfService} from '@bame/rdf/services';

@Injectable()
export class EntityVisitor extends BaseVisitor<DefaultEntity> {
  constructor(
    public rdfNodeService: RdfNodeService,
    public graphService: MxGraphService,
    public rdfListService: RdfListService,
    public rdfService: RdfService
  ) {
    super(rdfService);
  }

  visit(cell: mxgraph.mxCell): DefaultEntity {
    const entity: DefaultEntity = MxGraphHelper.getModelElement(cell);
    this.setPrefix(entity.aspectModelUrn);
    const newAspectModelUrn = `${entity.aspectModelUrn.split('#')[0]}#${entity.name}`;
    this.updateParents(cell);
    entity.aspectModelUrn = newAspectModelUrn;
    this.updateProperties(entity);
    return entity;
  }

  private updateProperties(entity: DefaultEntity) {
    this.rdfListService.setRdfModel(this.rdfNodeService.modelService.getLoadedAspectModel().rdfModel);
    this.rdfNodeService.update(entity, {
      // TODO: refines might be added in the future
      preferredName: entity.getAllLocalesPreferredNames()?.map(language => ({
        language,
        value: entity.getPreferredName(language),
      })),
      description: entity.getAllLocalesDescriptions()?.map(language => ({
        language,
        value: entity.getDescription(language),
      })),
      see: entity.getSeeReferences() || [],
      name: entity.name,
    });

    if (entity.properties?.length) {
      this.rdfListService.push(entity, ...entity.properties);
      for (const property of entity.properties) {
        this.setPrefix(property.property.aspectModelUrn);
      }
    } else {
      this.rdfListService.createEmpty(entity, ListProperties.properties);
    }
  }

  private updateParents(cell: mxgraph.mxCell) {
    const entity = MxGraphHelper.getModelElement<DefaultEntity>(cell);
    const parents = this.graphService
      .resolveParents(cell)
      ?.map((parent: mxgraph.mxCell) => MxGraphHelper.getModelElement<Characteristic>(parent))
      ?.filter(metaModelElement => metaModelElement instanceof DefaultCharacteristic);

    if (parents) {
      for (const parent of parents) {
        this.rdfNodeService.update(parent, {dataType: entity.aspectModelUrn});
      }
    }
  }
}
