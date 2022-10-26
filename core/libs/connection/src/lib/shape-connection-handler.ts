/*
 * Copyright (c) 2022 Robert Bosch Manufacturing Solutions GmbH
 *
 * See the AUTHORS file(s) distributed with this work for
 * additional information regarding authorship.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * SPDX-License-Identifier: MPL-2.0
 */

import {mxgraph} from 'mxgraph-factory';
import {Injectable} from '@angular/core';
import {
  ModelInfo,
  MxGraphAttributeService,
  MxGraphHelper,
  MxGraphService,
  MxGraphShapeOverlayService,
  MxGraphVisitorHelper,
} from '@ame/mx-graph';
import {
  Aspect,
  Base,
  BaseMetaModelElement,
  Characteristic,
  DefaultAbstractEntity,
  DefaultAbstractProperty,
  DefaultAspect,
  DefaultCharacteristic,
  DefaultCollection,
  DefaultConstraint,
  DefaultEither,
  DefaultEntity,
  DefaultEntityValue,
  DefaultEnumeration,
  DefaultEvent,
  DefaultOperation,
  DefaultProperty,
  DefaultQuantifiable,
  DefaultStructuredValue,
  DefaultTrait,
  DefaultUnit,
  Entity,
  Event,
  ModelElementNamingService,
  Operation,
  OverWrittenProperty,
  Property,
  StructuredValue,
} from '@ame/meta-model';
import {EntityValueService} from '@ame/editor';
import {ExpandedModelShape, NotificationsService} from '@ame/shared';
import {NamespacesCacheService} from '@ame/cache';
import {RdfModelUtil} from '@ame/rdf/utils';
import {LanguageSettingsService} from '@ame/settings-dialog';
import mxCell = mxgraph.mxCell;

export interface ShapeSingleConnector<T> {
  connect(metaModel: T, source: mxCell, modelInfo?: ModelInfo): void;
}

export interface ShapeMultiConnector<T, R> {
  connect(parentMetaModel: T, childMetaModel: R, parent: mxCell, child: mxCell): void;
}

export interface ShapeMultiConnectorWithProperty<T, R> {
  connect(parentMetaModel: T, childMetaModel: R, parent: mxCell, child: mxCell, property: string): void;
}

abstract class InheritanceConnector {
  constructor(
    protected mxGraphService: MxGraphService,
    protected mxGraphAttributeService: MxGraphAttributeService,
    protected languageSettingsService: LanguageSettingsService,
    protected notificationsService: NotificationsService
  ) {}

  public connect(parentMetaModel: BaseMetaModelElement, childMetaModel: BaseMetaModelElement, parentCell: mxCell, childCell: mxCell) {
    if (typeof parentMetaModel['isPredefined'] === 'function' && parentMetaModel['isPredefined']()) {
      this.notificationsService.warning({title: "A predefined element can't have a child"});
      return;
    }

    (parentMetaModel as any).extendedElement = childMetaModel;
    this.checkAndRemoveExtendElement(parentCell);
    this.mxGraphService.assignToParent(childCell, parentCell);
    parentCell['configuration'].fields = MxGraphVisitorHelper.getElementProperties(parentMetaModel, this.languageSettingsService);
    this.mxGraphAttributeService.graph.labelChanged(parentCell, MxGraphHelper.createPropertiesLabel(parentCell));
  }

  public checkAndRemoveExtendElement(parentCell: mxCell) {
    this.mxGraphAttributeService.graph.getOutgoingEdges(parentCell).forEach((outEdge: mxCell) => {
      const targetElement = MxGraphHelper.getModelElement(outEdge.target);
      if (this.isInheritedElement(targetElement)) {
        this.mxGraphService.removeCells([parentCell.removeEdge(outEdge, true)]);
      }
    });
  }

  abstract isInheritedElement(element: BaseMetaModelElement): boolean;
}

class EntityInheritanceConnector extends InheritanceConnector {
  constructor(
    protected mxGraphService: MxGraphService,
    protected mxGraphAttributeService: MxGraphAttributeService,
    protected languageSettingsService: LanguageSettingsService,
    protected notificationsService: NotificationsService,
    protected propertyAbstractPropertyConnector?: PropertyAbstractPropertyConnectionHandler,
    protected entityPropertyConnector?: EntityPropertyConnectionHandler
  ) {
    super(mxGraphService, mxGraphAttributeService, languageSettingsService, notificationsService);
  }

  connectWithAbstract(
    parentMetaModel: DefaultEntity,
    childMetaModel: DefaultAbstractEntity | DefaultEntity,
    parent: mxgraph.mxCell,
    child: mxgraph.mxCell
  ) {
    if (parentMetaModel.extendedElement?.aspectModelUrn === childMetaModel.aspectModelUrn) {
      return;
    }

    const abstractProperties = childMetaModel.allProperties
      .map(({property}) => property)
      .filter(
        abstractProperty =>
          abstractProperty instanceof DefaultAbstractProperty &&
          !childMetaModel.allProperties?.some(({property: p}) => p.extendedElement?.aspectModelUrn === abstractProperty.aspectModelUrn)
      );

    const newProperties = abstractProperties.map(abstractProperty => {
      const property = DefaultProperty.createInstance();
      property.metaModelVersion = abstractProperty.metaModelVersion;
      const [namespace, name] = abstractProperty.aspectModelUrn.split('#');
      property.aspectModelUrn = `${namespace}#[${name}]`;
      property.extendedElement = abstractProperty;
      return property;
    });

    parentMetaModel.properties = [
      ...parentMetaModel.properties,
      ...newProperties.map(property => ({
        property,
        keys: {},
      })),
    ];

    for (let i = 0; i < newProperties.length; i++) {
      const propertyCell = this.mxGraphService.renderModelElement(newProperties[i]);
      this.entityPropertyConnector.connect(parentMetaModel, newProperties[i], parent, propertyCell);

      this.propertyAbstractPropertyConnector.connect(
        newProperties[i],
        abstractProperties[i],
        propertyCell,
        this.mxGraphService.resolveCellByModelElement(abstractProperties[i])
      );
    }

    this.mxGraphService.formatCell(parent);
    this.mxGraphService.formatCell(child);
    this.mxGraphService.formatShapes();
  }

  isInheritedElement(element: BaseMetaModelElement): boolean {
    return element instanceof DefaultEntity || element instanceof DefaultAbstractEntity;
  }
}

class PropertyInheritanceConnector extends InheritanceConnector {
  constructor(
    protected mxGraphService: MxGraphService,
    protected mxGraphAttributeService: MxGraphAttributeService,
    protected languageSettingsService: LanguageSettingsService,
    protected notificationsService: NotificationsService
  ) {
    super(mxGraphService, mxGraphAttributeService, languageSettingsService, notificationsService);
  }

