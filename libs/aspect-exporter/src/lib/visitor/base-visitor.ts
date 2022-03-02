import {RdfService} from '@bame/rdf/services';
import {mxgraph} from 'mxgraph-factory';
import {DataFactory} from 'n3';

export abstract class BaseVisitor<T> {
  constructor(protected rdfService: RdfService) {}

  abstract visit(cell: mxgraph.mxCell): T;

  protected setPrefix(aspectModelUrn: string) {
    const namespace = `${aspectModelUrn.split('#')[0]}#`;
    if (this.rdfService.currentRdfModel.hasNamespace(namespace)) {
      return;
    }

    const externalRdfModel = this.rdfService.externalRdfModels.find(
      rdfModel => rdfModel.store.getQuads(DataFactory.namedNode(aspectModelUrn), null, null, null).length > 0
    );
    const alias = externalRdfModel?.getAliasByNamespace(namespace);
    this.rdfService.currentRdfModel.addPrefix(alias, namespace);
  }
}
