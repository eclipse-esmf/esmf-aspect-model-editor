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
import {Injectable} from '@angular/core';
import {mxgraph} from 'mxgraph-factory';
import {
  AbstractEntityAbstractEntityConnectionHandler,
  AbstractEntityConnectionHandler,
  AbstractEntityPropertyConnectionHandler,
  AspectConnectionHandler,
  AspectEventConnectionHandler,
  AspectPropertyConnectionHandler,
  CharacteristicConnectionHandler,
  CharacteristicEntityConnectionHandler,
  CharacteristicUnitConnectionHandler,
  CollectionCharacteristicConnectionHandler,
  EitherCharacteristicLeftConnectionHandler,
  EitherCharacteristicRightConnectionHandler,
  EitherConnectionHandler,
  EntityAbstractEntityConnectionHandler,
  EntityConnectionHandler,
  EntityEntityConnectionHandler,
  EntityPropertyConnectionHandler,
  EntityValueConnectionHandler,
  EnumerationEntityValueConnectionHandler,
  EventConnectionHandler,
  EventPropertyConnectionHandler,
  OperationConnectionHandler,
  OperationPropertyInputConnectionHandler,
  OperationPropertyOutputConnectionHandler,
  PropertyCharacteristicConnectionHandler,
  PropertyConnectionHandler,
  ShapeMultiConnector,
  ShapeSingleConnector,
  StructuredValueCharacteristicPropertyConnectionHandler,
  StructuredValueConnectionHandler,
  TraitConnectionHandler,
  TraitWithCharacteristicOrConstraintConnectionHandler,
} from './shape-connection-handler';
import {ShapeConnectorUtil} from './shape-connector-util';
import {
  BaseMetaModelElement,
  DefaultAbstractEntity,
  DefaultAspect,
  DefaultCharacteristic,
  DefaultEither,
  DefaultEntity,
  DefaultEntityValue,
  DefaultEvent,
  DefaultOperation,
  DefaultProperty,
  DefaultStructuredValue,
  DefaultTrait,
} from '@ame/meta-model';
import {environment} from 'environments/environment';
import {LogService, NotificationsService} from '@ame/shared';
import {ModelInfo} from '@ame/mx-graph';
import mxCell = mxgraph.mxCell;

@Injectable({
  providedIn: 'root',
})
export class ShapeConnectorService {
  constructor(
    private logService: LogService,
    private notificationsService: NotificationsService,
    private aspectConnectionHandler: AspectConnectionHandler,
    private propertyConnectionHandler: PropertyConnectionHandler,
    private operationConnectionHandler: OperationConnectionHandler,
    private eitherConnectionHandler: EitherConnectionHandler,
    private characteristicConnectionHandler: CharacteristicConnectionHandler,
    private entityConnectionHandler: EntityConnectionHandler,
    private abstractEntityConnectionHandler: AbstractEntityConnectionHandler,
    private eventConnectionHandler: EventConnectionHandler,
    private aspectPropertyConnectionHandler: AspectPropertyConnectionHandler,
    private aspectEventConnectionHandler: AspectEventConnectionHandler,
    private eventPropertyConnectionHandler: EventPropertyConnectionHandler,
    private operationPropertyInputConnectionHandler: OperationPropertyInputConnectionHandler,
    private operationPropertyOutputConnectionHandler: OperationPropertyOutputConnectionHandler,
    private eitherCharacteristicLeftConnectionHandler: EitherCharacteristicLeftConnectionHandler,
    private eitherCharacteristicRightConnectionHandler: EitherCharacteristicRightConnectionHandler,
    private propertyCharacteristicConnectionHandler: PropertyCharacteristicConnectionHandler,
    private characteristicEntityConnectionHandler: CharacteristicEntityConnectionHandler,
    private traitWithCharacteristicOrConstraintConnectionHandler: TraitWithCharacteristicOrConstraintConnectionHandler,
    private collectionCharacteristicConnectionHandler: CollectionCharacteristicConnectionHandler,
    private entityPropertyConnectionHandler: EntityPropertyConnectionHandler,
    private entityEntityConnectionHandler: EntityEntityConnectionHandler,
    private abstractEntityAbstractEntityConnectionHandler: AbstractEntityAbstractEntityConnectionHandler,
    private entityAbstractEntityConnectionHandler: EntityAbstractEntityConnectionHandler,
    private abstractEntityPropertyConnectionHandler: AbstractEntityPropertyConnectionHandler,
    private traitConnectionHandler: TraitConnectionHandler,
    private structuredValueConnectionHandler: StructuredValueConnectionHandler,
    private entityValueConnectionHandler: EntityValueConnectionHandler,
    private enumerationEntityValueConnectionHandler: EnumerationEntityValueConnectionHandler,
    private characteristicUnitConnectionHandler: CharacteristicUnitConnectionHandler,
    private structuredValuePropertyConnectionHandler: StructuredValueCharacteristicPropertyConnectionHandler
  ) {
    if (!environment.production) {
      window['angular.shapeConnectorService'] = this;
    }
  }

