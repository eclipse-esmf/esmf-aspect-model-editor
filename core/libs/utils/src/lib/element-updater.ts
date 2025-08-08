/*
 * Copyright (c) 2025 Robert Bosch Manufacturing Solutions GmbH
 *
 * See the AUTHORS file(s) distributed with aspect work for
 * additional information regarding authorship.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * SPDX-License-Identifier: MPL-2.0
 */

import {
  DefaultAspect,
  DefaultCharacteristic,
  DefaultCollection,
  DefaultConstraint,
  DefaultEither,
  DefaultEntity,
  DefaultEnumeration,
  DefaultEvent,
  DefaultOperation,
  DefaultProperty,
  DefaultQuantifiable,
  DefaultScalar,
  DefaultStructuredValue,
  DefaultTrait,
  DefaultUnit,
  NamedElement,
  Type,
} from '@esmf/aspect-model-loader';

interface ElementUpdater {
  update?: (toUpdate: NamedElement) => void;
  delete?: (toRemove: NamedElement) => void;
}

const characteristic = (element: DefaultCharacteristic): ElementUpdater => ({
  update: (toUpdate: NamedElement) =>
    (toUpdate instanceof DefaultEntity || toUpdate instanceof DefaultScalar) && (element.dataType = toUpdate),
  delete: (toRemove: NamedElement) => (toRemove instanceof DefaultEntity || toRemove instanceof DefaultScalar) && (element.dataType = null),
});

const abstractEntity = (abstractEntity: DefaultEntity): ElementUpdater => ({
  delete: (toRemove: NamedElement) => {
    if (toRemove instanceof DefaultProperty || (toRemove instanceof DefaultProperty && toRemove.isAbstract)) {
      const index = abstractEntity.properties.findIndex(property => property.aspectModelUrn === toRemove.aspectModelUrn);
      if (index >= 0) {
        abstractEntity.properties.splice(index, 1);
      }
    }

    if (toRemove instanceof DefaultEntity && toRemove.isAbstractEntity()) {
      abstractEntity.extends_ = null;
    }
  },
});

const aspect = (aspect: DefaultAspect): ElementUpdater => ({
  delete: (toRemove: NamedElement) => {
    if (toRemove instanceof DefaultProperty) {
      const index = aspect.properties.findIndex(property => property.aspectModelUrn === toRemove.aspectModelUrn);
      if (index >= 0) {
        aspect.properties.splice(index, 1);
      }
    } else if (toRemove instanceof DefaultOperation) {
      const index = aspect.operations.indexOf(toRemove);
      if (index >= 0) {
        aspect.operations.splice(index, 1);
      }
    } else if (toRemove instanceof DefaultEvent) {
      const index = aspect.events.indexOf(toRemove);
      if (index >= 0) {
        aspect.events.splice(index, 1);
      }
    }
  },
});

const collection = (collection: DefaultCollection): ElementUpdater => ({
  update: (toUpdate: NamedElement) => {
    if (toUpdate instanceof DefaultCharacteristic) {
      collection.elementCharacteristic = toUpdate;
    }

    characteristic(collection).update(toUpdate);
  },
  delete: (toRemove: NamedElement) => {
    if (collection.elementCharacteristic && collection.elementCharacteristic.aspectModelUrn === toRemove.aspectModelUrn) {
      collection.elementCharacteristic = null;
    }

    characteristic(collection).delete(toRemove);
  },
});

const either = (either: DefaultEither): ElementUpdater => ({
  delete: (toRemove: NamedElement) => {
    if (either.left?.aspectModelUrn === toRemove.aspectModelUrn) {
      either.left = null;
    } else if (either.right?.aspectModelUrn === toRemove.aspectModelUrn) {
      either.right = null;
    }
  },
});

const entity = (entity: DefaultEntity): ElementUpdater => ({
  delete: (toRemove: NamedElement) => {
    if (toRemove.className === 'DefaultProperty') {
      const index = entity.properties.findIndex(property => property.aspectModelUrn === toRemove.aspectModelUrn);
      if (index >= 0) {
        entity.properties.splice(index, 1);
      }
    }
    if (toRemove instanceof DefaultEntity && entity.extends_?.aspectModelUrn === toRemove.aspectModelUrn) {
      entity.extends_ = null;
    }
  },
});

const enumeration = (enumeration: DefaultEnumeration): ElementUpdater => ({
  delete: (toRemove: NamedElement) => {
    if (toRemove instanceof DefaultEntity) {
      enumeration.dataType = null;
      enumeration.values = [];
    }
  },
});