  public connect(parentMetaModel: BaseMetaModelElement, childMetaModel: BaseMetaModelElement, parentCell: mxCell, childCell: mxCell) {
    if (
      parentMetaModel instanceof DefaultProperty &&
      (childMetaModel instanceof DefaultAbstractProperty || childMetaModel instanceof DefaultProperty)
    ) {
      parentMetaModel.name = `[${childMetaModel.name}]`;
      parentMetaModel.preferredNames.clear();
      parentMetaModel.descriptions.clear();
      parentMetaModel.exampleValue = '';
      parentCell.setId(`[${childMetaModel.name}]`);
    }

    super.connect(parentMetaModel, childMetaModel, parentCell, childCell);
  }

  isInheritedElement(element: BaseMetaModelElement): boolean {
    return element instanceof DefaultProperty || element instanceof DefaultAbstractProperty;
  }

  protected hasEntityParent(cell: mxgraph.mxCell) {
    return !this.mxGraphService
      .resolveParents(cell)
      ?.some(cell => [DefaultAbstractEntity, DefaultEntity].some(c => MxGraphHelper.getModelElement(cell) instanceof c));
  }
}

// ==========================================================================================
// Connection classes if the plus icon is clicked
// ==========================================================================================

@Injectable({
  providedIn: 'root',
})
export class AspectConnectionHandler implements ShapeSingleConnector<Aspect> {
  constructor(private mxGraphService: MxGraphService, private modelElementNamingService: ModelElementNamingService) {}

  public connect(aspect: Aspect, source: mxCell) {
    const defaultProperty = DefaultProperty.createInstance();
    const metaModelElement = this.modelElementNamingService.resolveMetaModelElement(defaultProperty);
    const child = this.mxGraphService.renderModelElement(metaModelElement);
    aspect.properties.push({property: defaultProperty, keys: {}});
    this.mxGraphService.assignToParent(child, source);
    this.mxGraphService.formatCell(source);
    this.mxGraphService.formatShapes();
  }
}

@Injectable({
  providedIn: 'root',
})
export class OperationConnectionHandler implements ShapeSingleConnector<Operation> {
  constructor(
    private mxGraphService: MxGraphService,
    private modelElementNamingService: ModelElementNamingService,
    private notificationsService: NotificationsService
  ) {}

  public connect(operation: Operation, source: mxCell, modelInfo: ModelInfo) {
    const defaultProperty = DefaultProperty.createInstance();

    const overWrittenProperty = {property: defaultProperty, keys: {}};
    if (ModelInfo.IS_OPERATION_OUTPUT === modelInfo) {
      if (operation.output) {
        this.notificationsService.warning({title: 'Operation output is already defined'});
        return;
      }
      operation.output = overWrittenProperty;
    } else if (ModelInfo.IS_OPERATION_INPUT === modelInfo) {
      operation.input.push(overWrittenProperty);
    }

    const metaModelElement = this.modelElementNamingService.resolveMetaModelElement(defaultProperty);
    const child = this.mxGraphService.renderModelElement(metaModelElement);
    this.mxGraphService.assignToParent(child, source);
    this.mxGraphService.formatCell(source);
    this.mxGraphService.formatShapes();
  }
}

@Injectable({
  providedIn: 'root',
})
export class EventConnectionHandler implements ShapeSingleConnector<Event> {
  constructor(private mxGraphService: MxGraphService, private modelElementNamingService: ModelElementNamingService) {}

  public connect(event: Event, source: mxCell) {
    const defaultProperty = DefaultProperty.createInstance();
    const metaModelElement = this.modelElementNamingService.resolveMetaModelElement(defaultProperty);
    const child = this.mxGraphService.renderModelElement(metaModelElement);
    const overWrittenProperty = {property: defaultProperty, keys: {}};
    event.parameters.push(overWrittenProperty);
    this.mxGraphService.assignToParent(child, source);
    this.mxGraphService.formatCell(source);
    this.mxGraphService.formatShapes();
  }
}

@Injectable({
  providedIn: 'root',
})
export class PropertyConnectionHandler implements ShapeSingleConnector<Property> {
  constructor(
    private mxGraphService: MxGraphService,
    private modelElementNamingService: ModelElementNamingService,
    private mxGraphShapeOverlayService: MxGraphShapeOverlayService
  ) {}

  public connect(property: Property, source: mxCell) {
    if (!property.characteristic) {
      property.characteristic = DefaultCharacteristic.createInstance();
      const metaModelElement = this.modelElementNamingService.resolveMetaModelElement(property.characteristic);
      const child = this.mxGraphService.renderModelElement(metaModelElement);
      property.characteristic = metaModelElement;
      this.mxGraphService.assignToParent(child, source);

      if (MxGraphHelper.hasGrandParentStructuredValue(child, this.mxGraphService.graph)) {
        this.mxGraphShapeOverlayService.removeOverlay(child, MxGraphHelper.getNewShapeOverlayButton(child));
      }

      this.mxGraphService.formatCell(source);
      this.mxGraphService.formatShapes();
    }
  }
}

@Injectable({
  providedIn: 'root',
})
export class EitherConnectionHandler implements ShapeSingleConnector<DefaultEither> {
  constructor(
    private mxGraphService: MxGraphService,
    private modelElementNamingService: ModelElementNamingService,
    private notificationsService: NotificationsService
  ) {}

  public connect(either: DefaultEither, source: mxCell, modelInfo: ModelInfo) {
    const defaultCharacteristic = DefaultCharacteristic.createInstance();

    if (ModelInfo.IS_EITHER_LEFT === modelInfo) {
      if (either.left) {
        this.notificationsService.warning({title: 'Either left is already defined'});
        return;
      }
      either.left = defaultCharacteristic;
    } else if (ModelInfo.IS_EITHER_RIGHT === modelInfo) {
      if (either.right) {
        this.notificationsService.warning({title: 'Either right is already defined'});
        return;
      }
      either.right = defaultCharacteristic;
    }

    const metaModelElement = this.modelElementNamingService.resolveMetaModelElement(defaultCharacteristic);
    const child = this.mxGraphService.renderModelElement(metaModelElement);
    this.mxGraphService.assignToParent(child, source);
    this.mxGraphService.formatCell(source);
    this.mxGraphService.formatShapes();
  }
}

@Injectable({
  providedIn: 'root',
})
export class EntityConnectionHandler implements ShapeSingleConnector<Entity> {
  constructor(
    private mxGraphService: MxGraphService,
    private modelElementNamingService: ModelElementNamingService,
    private entityValueService: EntityValueService
  ) {}