  createAndConnectShape(metaModel: BaseMetaModelElement, source: mxCell, modelInfo: ModelInfo = ModelInfo.IS_CHARACTERISTIC) {
    if (!metaModel) {
      this.logService.logInfo('No cell selected with a meta model to connect.');
      return;
    }

    let connectionHandler: ShapeSingleConnector<BaseMetaModelElement>;

    switch (true) {
      case metaModel instanceof DefaultAspect:
        connectionHandler = this.aspectConnectionHandler;
        break;
      case metaModel instanceof DefaultProperty:
        connectionHandler = this.propertyConnectionHandler;
        break;
      case metaModel instanceof DefaultEither:
        connectionHandler = this.eitherConnectionHandler;
        break;
      case metaModel instanceof DefaultOperation:
        connectionHandler = this.operationConnectionHandler;
        break;
      case metaModel instanceof DefaultStructuredValue:
        connectionHandler = this.structuredValueConnectionHandler;
        break;
      case metaModel instanceof DefaultTrait:
        connectionHandler = this.traitConnectionHandler;
        break;
      case metaModel instanceof DefaultCharacteristic:
        connectionHandler = this.characteristicConnectionHandler;
        break;
      case metaModel instanceof DefaultEntity:
        connectionHandler = this.entityConnectionHandler;
        break;
      case metaModel instanceof DefaultAbstractEntity:
        connectionHandler = this.abstractEntityConnectionHandler;
        break;
      case metaModel instanceof DefaultEntityValue:
        connectionHandler = this.entityValueConnectionHandler;
        break;
      case metaModel instanceof DefaultEvent:
        connectionHandler = this.eventConnectionHandler;
        break;
      default:
        throw new Error(`No shape connector found for ${metaModel.aspectModelUrn}`);
    }

    connectionHandler.connect(metaModel, source, modelInfo);
  }