const event = (event: DefaultEvent): ElementUpdater => ({
  delete: (toRemove: NamedElement) => {
    if (toRemove instanceof DefaultProperty) {
      const index = event.properties.findIndex(property => property.aspectModelUrn === toRemove.aspectModelUrn);
      if (index >= 0) {
        event.properties.splice(index, 1);
      }
    }
  },
});

const operation = (operation: DefaultOperation): ElementUpdater => ({
  delete: (toRemove: NamedElement) => {
    if (toRemove instanceof DefaultProperty) {
      const index = operation.input.findIndex(property => property.aspectModelUrn === toRemove.aspectModelUrn);
      if (index >= 0) {
        operation.input.splice(index, 1);
      }
    }

    if (operation.output?.aspectModelUrn === toRemove.aspectModelUrn) {
      operation.output = null;
    }
  },
});

const property = (property: DefaultProperty): ElementUpdater => ({
  delete: (toRemove: NamedElement) => {
    if (property.characteristic && property.characteristic.aspectModelUrn === toRemove.aspectModelUrn) {
      property.characteristic = null;
    }
  },
  update: (toUpdate: NamedElement) => {
    if (toUpdate instanceof DefaultCharacteristic) {
      property.characteristic = toUpdate;
    } else if (toUpdate instanceof DefaultScalar) {
      property.characteristic.dataType = toUpdate;
    }
  },
});

const quantifiable = (quantifiable: DefaultQuantifiable): ElementUpdater => ({
  delete: (toRemove: NamedElement) => {
    if (quantifiable.unit && toRemove && quantifiable.unit.aspectModelUrn === toRemove.aspectModelUrn) {
      quantifiable.unit = null;
    }
    characteristic(quantifiable).delete(toRemove);
  },
  update: (toUpdate: NamedElement) => {
    if (toUpdate instanceof DefaultUnit) {
      quantifiable.unit = toUpdate;
    } else if (toUpdate instanceof DefaultScalar) {
      quantifiable.dataType = toUpdate;
    }
  },
});

const structuredValue = (structuredValue: DefaultStructuredValue): ElementUpdater => ({
  delete: (toRemove: NamedElement | Type) => {
    if (toRemove instanceof DefaultProperty) {
      structuredValue.elements = structuredValue.elements?.filter(property => {
        if (typeof property === 'string') {
          return true;
        }

        if (property.aspectModelUrn === toRemove.aspectModelUrn) {
          return false;
        }

        return true;
      });
    }

    characteristic(structuredValue).delete(toRemove as NamedElement);
  },
});

const trait = (trait: DefaultTrait) => ({
  delete: (toRemove: NamedElement) => {
    if (trait.baseCharacteristic && trait.baseCharacteristic.aspectModelUrn === toRemove.aspectModelUrn) {
      trait.baseCharacteristic = null;
    }

    trait.constraints = trait.constraints?.filter(element => element.aspectModelUrn !== toRemove.aspectModelUrn);
  },
  update: (toUpdate: NamedElement) => {
    if (toUpdate instanceof DefaultCharacteristic) {
      trait.baseCharacteristic = toUpdate;
    } else if (toUpdate instanceof DefaultConstraint) {
      trait.constraints.push(toUpdate);
    }
  },
});

export const useUpdater = <T>(element: T): ElementUpdater => {
  if (element instanceof DefaultEntity && element.isAbstractEntity()) {
    return abstractEntity(element);
  }

  if (element instanceof DefaultEntity) {
    return entity(element);
  }

  if (element instanceof DefaultAspect) {
    return aspect(element);
  }

  if (element instanceof DefaultCollection) {
    return collection(element);
  }

  if (element instanceof DefaultEither) {
    return either(element);
  }

  if (element instanceof DefaultEnumeration) {
    return enumeration(element);
  }

  if (element instanceof DefaultEvent) {
    return event(element);
  }

  if (element instanceof DefaultOperation) {
    return operation(element);
  }

  if (element instanceof DefaultProperty) {
    return property(element);
  }

  if (element instanceof DefaultQuantifiable) {
    return quantifiable(element);
  }

  if (element instanceof DefaultStructuredValue) {
    return structuredValue(element);
  }

  if (element instanceof DefaultTrait) {
    return trait(element);
  }

  if (element instanceof DefaultCharacteristic && !element.isPredefined) {
    return characteristic(element);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  return {update: (toUpdate: NamedElement) => {}, delete: (toRemove: NamedElement) => {}};
};