  public connect(entity: Entity, source: mxCell) {
    const defaultProperty = DefaultProperty.createInstance();
    const metaModelElement = this.modelElementNamingService.resolveMetaModelElement(defaultProperty);
    const child = this.mxGraphService.renderModelElement(metaModelElement);
    const overWrittenProperty = {property: defaultProperty, keys: {}};
    entity.properties.push(overWrittenProperty);
    this.entityValueService.onNewProperty(overWrittenProperty, entity as DefaultEntity);
    this.mxGraphService.assignToParent(child, source);
    this.mxGraphService.formatCell(source);
    this.mxGraphService.formatShapes();
  }
}

@Injectable({
  providedIn: 'root',
})
export class PropertyAbstractPropertyConnectionHandler
  extends PropertyInheritanceConnector
  implements ShapeMultiConnector<DefaultProperty, DefaultAbstractProperty>
{
  constructor(
    protected mxGraphService: MxGraphService,
    protected mxGraphAttributeService: MxGraphAttributeService,
    protected languageSettingsService: LanguageSettingsService,
    private notificationService: NotificationsService
  ) {
    super(mxGraphService, mxGraphAttributeService, languageSettingsService, notificationService);
  }

  public connect(parentMetaModel: DefaultProperty, childMetaModel: DefaultAbstractProperty, parentCell: mxCell, childCell: mxCell) {
    if (this.hasEntityParent(parentCell)) {
      this.notificationsService.warning({
        title: 'No entity as parent present',
        message: 'The Property need to have as parent an Entity/Abstract Entity',
      });
      return;
    }

    if (MxGraphHelper.isEntityCycleInheritance(childCell, parentMetaModel, this.mxGraphService.graph)) {
      this.notificationService.warning({
        title: 'Recursive elements',
        message: 'Can not connect elements due to circular connection',
        timeout: 5000,
      });
    } else {
      super.connect(parentMetaModel, childMetaModel, parentCell, childCell);
    }
  }
}

@Injectable({
  providedIn: 'root',
})
export class EntityPropertyConnectionHandler implements ShapeMultiConnector<DefaultEntity, DefaultProperty> {
  constructor(private mxGraphService: MxGraphService, private entityValueService: EntityValueService) {}

  public connect(parentMetaModel: DefaultEntity, childMetaModel: DefaultProperty, parentCell: mxCell, childCell: mxCell) {
    if (!parentMetaModel.properties.find(({property}) => property.aspectModelUrn === childMetaModel.aspectModelUrn)) {
      const overWrittenProperty = {property: childMetaModel, keys: {}};
      parentMetaModel.properties.push(overWrittenProperty);
      this.entityValueService.onNewProperty(overWrittenProperty, parentMetaModel);
    }
    this.mxGraphService.assignToParent(childCell, parentCell);
  }
}

@Injectable({
  providedIn: 'root',
})
export class AbstractEntityConnectionHandler implements ShapeSingleConnector<Entity> {
  constructor(
    private mxGraphService: MxGraphService,
    private modelElementNamingService: ModelElementNamingService,
    private entityValueService: EntityValueService,
    private propertyAbstractPropertyConnector: PropertyAbstractPropertyConnectionHandler,
    private entityPropertyConnector: EntityPropertyConnectionHandler
  ) {}

  public connect(abstractEntity: DefaultAbstractEntity, source: mxCell) {
    const abstractProperty = DefaultAbstractProperty.createInstance();
    const metaModelElement = this.modelElementNamingService.resolveMetaModelElement(abstractProperty);
    const abstractPropertyCell = this.mxGraphService.renderModelElement(metaModelElement);
    const overWrittenProperty: OverWrittenProperty<DefaultAbstractProperty> = {property: abstractProperty, keys: {}};
    abstractEntity.properties.push(overWrittenProperty as any);
    this.entityValueService.onNewProperty(overWrittenProperty as any, abstractEntity);

    this.mxGraphService.assignToParent(abstractPropertyCell, source);
    this.mxGraphService.formatCell(source);

    const entities = this.mxGraphService.graph
      .getIncomingEdges(source)
      .map(edge => edge.source)
      .filter(cell => MxGraphHelper.getModelElement(cell) instanceof DefaultEntity);

    if (entities.length) {
      const newProperty = DefaultProperty.createInstance();
      const [namespace, name] = abstractProperty.aspectModelUrn.split('#');
      newProperty.aspectModelUrn = `${namespace}#[${name}]`;
      newProperty.metaModelVersion = abstractProperty.metaModelVersion;
      const newPropertyCell = this.mxGraphService.renderModelElement(newProperty);

      for (const entity of entities) {
        const entityModel: DefaultEntity = MxGraphHelper.getModelElement(entity);
        entityModel.properties.push({property: newProperty, keys: {}});
        this.entityPropertyConnector.connect(entityModel, newProperty, entity, newPropertyCell);
      }

      this.propertyAbstractPropertyConnector.connect(newProperty, abstractProperty, newPropertyCell, abstractPropertyCell);
    }

    this.mxGraphService.formatShapes();
  }
}

@Injectable({
  providedIn: 'root',
})
export class ConstraintConnectionHandler implements ShapeSingleConnector<DefaultConstraint> {
  constructor(private mxGraphService: MxGraphService, private modelElementNamingService: ModelElementNamingService) {}

  public connect(constraint: DefaultConstraint, source: mxCell) {
    const defaultCharacteristic = DefaultCharacteristic.createInstance();
    const metaModelElement = this.modelElementNamingService.resolveMetaModelElement(defaultCharacteristic);
    const child = this.mxGraphService.renderModelElement(metaModelElement);
    constraint.update(defaultCharacteristic);
    this.mxGraphService.assignToParent(child, source);
    this.mxGraphService.formatCell(source);
    this.mxGraphService.formatShapes();
  }
}

@Injectable({
  providedIn: 'root',
})
export class TraitConnectionHandler implements ShapeSingleConnector<DefaultTrait> {
  constructor(private mxGraphService: MxGraphService, private modelElementNamingService: ModelElementNamingService) {}

  public connect(trait: DefaultTrait, source: mxCell) {
    const defaultElement =
      trait.getBaseCharacteristic() == null ? DefaultCharacteristic.createInstance() : DefaultConstraint.createInstance();
    const metaModelElement = this.modelElementNamingService.resolveMetaModelElement(defaultElement);
    const child = this.mxGraphService.renderModelElement(metaModelElement);
    trait.update(defaultElement);
    this.mxGraphService.assignToParent(child, source);
    this.mxGraphService.moveCells([child], source.getGeometry().x + 30, source.getGeometry().y + 60);
    this.mxGraphService.formatCell(child);
    this.mxGraphService.formatShapes();
  }
}

@Injectable({
  providedIn: 'root',
})
export class CharacteristicConnectionHandler implements ShapeSingleConnector<Characteristic> {
  get currentCachedFile() {
    return this.namespacesCacheService.getCurrentCachedFile();
  }