  connectShapes(
    parentModel: BaseMetaModelElement,
    childModel: BaseMetaModelElement,
    parentSource: mxCell,
    childSource: mxCell,
    modelInfo?: ModelInfo
  ): boolean {
    let connectionHandler: ShapeMultiConnector<BaseMetaModelElement, BaseMetaModelElement>;

    switch (true) {
      case ShapeConnectorUtil.isAspectPropertyConnection(parentModel, childModel):
        connectionHandler = this.aspectPropertyConnectionHandler;
        break;
      case ShapeConnectorUtil.isOperationPropertyInputConnection(parentModel, childModel, modelInfo):
        connectionHandler = this.operationPropertyInputConnectionHandler;
        break;
      case ShapeConnectorUtil.isOperationPropertyOutputConnection(parentModel, childModel, modelInfo):
        connectionHandler = this.operationPropertyOutputConnectionHandler;
        break;
      case ShapeConnectorUtil.isOperationPropertyConnection(parentModel, childModel) ||
        ShapeConnectorUtil.isPropertyOperationConnection(parentModel, childModel):
        this.notificationsService.warning(
          'For connecting input/output Properties use the icons below the Aspect or the edit the Operation properties via edit area'
        );
        break;
      case ShapeConnectorUtil.isEitherCharacteristicLeftConnection(parentModel, childModel, modelInfo):
        connectionHandler = this.eitherCharacteristicLeftConnectionHandler;
        break;
      case ShapeConnectorUtil.isEitherCharacteristicRightConnection(parentModel, childModel, modelInfo):
        connectionHandler = this.eitherCharacteristicRightConnectionHandler;
        break;
      case ShapeConnectorUtil.isTraitCharacteristicConnectionValid(parentModel, childModel):
        connectionHandler = this.traitWithCharacteristicOrConstraintConnectionHandler;
        break;
      case ShapeConnectorUtil.isTraitConstraintConnection(parentModel, childModel):
        connectionHandler = this.traitWithCharacteristicOrConstraintConnectionHandler;
        break;
      case ShapeConnectorUtil.isStructuredValuePropertyConnection(parentModel, childModel):
        connectionHandler = this.structuredValuePropertyConnectionHandler;
        break;
      case ShapeConnectorUtil.isPropertyCharacteristicConnection(parentModel, childModel):
        connectionHandler = this.propertyCharacteristicConnectionHandler;
        break;
      case ShapeConnectorUtil.isCharacteristicEntityConnection(parentModel, childModel):
        if ((<DefaultCharacteristic>parentModel).isPredefined()) {
          this.notificationsService.warning('The element can only be connected if the characteristic contains a class');
          break;
        }
        if (parentModel instanceof DefaultTrait || parentModel instanceof DefaultEither) {
          this.notificationsService.warning('The elements cannot be connected');
          break;
        }
        connectionHandler = this.characteristicEntityConnectionHandler;
        break;
      case ShapeConnectorUtil.isEntityPropertyConnection(parentModel, childModel):
        connectionHandler = this.entityPropertyConnectionHandler;
        break;
      case ShapeConnectorUtil.isEntityEntityConnection(parentModel, childModel):
        connectionHandler = this.entityEntityConnectionHandler;
        break;
      case ShapeConnectorUtil.isAbstractEntityAbstractEntityConnection(parentModel, childModel):
        connectionHandler = this.abstractEntityAbstractEntityConnectionHandler;
        break;
      case ShapeConnectorUtil.isEntityAbstractEntityConnection(parentModel, childModel):
        connectionHandler = this.entityAbstractEntityConnectionHandler;
        break;
      case ShapeConnectorUtil.isAbstractEntityPropertyConnection(parentModel, childModel):
        connectionHandler = this.abstractEntityPropertyConnectionHandler;
        break;
      case ShapeConnectorUtil.isCollectionCharacteristicConnection(parentModel, childModel):
        connectionHandler = this.collectionCharacteristicConnectionHandler;
        break;
      case ShapeConnectorUtil.isEnumerationEntityValueConnection(parentModel, childModel):
        connectionHandler = this.enumerationEntityValueConnectionHandler;
        break;
      case ShapeConnectorUtil.isCharacteristicCollectionConnection(parentModel, childModel):
        this.notificationsService.warning('Characteristics cannot be connected with collection');
        break;
      case ShapeConnectorUtil.isCharacteristicUnitConnection(parentModel, childModel):
        connectionHandler = this.characteristicUnitConnectionHandler;
        break;
      case ShapeConnectorUtil.isAspectEventConnection(parentModel, childModel):
        connectionHandler = this.aspectEventConnectionHandler;
        break;
      case ShapeConnectorUtil.isEventPropertyConnection(parentModel, childModel):
        connectionHandler = this.eventPropertyConnectionHandler;
        break;
      default:
        this.notificationsService.warning('The elements cannot be connected');
    }

    connectionHandler?.connect(parentModel, childModel, parentSource, childSource);

    return !!connectionHandler;
  }
}
