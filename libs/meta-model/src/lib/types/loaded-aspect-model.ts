import {RdfModel} from '@bame/rdf/utils';
import {Aspect} from '../aspect-meta-model';

export interface LoadedAspectModel {
  rdfModel: RdfModel;
  aspect: Aspect;
}
