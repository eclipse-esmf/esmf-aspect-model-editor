import {Store} from 'n3';
import {
  allCharacteristicsFactory,
  allConstraintsFactory,
  aspectFactory,
  entityFactory,
  eventFactory,
  getEvents,
  operationFactory,
  predefinedEntitiesFactory,
  propertyFactory,
  unitFactory,
} from './instantiator';
import {BaseInitProps} from './shared/base-init-props';
import {ModelElementCache} from './shared/model-element-cache.service';
import {RdfModel} from './shared/rdf-model';

export function useLoader(init?: Partial<BaseInitProps>) {
  const rdfModel = init?.rdfModel || new RdfModel(new Store());
  const cache = init?.cache || new ModelElementCache();
  const baseInit: BaseInitProps = {rdfModel, cache};

  return {
    createAspect: aspectFactory(baseInit),
    createEntity: entityFactory(baseInit),
    createEvent: eventFactory(baseInit),
    createEvents: getEvents(baseInit),
    createOperation: operationFactory(baseInit),
    ...propertyFactory(baseInit),
    ...unitFactory(baseInit),
    ...predefinedEntitiesFactory(baseInit),
    ...allConstraintsFactory(baseInit),
    ...allCharacteristicsFactory(baseInit),
  };
}
