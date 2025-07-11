/*
 * Copyright (c) 2024 Robert Bosch Manufacturing Solutions GmbH
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
import {ShapeConnectorUtil} from './shape-connector-util';

import {LoadedFilesService} from '@ame/cache';
import {ModelInfo, MxGraphAttributeService, MxGraphHelper, MxGraphShapeOverlayService} from '@ame/mx-graph';
import {NotificationsService, cellRelations} from '@ame/shared';
import {LanguageTranslationService} from '@ame/translation';
import {
  DefaultAspect,
  DefaultCharacteristic,
  DefaultEither,
  DefaultEntity,
  DefaultEntityInstance,
  DefaultEvent,
  DefaultOperation,
  DefaultProperty,
  DefaultStructuredValue,
  DefaultTrait,
  NamedElement,
} from '@esmf/aspect-model-loader';
import {environment} from 'environments/environment';
import {MultiShapeConnector, SingleShapeConnector} from './models';
import {
  AbstractEntityAbstractEntityConnectionHandler,
  AbstractEntityAbstractPropertyConnectionHandler,
  AbstractEntityPropertyConnectionHandler,
  AbstractPropertyAbstractPropertyConnectionHandler,
  AspectEventConnectionHandler,
  AspectPropertyConnectionHandler,
  CharacteristicEntityConnectionHandler,
  CharacteristicUnitConnectionHandler,
  CollectionCharacteristicConnectionHandler,
  EitherCharacteristicLeftConnectionHandler,
  EitherCharacteristicRightConnectionHandler,
  EntityAbstractEntityConnectionHandler,
  EntityEntityConnectionHandler,
  EntityPropertyConnectionHandler,
  EnumerationEntityValueConnectionHandler,
  EventPropertyConnectionHandler,
  OperationPropertyInputConnectionHandler,
  OperationPropertyOutputConnectionHandler,
  PropertyAbstractPropertyConnectionHandler,
  PropertyCharacteristicConnectionHandler,
  PropertyPropertyConnectionHandler,
  PropertyStructuredValueConnectionHandler,
  StructuredValueCharacteristicPropertyConnectionHandler,
  TraitWithCharacteristicOrConstraintConnectionHandler,
} from './multi-shape-connection-handlers';
import {
  AbstractEntityConnectionHandler,
  AspectConnectionHandler,
  CharacteristicConnectionHandler,
  EitherConnectionHandler,
  EntityConnectionHandler,
  EntityValueConnectionHandler,
  EventConnectionHandler,
  OperationConnectionHandler,
  PropertyConnectionHandler,
  StructuredValueConnectionHandler,
  TraitConnectionHandler,
} from './single-connection-handlers';
import mxCell = mxgraph.mxCell;

@Injectable({
  providedIn: 'root',
})
export class ShapeConnectorService {
  constructor(
    private notificationsService: NotificationsService,
    private mxGraphAttributeService: MxGraphAttributeService,
    private mxGraphShapeOverlayService: MxGraphShapeOverlayService,
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
    private propertyPropertyConnectionHandler: PropertyPropertyConnectionHandler,
    private propertyStructuredValueConnectionHandler: PropertyStructuredValueConnectionHandler,
    private propertyAbstractPropertyConnectionHandler: PropertyAbstractPropertyConnectionHandler,
    private abstractEntityAbstractPropertyConnectionHandler: AbstractEntityAbstractPropertyConnectionHandler,
    private abstractPropertyAbstractPropertyConnectionHandler: AbstractPropertyAbstractPropertyConnectionHandler,
    private traitConnectionHandler: TraitConnectionHandler,
    private structuredValueConnectionHandler: StructuredValueConnectionHandler,
    private entityValueConnectionHandler: EntityValueConnectionHandler,
    private enumerationEntityValueConnectionHandler: EnumerationEntityValueConnectionHandler,
    private characteristicUnitConnectionHandler: CharacteristicUnitConnectionHandler,
    private structuredValuePropertyConnectionHandler: StructuredValueCharacteristicPropertyConnectionHandler,
    private translate: LanguageTranslationService,
    private loadedFiles: LoadedFilesService,
  ) {
    if (!environment.production) {
      window['angular.shapeConnectorService'] = this;
    }
  }

  connectSelectedElements(cells?: mxgraph.mxCell[]) {
    const selectedCells = cells || [...this.mxGraphAttributeService.graph.selectionModel.cells];

    if (selectedCells.length !== 2) {
      return this.notificationsService.error({title: this.translate.language.NOTIFICATION_SERVICE.ONLY_TWO_ELEMENTS_CONNECTION});
    }

    const firstElement = selectedCells[0].style.split(';')[0];
    const secondElement = selectedCells[1].style.split(';')[0];
    const modelElements = selectedCells.map(e => MxGraphHelper.getModelElement(e));

    if (
      secondElement !== firstElement &&
      cellRelations[secondElement].includes(firstElement) &&
      !this.isConnectionException(modelElements[0], modelElements[1])
    ) {
      modelElements.reverse();
      selectedCells.reverse();
    }

    if (this.loadedFiles.isElementExtern(modelElements[0])) {
      return this.notificationsService.error({title: this.translate.language.NOTIFICATION_SERVICE.REFERNECE_CONNECTION_ERROR});
    }

    const newConnection = this.connectShapes(modelElements[0], modelElements[1], selectedCells[0], selectedCells[1]);

    if (newConnection && !(modelElements[1] instanceof DefaultEntity)) {
      this.mxGraphShapeOverlayService.removeOverlaysByConnection(modelElements[0], selectedCells[0]);
      this.mxGraphAttributeService.graph.clearSelection();
    }
  }

  createAndConnectShape(metaModel: NamedElement, source: mxCell, modelInfo: ModelInfo = ModelInfo.IS_CHARACTERISTIC) {
    if (!metaModel) {
      console.info('No cell selected with a meta model to connect.');
      return;
    }

    let connectionHandler: SingleShapeConnector<NamedElement>;

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
      case metaModel instanceof DefaultEntity && metaModel.isAbstractEntity():
        connectionHandler = this.abstractEntityConnectionHandler;
        break;
      case metaModel instanceof DefaultEntity:
        connectionHandler = this.entityConnectionHandler;
        break;
      case metaModel instanceof DefaultEntityInstance:
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
    parentModel: NamedElement,
    childModel: NamedElement,
    parentSource: mxCell,
    childSource: mxCell,
    modelInfo?: ModelInfo,
  ): boolean {
    let connectionHandler: MultiShapeConnector<NamedElement, NamedElement>;

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
        this.notificationsService.warning({
          title: 'For connecting input/output Properties use the icons below the Aspect or the edit the Operation properties via edit area',
        });
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
      case ShapeConnectorUtil.isPropertyStructuredValueConnection(parentModel, childModel):
        connectionHandler = this.propertyStructuredValueConnectionHandler;
        break;
      case ShapeConnectorUtil.isPropertyCharacteristicConnection(parentModel, childModel):
        connectionHandler = this.propertyCharacteristicConnectionHandler;
        break;
      case ShapeConnectorUtil.isCharacteristicEntityConnection(parentModel, childModel):
        if ((<DefaultCharacteristic>parentModel).isPredefined) {
          this.notificationsService.warning({title: 'The element can only be connected if the characteristic contains a class'});
          break;
        }
        if (parentModel instanceof DefaultTrait || parentModel instanceof DefaultEither) {
          this.notificationsService.warning({title: 'The elements cannot be connected'});
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
      case ShapeConnectorUtil.isPropertyPropertyConnection(parentModel, childModel):
        connectionHandler = this.propertyPropertyConnectionHandler;
        break;
      case ShapeConnectorUtil.isPropertyAbstractPropertyConnection(parentModel, childModel):
        connectionHandler = this.propertyAbstractPropertyConnectionHandler;
        break;
      case ShapeConnectorUtil.isAbstractEntityAbstractPropertyConnection(parentModel, childModel):
        connectionHandler = this.abstractEntityAbstractPropertyConnectionHandler;
        break;
      case ShapeConnectorUtil.isAbstractPropertyAbstractPropertyConnection(parentModel, childModel):
        connectionHandler = this.abstractPropertyAbstractPropertyConnectionHandler;
        break;
      case ShapeConnectorUtil.isCollectionCharacteristicConnection(parentModel, childModel):
        connectionHandler = this.collectionCharacteristicConnectionHandler;
        break;
      case ShapeConnectorUtil.isEnumerationEntityValueConnection(parentModel, childModel):
        connectionHandler = this.enumerationEntityValueConnectionHandler;
        break;
      case ShapeConnectorUtil.isCharacteristicCollectionConnection(parentModel, childModel):
        this.notificationsService.warning({title: 'Characteristics cannot be connected with collection'});
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
        this.notificationsService.warning({title: 'The elements cannot be connected'});
    }

    connectionHandler?.connect(parentModel, childModel, parentSource, childSource);

    return !!connectionHandler;
  }

  private isConnectionException(parentModel: NamedElement, childModel: NamedElement): boolean {
    return ShapeConnectorUtil.isStructuredValuePropertyConnection(parentModel, childModel);
  }
}
