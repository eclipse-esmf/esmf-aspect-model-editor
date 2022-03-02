import {
  DefaultAspect,
  DefaultEntity,
  DefaultEnumeration,
  DefaultEvent,
  DefaultOperation,
  DefaultProperty,
  DefaultStructuredValue,
  DefaultUnit,
} from '@bame/meta-model';
import {Bamm, Bammc} from '@bame/vocabulary';
import {ListProperties, Relations} from './rdf-list.types';

export const getRelations = (bamm: Bamm, bammc: Bammc): Relations[] => [
  {
    source: DefaultAspect,
    children: [
      {type: DefaultProperty, predicate: bamm.PropertiesProperty()},
      {type: DefaultOperation, predicate: bamm.OperationsProperty()},
      {type: DefaultEvent, predicate: bamm.EventsProperty()}
    ],
  },
  {
    source: DefaultOperation,
    children: [{type: DefaultProperty, predicate: bamm.InputProperty()}],
  },
  {
    source: DefaultEntity,
    children: [{type: DefaultProperty, predicate: bamm.PropertiesProperty()}],
  },
  {
    source: DefaultEnumeration,
    children: [{predicate: bammc.ValuesProperty()}],
  },
  {
    source: DefaultStructuredValue,
    children: [{predicate: bammc.ElementsProperty()}],
  },
  {
    source: DefaultUnit,
    children: [{type: DefaultUnit, predicate: bamm.QuantityKindsProperty()}],
  },
  {
    source: DefaultEvent,
    children: [{type: DefaultProperty, predicate: bamm.ParametersProperty()}],
  },
];

export const getPredicateByKey = (key: ListProperties, bamm: Bamm, bammc: Bammc) => {
  const predicates = {
    [ListProperties.elements]: bammc.ElementsProperty(),
    [ListProperties.values]: bammc.ValuesProperty(),
    [ListProperties.operations]: bamm.OperationsProperty(),
    [ListProperties.properties]: bamm.PropertiesProperty(),
    [ListProperties.input]: bamm.InputProperty(),
    [ListProperties.quantityKinds]: bamm.QuantityKindsProperty(),
    [ListProperties.events]: bamm.EventsProperty(),
    [ListProperties.parameters]: bamm.ParametersProperty()
  };

  return predicates[key];
};
