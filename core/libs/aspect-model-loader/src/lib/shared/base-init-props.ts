import {CacheStrategy} from './model-element-cache.service';
import {RdfModel} from './rdf-model';

export interface BaseInitProps {
  rdfModel: RdfModel;
  cache: CacheStrategy;
}
