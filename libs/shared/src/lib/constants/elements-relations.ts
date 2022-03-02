export enum Elements {
  aspect = 'aspect',
  property = 'property',
  operation = 'operation',
  constraint = 'constraint',
  characteristic = 'characteristic',
  entity = 'entity',
  trait = 'trait',
  unit = 'unit',
  event = 'event',
  entityValue = 'entityValue',
}

export const relations = {
  [Elements.aspect]: [Elements.property],
  [Elements.aspect]: [Elements.operation],
  [Elements.aspect]: [Elements.event],
  [Elements.property]: [Elements.characteristic, Elements.trait],
  [Elements.operation]: [],
  [Elements.constraint]: [],
  [Elements.unit]: [],
  [Elements.characteristic]: [Elements.entity, Elements.entityValue, Elements.unit],
  [Elements.entity]: [Elements.property],
  [Elements.trait]: [Elements.constraint],
  [Elements.entityValue]: [],
  [Elements.event]: [Elements.property]
};
