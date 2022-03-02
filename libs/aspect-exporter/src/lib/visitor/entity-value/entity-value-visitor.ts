import {Injectable} from '@angular/core';
import {DefaultEntityValue} from '@bame/meta-model';
import {MxGraphHelper} from '@bame/mx-graph';
import {ModelService, RdfService} from '@bame/rdf/services';
import {mxgraph} from 'mxgraph-factory';
import {DataFactory} from 'n3';
import {BaseVisitor} from '../base-visitor';

@Injectable()
export class EntityValueVisitor extends BaseVisitor<DefaultEntityValue> {
  constructor(public modelService: ModelService, rdfService: RdfService) {
    super(rdfService);
  }

  visit(cell: mxgraph.mxCell): DefaultEntityValue {
    return this.visitModel(MxGraphHelper.getModelElement<DefaultEntityValue>(cell));
  }

  visitModel(entityValue: DefaultEntityValue) {
    this.setPrefix(entityValue.aspectModelUrn);
    this.updateProperties(entityValue);
    this.updateBaseProperties(entityValue);
    return entityValue;
  }

  private updateProperties(entityValue: DefaultEntityValue) {
    const rdfModel = this.modelService.getLoadedAspectModel().rdfModel;
    for (const {key, value} of entityValue.properties) {
      const dataType = key.property?.getDeepLookUpDataType();
      rdfModel.store.addQuad(
        DataFactory.namedNode(entityValue.aspectModelUrn),
        DataFactory.namedNode(key.property.aspectModelUrn),
        value instanceof DefaultEntityValue
          ? DataFactory.namedNode(value.aspectModelUrn)
          : DataFactory.literal(value?.toString(), dataType ? DataFactory.namedNode(dataType.getUrn()) : undefined)
      );

      if (value instanceof DefaultEntityValue && value.isExternalReference()) {
        this.setPrefix(value.aspectModelUrn);
      }
    }
  }

  private updateBaseProperties(entityValue: DefaultEntityValue) {
    const rdfModel = this.modelService.getLoadedAspectModel().rdfModel;
    rdfModel.store.addQuad(
      DataFactory.namedNode(entityValue.aspectModelUrn),
      rdfModel.BAMM().RdfType(),
      DataFactory.namedNode(entityValue.entity.aspectModelUrn)
    );
  }
}