  constructor(
    private mxGraphService: MxGraphService,
    private modelElementNamingService: ModelElementNamingService,
    private namespacesCacheService: NamespacesCacheService,
    private mxGraphAttributeService: MxGraphAttributeService,
    private mxGraphShapeOverlayService: MxGraphShapeOverlayService,
    private languageSettingsService: LanguageSettingsService
  ) {}

  public connect(characteristic: Characteristic, source: mxCell, modelInfo: ModelInfo) {
    if (
      ModelInfo.IS_CHARACTERISTIC_DATATYPE === modelInfo &&
      characteristic instanceof DefaultEnumeration &&
      characteristic.dataType instanceof DefaultEntity
    ) {
      // create new entity value
      const entityValue = DefaultEntityValue.createInstance();
      entityValue.entity = characteristic.dataType;
      characteristic.dataType.properties.forEach(overWrittenProperty => entityValue.addProperty(overWrittenProperty));
      entityValue.parents.push(characteristic);
      characteristic.values.push(entityValue);
      const metaModelElement = this.modelElementNamingService.resolveMetaModelElement(entityValue);
      const entityValueCell = this.mxGraphService.renderModelElement(metaModelElement);
      // connect: EntityValue - Enumeration
      this.mxGraphService.assignToParent(entityValueCell, source);
      const entityCell = this.mxGraphService.resolveCellByModelElement(entityValue.entity);
      // connect: Entity - EntityValue
      this.mxGraphService.assignToParent(entityCell, entityValueCell);
      this.mxGraphService.graph.labelChanged(source, MxGraphHelper.createPropertiesLabel(source));
      this.mxGraphService.formatShapes();
      this.currentCachedFile.resolveCachedElement(entityValue);
    } else if (ModelInfo.IS_CHARACTERISTIC_DATATYPE === modelInfo && !(characteristic.dataType instanceof DefaultEntity)) {
      // Add Entity Shape when clicking bottom plus of characteristic
      const defaultEntity = DefaultEntity.createInstance();
      characteristic.dataType = defaultEntity;

      const metaModelElement = this.modelElementNamingService.resolveMetaModelElement(defaultEntity);
      const selectedParentIncomingEdges = this.mxGraphAttributeService.graph.getIncomingEdges(source);
      selectedParentIncomingEdges.forEach(edge => {
        const edgeSource = edge.source;
        const edgeSourceMetaModelElement = MxGraphHelper.getModelElement(edgeSource);

        if (edgeSourceMetaModelElement instanceof DefaultProperty) {
          // remove example value for complex datatypes
          edgeSourceMetaModelElement.exampleValue = null;
          edgeSource['configuration'].fields = MxGraphVisitorHelper.getElementProperties(
            edgeSourceMetaModelElement,
            this.languageSettingsService
          );
          this.mxGraphAttributeService.graph.labelChanged(edgeSource, MxGraphHelper.createPropertiesLabel(edgeSource));
        }
      });
      const child = this.mxGraphService.renderModelElement(metaModelElement);
      this.mxGraphService.assignToParent(child, source);
      // add icon if we click on + button of an enumeration
      if (characteristic instanceof DefaultEnumeration) {
        this.mxGraphShapeOverlayService.removeOverlay(source, MxGraphHelper.getNewShapeOverlayButton(source));
      }
      this.mxGraphShapeOverlayService.checkComplexEnumerationOverlays(characteristic, source);

      if (characteristic instanceof DefaultEnumeration) {
        characteristic.values = [];
        this.mxGraphService.removeCellChild(source, 'values');
      }

      if (characteristic.dataType) {
        // delete child cell dataType of the parent
        this.mxGraphService.graph.labelChanged(source, MxGraphHelper.createPropertiesLabel(source));
      }
    } else {
      // Add Trait Shape when clicking upper plus of characteristic
      const selectedParent = source;
      const selectedParentMetaModel = MxGraphHelper.getModelElement(selectedParent);
      const selectedParentIncomingEdges = this.mxGraphAttributeService.graph.getIncomingEdges(source);

      // add trait
      const defaultTrait = this.modelElementNamingService.resolveElementNaming(
        DefaultTrait.createInstance(),
        RdfModelUtil.capitalizeFirstLetter(
          (selectedParentIncomingEdges.length ? selectedParentIncomingEdges[0].source.id : source.id)?.replace(/[[\]]/g, '')
        )
      );
      const traitShape = this.mxGraphService.renderModelElement(this.currentCachedFile.resolveCachedElement(defaultTrait));

      if (selectedParentIncomingEdges.length) {
        selectedParentIncomingEdges.forEach(edge => {
          const edgeSource = edge.source;
          const edgeSourceMetaModelElement = MxGraphHelper.getModelElement(edgeSource);

          if (edgeSourceMetaModelElement instanceof DefaultProperty) {
            edgeSourceMetaModelElement.characteristic = defaultTrait;
          } else if (edgeSourceMetaModelElement instanceof DefaultCollection) {
            edgeSourceMetaModelElement.elementCharacteristic = defaultTrait;
          } else if (edgeSourceMetaModelElement instanceof DefaultEither) {
            edgeSourceMetaModelElement.left === MxGraphHelper.getModelElement(edge.target)
              ? (edgeSourceMetaModelElement.left = defaultTrait) // NOSONAR
              : (edgeSourceMetaModelElement.right = defaultTrait); // NOSONAR
          } else {
            return;
          }

          selectedParentIncomingEdges.forEach(inEdge => {
            MxGraphHelper.getModelElement<Base>(inEdge.source).delete(selectedParentMetaModel);
            this.mxGraphService.removeCells([selectedParent.removeEdge(inEdge, false)]);
          });

          this.mxGraphService.assignToParent(traitShape, edgeSource);
          (<DefaultTrait>defaultTrait).baseCharacteristic = selectedParentMetaModel;
          this.mxGraphService.assignToParent(selectedParent, traitShape);
          this.mxGraphService.formatCell(edgeSource);
        });
      } else {
        (<DefaultTrait>defaultTrait).baseCharacteristic = selectedParentMetaModel;
        this.mxGraphService.assignToParent(source, traitShape);
      }
      this.addConstraint(defaultTrait, traitShape);

      const traitWithProperty = traitShape.edges?.some(edge => MxGraphHelper.getModelElement(edge.source) instanceof DefaultProperty);

      if (!traitWithProperty) {
        this.mxGraphService.moveCells([traitShape], source.getGeometry().x, source.getGeometry().y);
      }
      this.mxGraphService.formatCell(traitShape);
    }

    this.mxGraphService.formatCell(source);
    this.mxGraphService.formatShapes();
  }

