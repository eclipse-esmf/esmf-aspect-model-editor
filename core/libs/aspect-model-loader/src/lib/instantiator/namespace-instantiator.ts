import {NamedNode, Quad} from 'n3';
import {NamedElement} from '../aspect-meta-model/named-element';
import {BaseInitProps} from '../shared/base-init-props';
import {aspectFactory} from './aspect-instantiator';
import {entityFactory} from './entity-instantiator';
import {getEvents} from './event-instantiator';
import {getOperations} from './operation-instantiator';
import {propertyFactory} from './property-instantiator';

export function namespaceFactory(initProps: BaseInitProps) {
  const {rdfModel, cache} = initProps;
  return function createNamespaces(): Map<string, Array<NamedElement>> {
    loadModelElements(rdfModel.samm.Aspect(), (quad: Quad) => aspectFactory(initProps)(quad.subject.value));

    loadModelElements(rdfModel.samm.Entity(), (quad: Quad) =>
      entityFactory(initProps)(rdfModel.store.getQuads(quad.object, null, null, null)),
    );

    loadModelElements(rdfModel.samm.Event(), (quad: Quad) => getEvents(initProps)(quad.subject));

    loadModelElements(rdfModel.samm.Operation(), (quad: Quad) => getOperations(initProps)(quad.subject));

    loadModelElements(rdfModel.samm.Property(), (quad: Quad) => propertyFactory(initProps).createProperties(quad.subject));

    const allElementsByNamespace = new Map<string, Array<NamedElement>>();
    cache.filter(element => {
      if (!element.namespace || element.namespace.length == 0) {
        return true;
      }
      if (!allElementsByNamespace.has(element.namespace)) {
        allElementsByNamespace.set(element.namespace, []);
      }
      allElementsByNamespace.get(element.namespace).push(element);
      return false;
    });

    return allElementsByNamespace;
  };

  function loadModelElements(type: NamedNode, instantiatorFunction) {
    rdfModel.store.getQuads(null, rdfModel.samm.RdfType(), type, null).forEach(instantiatorFunction);
  }
}
