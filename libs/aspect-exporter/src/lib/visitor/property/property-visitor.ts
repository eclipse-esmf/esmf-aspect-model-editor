import {Injectable} from '@angular/core';
import {mxgraph} from 'mxgraph-factory';
import {DataFactory, Store} from 'n3';
import {BaseVisitor} from '../base-visitor';
import {MxGraphHelper} from '@bame/mx-graph';
import {RdfNodeService} from '../../rdf-node';
import {DefaultProperty} from '@bame/meta-model';
import {RdfService} from '@bame/rdf/services';

@Injectable()
export class PropertyVisitor extends BaseVisitor<DefaultProperty> {
  private get store(): Store {
    return this.rdfNodeService.modelService.getLoadedAspectModel().rdfModel.store;
  }

  constructor(private rdfNodeService: RdfNodeService, rdfService: RdfService) {
    super(rdfService);
  }

  visit(cell: mxgraph.mxCell): DefaultProperty {
    const property: DefaultProperty = MxGraphHelper.getModelElement<DefaultProperty>(cell);
    this.setPrefix(property.aspectModelUrn);
    const oldAspectModelUrn = property.aspectModelUrn;
    this.addProperties(property);
    this.addCharacteristic(property);
    if (oldAspectModelUrn !== property.aspectModelUrn) {
      this.removeOldQuads(oldAspectModelUrn);
    }
    return property;
  }

  private addProperties(property: DefaultProperty) {
    this.rdfNodeService.update(property, {
      exampleValue: property.exampleValue,
      refines: property.refines,
      preferredName: property.getAllLocalesPreferredNames().map(language => ({
        language,
        value: property.getPreferredName(language),
      })),
      description: property.getAllLocalesDescriptions().map(language => ({
        language,
        value: property.getDescription(language),
      })),
      see: property.getSeeReferences() || [],
      name: property.name,
    });
  }

  private addCharacteristic(property: DefaultProperty) {
    if (!property.characteristic) {
      return;
    }

    this.setPrefix(property.characteristic.aspectModelUrn);
    this.store.addQuad(
      DataFactory.namedNode(property.aspectModelUrn),
      this.rdfService.currentRdfModel.BAMM().CharacteristicProperty(),
      DataFactory.namedNode(property.characteristic.aspectModelUrn)
    );
  }

  private removeOldQuads(oldAspectModelUrn: string) {
    this.store.removeQuads(this.store.getQuads(DataFactory.namedNode(oldAspectModelUrn), null, null, null));
  }
}