  /**
   * Special case to add Trait: It will automatically create a default Constraint inside the Trait
   * and add it to the domain model.
   *
   * @param defaultTrait trait model
   * @param traitShape trait object
   */
  private addConstraint(defaultTrait: BaseMetaModelElement, traitShape: mxgraph.mxCell) {
    const defaultConstraint = this.modelElementNamingService.resolveElementNaming(DefaultConstraint.createInstance());
    const constraintShape = this.mxGraphService.renderModelElement(this.currentCachedFile.resolveCachedElement(defaultConstraint));
    (<DefaultTrait>defaultTrait).update(defaultConstraint);

    this.mxGraphService.assignToParent(constraintShape, traitShape);
  }
}

@Injectable({
  providedIn: 'root',
})
export class StructuredValueConnectionHandler implements ShapeSingleConnector<StructuredValue> {
  get currentCachedFile() {
    return this.namespacesCacheService.getCurrentCachedFile();
  }

  constructor(
    private mxGraphService: MxGraphService,
    private modelElementNamingService: ModelElementNamingService,
    private namespacesCacheService: NamespacesCacheService
  ) {}

  public connect(structuredValue: StructuredValue, source: mxgraph.mxCell) {
    const property = DefaultProperty.createInstance();
    structuredValue.elements.push({property, keys: {}});
    structuredValue.deconstructionRule = `${structuredValue.deconstructionRule}(regex)`;
    const metaModelElement = this.modelElementNamingService.resolveMetaModelElement(property);
    const propertyCell = this.mxGraphService.renderModelElement(metaModelElement);
    this.mxGraphService.assignToParent(propertyCell, source);
    this.mxGraphService.graph.labelChanged(source, MxGraphHelper.createPropertiesLabel(source));
    this.mxGraphService.formatCell(source);
    this.mxGraphService.formatShapes();
    this.currentCachedFile.resolveCachedElement(property);
  }
}

@Injectable({
  providedIn: 'root',
})
export class EntityValueConnectionHandler implements ShapeSingleConnector<DefaultEntityValue> {
  constructor(private mxGraphService: MxGraphService) {}

  public connect(entityValue: DefaultEntityValue, source: mxCell) {
    const child = this.mxGraphService.renderModelElement(entityValue);
    // connect: EntityValue - Enumeration
    if (MxGraphHelper.getModelElement(source) instanceof DefaultEnumeration) {
      this.mxGraphService.assignToParent(child, source);
    }
    const entityCell = this.mxGraphService.resolveCellByModelElement(entityValue.entity);
    // connect: EntityValue - Entity
    this.mxGraphService.assignToParent(entityCell, child);
    this.mxGraphService.formatCell(source);
    this.mxGraphService.formatShapes();
  }
}

// ==========================================================================================
// Connection classes if the connect toolbar button is clicked
// ==========================================================================================

@Injectable({
  providedIn: 'root',
})
export class AspectPropertyConnectionHandler implements ShapeMultiConnector<DefaultAspect, DefaultProperty | DefaultOperation> {
  constructor(private mxGraphService: MxGraphService) {}

  public connect(parentMetaModel: DefaultAspect, childMetaModel: DefaultProperty | DefaultOperation, parent: mxCell, child: mxCell) {
    if (childMetaModel instanceof DefaultProperty && !parentMetaModel.properties.find(({property}) => property === childMetaModel)) {
      parentMetaModel.properties.push({property: childMetaModel, keys: {}});
    } else if (childMetaModel instanceof DefaultOperation && !parentMetaModel.operations.find(operation => operation === childMetaModel)) {
      parentMetaModel.operations.push(childMetaModel);
    }
    this.mxGraphService.assignToParent(child, parent);
  }
}

@Injectable({
  providedIn: 'root',
})
export class AspectEventConnectionHandler implements ShapeMultiConnector<DefaultAspect, DefaultEvent> {
  constructor(private mxGraphService: MxGraphService) {}

  public connect(parentMetaModel: DefaultAspect, childMetaModel: DefaultEvent, parent: mxCell, child: mxCell) {
    if (!parentMetaModel.events.find(operation => operation === childMetaModel)) {
      parentMetaModel.events.push(childMetaModel);
    }
    this.mxGraphService.assignToParent(child, parent);
  }
}

@Injectable({
  providedIn: 'root',
})
export class EventPropertyConnectionHandler implements ShapeMultiConnector<DefaultEvent, DefaultProperty> {
  constructor(private mxGraphService: MxGraphService) {}

  public connect(parentMetaModel: DefaultEvent, childMetaModel: DefaultProperty, parent: mxCell, child: mxCell) {
    if (!parentMetaModel.parameters.find(param => param.property.aspectModelUrn === childMetaModel.aspectModelUrn)) {
      parentMetaModel.parameters.push({property: childMetaModel, keys: {}});
    }
    this.mxGraphService.assignToParent(child, parent);
  }
}

@Injectable({
  providedIn: 'root',
})
export class OperationPropertyInputConnectionHandler implements ShapeMultiConnectorWithProperty<DefaultOperation, DefaultProperty> {
  constructor(private mxGraphService: MxGraphService) {}

  public connect(parentMetaModel: DefaultOperation, childMetaModel: DefaultProperty, parent: mxCell, child: mxCell) {
    const isInputAlreadyDefined = parentMetaModel.input.some(value => value.property.aspectModelUrn === childMetaModel.aspectModelUrn);
    if (!isInputAlreadyDefined) {
      parentMetaModel.input.push({property: childMetaModel, keys: {}});
    }
    this.mxGraphService.assignToParent(child, parent);
  }
}

@Injectable({
  providedIn: 'root',
})
export class OperationPropertyOutputConnectionHandler implements ShapeMultiConnectorWithProperty<DefaultOperation, DefaultProperty> {
  constructor(private mxGraphService: MxGraphService, private mxGraphAttributeService: MxGraphAttributeService) {}

  public connect(parentMetaModel: DefaultOperation, childMetaModel: DefaultProperty, parent: mxCell, child: mxCell) {
    parentMetaModel.output = {property: childMetaModel, keys: {}};
    this.mxGraphService.assignToParent(child, parent);
  }
}

@Injectable({
  providedIn: 'root',
})
export class PropertyCharacteristicConnectionHandler implements ShapeMultiConnector<DefaultProperty, DefaultCharacteristic> {
  constructor(private mxGraphService: MxGraphService, private mxGraphAttributeService: MxGraphAttributeService) {}

  public connect(parentMetaModel: DefaultProperty, childMetaModel: DefaultCharacteristic, parent: mxCell, child: mxCell) {
    this.mxGraphAttributeService.graph.getOutgoingEdges(parent).forEach((outEdge: mxCell) => {
      // moves the cell being disconnected(arrow removal) in order to prevent overlapping overlays
      if (outEdge.target?.geometry?.x < ExpandedModelShape.expandedElementWidth) {
        outEdge.target.geometry.translate(ExpandedModelShape.expandedElementWidth, 0);
      }

      const targetModel = MxGraphHelper.getModelElement(outEdge.target);
      if (targetModel instanceof DefaultProperty || targetModel instanceof DefaultAbstractProperty) {
        return;
      }

      this.mxGraphService.removeCells([parent.removeEdge(outEdge, true)]);
    });

    parentMetaModel.characteristic = childMetaModel;
    this.mxGraphService.assignToParent(child, parent);
    this.mxGraphService.formatShapes();
  }
}

