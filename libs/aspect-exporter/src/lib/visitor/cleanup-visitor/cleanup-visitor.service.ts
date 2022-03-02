import {Injectable} from '@angular/core';
import {Store} from 'n3';
import {RdfNodeService} from '../../rdf-node/rdf-node.service';

@Injectable()
export class CleanupVisitor {
  private get store(): Store {
    return this.rdfNodeService.modelService.getLoadedAspectModel().rdfModel.store;
  }

  constructor(private rdfNodeService: RdfNodeService) {}

  removeStoreElements() {
    this.store.removeQuads(this.store.getQuads(null, null, null, null));
  }
}