@Injectable({
  providedIn: 'root',
})
export class CharacteristicEntityConnectionHandler implements ShapeMultiConnector<DefaultCharacteristic, DefaultEntity> {
  get currentCachedFile() {
    return this.namespacesCacheService.getCurrentCachedFile();
  }

  constructor(
    private mxGraphService: MxGraphService,
    private mxGraphAttributeService: MxGraphAttributeService,
    private mxGraphShapeOverlayService: MxGraphShapeOverlayService,
    private languageSettingsService: LanguageSettingsService,
    private namespacesCacheService: NamespacesCacheService
  ) {}

  public connect(parentMetaModel: DefaultCharacteristic, childMetaModel: DefaultEntity, parent: mxCell, child: mxCell) {
    this.mxGraphAttributeService.graph.getOutgoingEdges(parent).forEach(outEdge => this.removeCells(outEdge, null));

    parentMetaModel.dataType = childMetaModel;
    this.mxGraphShapeOverlayService.removeOverlay(parent, MxGraphHelper.getNewShapeOverlayButton(parent));
    // add icon when you simply connect an enumeration with an entity.
    if (parentMetaModel instanceof DefaultEnumeration) {
      //TODO User should be informed if he wants to change the entity. Otherwise he deletes all values.
      if (!parentMetaModel.createdFromEditor) {
        parentMetaModel.values = [];
      }
      this.mxGraphShapeOverlayService.removeOverlay(parent, MxGraphHelper.getRightOverlayButton(parent));
      this.mxGraphService.removeCellChild(parent, 'values');
      this.mxGraphShapeOverlayService.addComplexEnumerationShapeOverlay(parent);
      this.mxGraphShapeOverlayService.addBottomShapeOverlay(parent);
    }

    this.mxGraphService.assignToParent(child, parent);
    this.mxGraphService.formatShapes();

    if (parentMetaModel.dataType) {
      MxGraphHelper.updateLabel(parent, this.mxGraphAttributeService.graph, this.languageSettingsService);
    }

    if (parentMetaModel.dataType?.isComplex()) {
      const selectedParentIncomingEdges = this.mxGraphAttributeService.graph.getIncomingEdges(parent);
      selectedParentIncomingEdges.forEach(edge => {
        const edgeSource = edge.source;
        const edgeSourceMetaModelElement = MxGraphHelper.getModelElement(edgeSource);

        if (edgeSourceMetaModelElement instanceof DefaultProperty) {
          // remove example value for complex datatypes
          edgeSourceMetaModelElement.exampleValue = null;
          edgeSource['configuration'].fields = MxGraphVisitorHelper.getElementProperties(
            edgeSourceMetaModelElement,
            this.languageSettingsService
          );
          MxGraphHelper.updateLabel(edgeSource, this.mxGraphAttributeService.graph, this.languageSettingsService);
        }
      });
    }
  }

  private removeCells(edge: mxCell, parent: mxCell) {
    const metaModel = MxGraphHelper.getModelElement(edge.target);

    if (metaModel instanceof DefaultUnit) {
      return;
    }

    // remove icon if we delete the edge between enumeration and entity.
    if (metaModel instanceof DefaultEnumeration) {
      this.mxGraphShapeOverlayService.removeComplexTypeShapeOverlays(parent);
    }

    //TODO should be defined in more detail
    if (metaModel instanceof DefaultEntityValue) {
      this.mxGraphAttributeService.graph.getOutgoingEdges(edge.target).forEach(outEdge => this.removeCells(outEdge, null));
      this.mxGraphService.removeCells([edge.target]);
      this.currentCachedFile.removeCachedElement(metaModel.aspectModelUrn);
    }

    this.mxGraphService.removeCells([edge]);
  }
}

@Injectable({
  providedIn: 'root',
})
export class TraitWithCharacteristicOrConstraintConnectionHandler
  implements ShapeMultiConnector<DefaultTrait, DefaultCharacteristic | DefaultConstraint>
{
  constructor(private mxGraphService: MxGraphService) {}

  public connect(parentMetaModel: DefaultTrait, childMetaModel: DefaultCharacteristic, parent: mxCell, child: mxCell) {
    parentMetaModel.update(childMetaModel);
    this.mxGraphService.assignToParent(child, parent);
  }
}

@Injectable({
  providedIn: 'root',
})
export class CollectionCharacteristicConnectionHandler implements ShapeMultiConnector<DefaultCollection, DefaultCharacteristic> {
  constructor(private mxGraphService: MxGraphService, private mxGraphAttributeService: MxGraphAttributeService) {}

  public connect(parentMetaModel: DefaultCollection, childMetaModel: DefaultCharacteristic, parent: mxCell, child: mxCell) {
    this.mxGraphAttributeService.graph.getOutgoingEdges(parent).forEach(outEdge => {
      if (outEdge.target && !(outEdge.target.getMetaModelElement() instanceof DefaultEntity)) {
        this.mxGraphService.removeCells([parent.removeEdge(outEdge, true)]);
      }
    });

    parentMetaModel.elementCharacteristic = childMetaModel;
    this.mxGraphService.assignToParent(child, parent);

    if (parentMetaModel.elementCharacteristic) {
      this.mxGraphService.graph.labelChanged(parent, MxGraphHelper.createPropertiesLabel(parent));
    }
  }
}

@Injectable({
  providedIn: 'root',
})
export class EitherCharacteristicLeftConnectionHandler implements ShapeMultiConnector<DefaultEither, DefaultCharacteristic> {
  constructor(private mxGraphService: MxGraphService, private mxGraphAttributeService: MxGraphAttributeService) {}

  public connect(parentMetaModel: DefaultEither, childMetaModel: DefaultCharacteristic, parent: mxCell, child: mxCell) {
    this.mxGraphAttributeService.graph.getOutgoingEdges(parent).forEach(outEdge => {
      if (outEdge.target && outEdge.target.getMetaModelElement().aspectModelUrn === parentMetaModel.left?.aspectModelUrn) {
        this.mxGraphService.removeCells([parent.removeEdge(outEdge, true)]);
      }
    });

    parentMetaModel.left = childMetaModel;
    this.mxGraphService.assignToParent(child, parent);
    this.mxGraphService.formatShapes();
  }
}

@Injectable({
  providedIn: 'root',
})
export class EitherCharacteristicRightConnectionHandler implements ShapeMultiConnector<DefaultEither, DefaultCharacteristic> {
  constructor(private mxGraphService: MxGraphService, private mxGraphAttributeService: MxGraphAttributeService) {}

  public connect(parentMetaModel: DefaultEither, childMetaModel: DefaultCharacteristic, parent: mxCell, child: mxCell) {
    this.mxGraphAttributeService.graph.getOutgoingEdges(parent).forEach(outEdge => {
      if (outEdge.target && outEdge.target.getMetaModelElement().aspectModelUrn === parentMetaModel.right?.aspectModelUrn) {
        this.mxGraphService.removeCells([parent.removeEdge(outEdge, true)]);
      }
    });

    parentMetaModel.right = childMetaModel;
    this.mxGraphService.assignToParent(child, parent);
    this.mxGraphService.formatShapes();
  }
}

@Injectable({
  providedIn: 'root',
})
export class StructuredValueCharacteristicPropertyConnectionHandler
  implements ShapeMultiConnector<DefaultStructuredValue, DefaultProperty>
{
  constructor(private mxGraphService: MxGraphService, private mxGraphAttributeService: MxGraphAttributeService) {}

  public connect(_parentMetaModel: DefaultStructuredValue, _childMetaModel: DefaultProperty, first: mxCell, second: mxCell) {
    const hasPropertyParent = this.mxGraphAttributeService.graph
      .getIncomingEdges(first)
      .some(edge => MxGraphHelper.getModelElement(edge.source) instanceof DefaultProperty);

    if (!hasPropertyParent) {
      this.mxGraphService.assignToParent(first, second);
    } else {
      this.mxGraphService.assignToParent(second, first);
    }

    this.mxGraphService.formatShapes();
  }
}

@Injectable({
  providedIn: 'root',
})
export class PropertyPropertyConnectionHandler
  extends PropertyInheritanceConnector
  implements ShapeMultiConnector<DefaultProperty, DefaultProperty>
{
  constructor(
    protected mxGraphService: MxGraphService,
    protected mxGraphAttributeService: MxGraphAttributeService,
    protected languageSettingsService: LanguageSettingsService,
    private notificationService: NotificationsService
  ) {
    super(mxGraphService, mxGraphAttributeService, languageSettingsService, notificationService);
  }

  public connect(parentMetaModel: DefaultProperty, childMetaModel: DefaultProperty, parentCell: mxCell, childCell: mxCell) {
    if (parentMetaModel.isPredefined()) {
      this.notificationsService.warning({title: "A predefined element can't have a child"});
      return;
    }

    if (this.hasEntityParent(parentCell)) {
      this.notificationsService.warning({
        title: 'No entity as parent present',
        message: 'One of the Properties/Abstract Properties need to have as parent an Entity/Abstract Entity',
      });
      return;
    }

    if (MxGraphHelper.isEntityCycleInheritance(childCell, parentMetaModel, this.mxGraphService.graph)) {
      this.notificationService.warning({
        title: 'Recursive elements',
        message: 'Can not connect elements due to circular connection',
        timeout: 5000,
      });
      return;
    }

    if (childMetaModel.extendedElement) {
      this.notificationService.warning({
        title: 'Illegal operation',
        message: 'Can not extend a Property which already extends another element',
        timeout: 5000,
      });
      return;
    }

    super.connect(parentMetaModel, childMetaModel, parentCell, childCell);
  }
}

@Injectable({
  providedIn: 'root',
})
export class AbstractPropertyAbstractPropertyConnectionHandler
  extends PropertyInheritanceConnector
  implements ShapeMultiConnector<DefaultAbstractProperty, DefaultAbstractProperty>
{
  constructor(
    protected mxGraphService: MxGraphService,
    protected mxGraphAttributeService: MxGraphAttributeService,
    protected languageSettingsService: LanguageSettingsService,
    private notificationService: NotificationsService
  ) {
    super(mxGraphService, mxGraphAttributeService, languageSettingsService, notificationService);
  }

  public connect(parentMetaModel: DefaultAbstractProperty, childMetaModel: DefaultAbstractProperty, parentCell: mxCell, childCell: mxCell) {
    if (this.hasEntityParent(parentCell)) {
      this.notificationsService.warning({
        title: 'No entity as parent present',
        message: 'One of the Abstract Properties need to have as parent an Entity/Abstract Entity',
      });
      return;
    }

    if (MxGraphHelper.isEntityCycleInheritance(childCell, parentMetaModel, this.mxGraphService.graph)) {
      this.notificationService.warning({
        title: 'Recursive elements',
        message: 'Can not connect elements due to circular connection',
        timeout: 5000,
      });
    } else {
      super.connect(parentMetaModel, childMetaModel, parentCell, childCell);
    }
  }
}

@Injectable({
  providedIn: 'root',
})
export class AbstractEntityAbstractPropertyConnectionHandler
  implements ShapeMultiConnector<DefaultAbstractEntity, DefaultAbstractProperty>
{
  constructor(
    private mxGraphService: MxGraphService,
    private entityValueService: EntityValueService,
    private propertyAbstractPropertyConnector: PropertyAbstractPropertyConnectionHandler,
    private entityPropertyConnector: EntityPropertyConnectionHandler
  ) {}

  public connect(parentMetaModel: DefaultAbstractEntity, childMetaModel: DefaultAbstractProperty, parentCell: mxCell, childCell: mxCell) {
    if (!parentMetaModel.properties.find(({property}) => property.aspectModelUrn === childMetaModel.aspectModelUrn)) {
      const overWrittenProperty = {property: childMetaModel, keys: {}};
      parentMetaModel.properties.push(overWrittenProperty as any);
      this.entityValueService.onNewProperty(overWrittenProperty as any, parentMetaModel);
    }

    const grandParents = this.mxGraphService.graph
      .getIncomingEdges(parentCell)
      .map(edge => edge.source)
      .filter(cell => MxGraphHelper.getModelElement(cell) instanceof DefaultEntity);

    for (const grandParent of grandParents) {
      const grandParentModel = MxGraphHelper.getModelElement<DefaultEntity>(grandParent);
      const alreadyExtended = grandParentModel.properties.some(
        ({property}) => property.extendedElement?.aspectModelUrn === childMetaModel.aspectModelUrn
      );

      if (alreadyExtended) {
        continue;
      }

      // creates the property which will extend the abstract property
      const property = DefaultProperty.createInstance();
      property.metaModelVersion = childMetaModel.metaModelVersion;
      const [namespace, name] = childMetaModel.aspectModelUrn.split('#');
      property.aspectModelUrn = `${namespace}#[${name}]`;
      property.extendedElement = childMetaModel;

      // adding property to its parent (entity)
      grandParentModel.properties.push({property, keys: {}});
      const propertyCell = this.mxGraphService.renderModelElement(property);

      // connecting the elements
      this.entityPropertyConnector.connect(grandParentModel, property, grandParent, propertyCell);
      this.propertyAbstractPropertyConnector.connect(property, childMetaModel, propertyCell, childCell);
    }

    this.mxGraphService.assignToParent(childCell, parentCell);
    this.mxGraphService.formatShapes();
  }
}

@Injectable({
  providedIn: 'root',
})
export class EntityEntityConnectionHandler extends EntityInheritanceConnector implements ShapeMultiConnector<DefaultEntity, DefaultEntity> {
  constructor(
    protected mxGraphService: MxGraphService,
    protected mxGraphAttributeService: MxGraphAttributeService,
    protected languageSettingsService: LanguageSettingsService,
    protected propertyAbstractPropertyConnector: PropertyAbstractPropertyConnectionHandler,
    protected entityPropertyConnector: EntityPropertyConnectionHandler,
    private notificationService: NotificationsService
  ) {
    super(
      mxGraphService,
      mxGraphAttributeService,
      languageSettingsService,
      notificationService,
      propertyAbstractPropertyConnector,
      entityPropertyConnector
    );
  }

  public connect(parentMetaModel: DefaultEntity, childMetaModel: DefaultEntity, parentCell: mxCell, childCell: mxCell) {
    if (MxGraphHelper.isEntityCycleInheritance(childCell, parentMetaModel, this.mxGraphService.graph)) {
      this.notificationService.warning({
        title: 'Recursive elements',
        message: 'Can not connect elements due to circular connection',
        timeout: 5000,
      });
      return;
    }

    super.connectWithAbstract(parentMetaModel, childMetaModel, parentCell, childCell);
    super.connect(parentMetaModel, childMetaModel, parentCell, childCell);
  }
}

@Injectable({
  providedIn: 'root',
})
export class AbstractEntityAbstractEntityConnectionHandler
  extends EntityInheritanceConnector
  implements ShapeMultiConnector<DefaultAbstractEntity, DefaultAbstractEntity>
{
  constructor(
    protected mxGraphService: MxGraphService,
    protected mxGraphAttributeService: MxGraphAttributeService,
    protected languageSettingsService: LanguageSettingsService,
    private notificationService: NotificationsService
  ) {
    super(mxGraphService, mxGraphAttributeService, languageSettingsService, notificationService);
  }

  public connect(parentMetaModel: DefaultAbstractEntity, childMetaModel: DefaultAbstractEntity, parentCell: mxCell, childCell: mxCell) {
    if (MxGraphHelper.isEntityCycleInheritance(childCell, parentMetaModel, this.mxGraphService.graph)) {
      this.notificationService.warning({
        title: 'Recursive elements',
        message: 'Can not connect elements due to circular connection',
        timeout: 5000,
      });
    } else {
      super.connect(parentMetaModel, childMetaModel, parentCell, childCell);
    }
  }
}

@Injectable({
  providedIn: 'root',
})
export class EntityAbstractEntityConnectionHandler
  extends EntityInheritanceConnector
  implements ShapeMultiConnector<DefaultAbstractEntity, DefaultEntity>
{
  constructor(
    protected mxGraphService: MxGraphService,
    protected mxGraphAttributeService: MxGraphAttributeService,
    protected languageSettingsService: LanguageSettingsService,
    protected propertyAbstractPropertyConnector: PropertyAbstractPropertyConnectionHandler,
    protected entityPropertyConnector: EntityPropertyConnectionHandler,
    private notificationService: NotificationsService
  ) {
    super(
      mxGraphService,
      mxGraphAttributeService,
      languageSettingsService,
      notificationService,
      propertyAbstractPropertyConnector,
      entityPropertyConnector
    );
  }

  public connect(parentMetaModel: DefaultEntity, childMetaModel: DefaultAbstractEntity, parent: mxCell, child: mxCell) {
    if (MxGraphHelper.isEntityCycleInheritance(child, parentMetaModel, this.mxGraphService.graph)) {
      this.notificationService.warning({
        title: 'Recursive elements',
        message: 'Can not connect elements due to circular connection',
        timeout: 5000,
      });
      return;
    }

    super.connectWithAbstract(parentMetaModel, childMetaModel, parent, child);
    super.connect(parentMetaModel, childMetaModel, parent, child);
  }
}

@Injectable({
  providedIn: 'root',
})
export class AbstractEntityPropertyConnectionHandler implements ShapeMultiConnector<DefaultAbstractEntity, DefaultProperty> {
  constructor(private mxGraphService: MxGraphService, private entityValueService: EntityValueService) {}

  public connect(parentMetaModel: DefaultAbstractEntity, childMetaModel: DefaultProperty, parentCell: mxCell, childCell: mxCell) {
    if (!parentMetaModel.properties.find(({property}) => property.aspectModelUrn === childMetaModel.aspectModelUrn)) {
      const overWrittenProperty = {property: childMetaModel, keys: {}};
      parentMetaModel.properties.push(overWrittenProperty);
      this.entityValueService.onNewProperty(overWrittenProperty, parentMetaModel);
    }
    this.mxGraphService.assignToParent(childCell, parentCell);
  }
}

@Injectable({
  providedIn: 'root',
})
export class EnumerationEntityValueConnectionHandler implements ShapeMultiConnector<DefaultEnumeration, DefaultEntityValue> {
  constructor(private mxGraphService: MxGraphService) {}

  connect(parentMetaModel: DefaultEnumeration, childMetaModel: DefaultEntityValue, parent: mxgraph.mxCell, child: mxgraph.mxCell): void {
    childMetaModel.addParent(parentMetaModel);
    parentMetaModel.values.push(childMetaModel);

    this.mxGraphService.graph.labelChanged(parent, MxGraphHelper.createPropertiesLabel(parent));
    this.mxGraphService.assignToParent(child, parent);
  }
}

@Injectable({
  providedIn: 'root',
})
export class CharacteristicUnitConnectionHandler implements ShapeMultiConnector<DefaultCharacteristic, DefaultUnit> {
  constructor(private mxGraphService: MxGraphService) {}

  public connect(parentMetaModel: DefaultCharacteristic, childMetaModel: DefaultUnit, parent: mxCell, child: mxCell) {
    if (!(parentMetaModel instanceof DefaultQuantifiable)) {
      return;
    }
    if (parentMetaModel.unit && parentMetaModel.unit !== childMetaModel) {
      const obsoleteEdge = this.mxGraphService.graph
        .getOutgoingEdges(parent)
        .find(edge => MxGraphHelper.getModelElement(edge.target) instanceof DefaultUnit);
      if ((MxGraphHelper.getModelElement(obsoleteEdge.target) as DefaultUnit).isPredefined()) {
        this.mxGraphService.graph.removeCells([obsoleteEdge.target], true);
      } else {
        this.mxGraphService.graph.removeCells([obsoleteEdge]);
      }
    }
    parentMetaModel.unit = childMetaModel;
    this.mxGraphService.assignToParent(child, parent);
  }
}
