/*
 * Copyright (c) 2026 Robert Bosch Manufacturing Solutions GmbH
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

import {LoadedFilesService} from '@ame/cache';
import {MaxGraphHelper, MaxGraphRenderer, MaxGraphShapeOverlayService, ModelInfo} from '@ame/max-graph';
import {ModelElementNamingService} from '@ame/meta-model';
import {config} from '@ame/shared';
import {useUpdater} from '@ame/utils';
import {inject, Injectable} from '@angular/core';
import {
  Characteristic,
  DefaultCollection,
  DefaultConstraint,
  DefaultEither,
  DefaultEntity,
  DefaultEntityInstance,
  DefaultEnumeration,
  DefaultProperty,
  DefaultTrait,
  ScalarValue,
} from '@esmf/aspect-model-loader';
import {Cell} from '@maxgraph/core';
import {BaseConnectionHandler} from '../base-connection-handler.service';
import {SingleShapeConnector} from '../models';

@Injectable({providedIn: 'root'})
export class CharacteristicConnectionHandler extends BaseConnectionHandler implements SingleShapeConnector<Characteristic> {
  private modelElementNamingService = inject(ModelElementNamingService);
  private maxgraphShapeOverlayService = inject(MaxGraphShapeOverlayService);
  private loadedFilesService = inject(LoadedFilesService);

  get currentCachedFile() {
    return this.loadedFilesService.currentLoadedFile.cachedFile;
  }

  public connect(characteristic: Characteristic, source: Cell, modelInfo: ModelInfo) {
    if (
      ModelInfo.IS_CHARACTERISTIC_DATATYPE === modelInfo &&
      characteristic instanceof DefaultEnumeration &&
      characteristic.dataType instanceof DefaultEntity
    ) {
      this.handleEnumeration(characteristic, source);
    } else if (ModelInfo.IS_CHARACTERISTIC_DATATYPE === modelInfo && !(characteristic.dataType instanceof DefaultEntity)) {
      this.createEntity(characteristic, source);
    } else {
      this.createTrait(source);
    }

    this.maxgraphService.formatCell(source);
    this.maxgraphService.formatShapes();
  }

  /**
   * Creates a Trait and a new Constraint and connects them with the characteristic from
   * which the plus button was clicked
   *
   * @param source maxgraph shape from which the plus button was clicked
   */
  private createTrait(source: Cell) {
    // Add Trait Shape when clicking upper plus of characteristic
    const currentMetaModel = MaxGraphHelper.getModelElement<Characteristic>(source);
    const incomingEdges = this.maxgraphAttributeService.graph.getIncomingEdges(source, null);

    // add trait
    const defaultTrait: DefaultTrait = this.elementCreator.createEmptyElement(DefaultTrait, {baseCharacteristic: currentMetaModel});

    const maxgraphRenderer = new MaxGraphRenderer(this.maxgraphService, this.maxgraphShapeOverlayService, this.sammLangService, null);
    const traitShape = maxgraphRenderer.render(
      this.filtersService.createNode(this.currentCachedFile.resolveInstance(defaultTrait), {
        parent: MaxGraphHelper.getModelElement(source),
      }),
      null,
    );

    if (incomingEdges.length) {
      incomingEdges.forEach(edge => {
        const edgeSource = edge.source;
        const sourceElementModel = MaxGraphHelper.getModelElement(edgeSource);

        if (sourceElementModel instanceof DefaultProperty) {
          sourceElementModel.characteristic = defaultTrait;
        } else if (sourceElementModel instanceof DefaultCollection) {
          sourceElementModel.elementCharacteristic = defaultTrait;
        } else if (sourceElementModel instanceof DefaultEither) {
          if (sourceElementModel.left.aspectModelUrn === MaxGraphHelper.getModelElement(edge.target).aspectModelUrn) {
            sourceElementModel.left = defaultTrait;
          } else {
            sourceElementModel.right = defaultTrait;
          }
        } else {
          return;
        }

        useUpdater(sourceElementModel).delete(currentMetaModel);
        MaxGraphHelper.removeRelation(sourceElementModel, currentMetaModel);
        this.maxgraphService.removeCells([source.removeEdge(edge, false)]);

        this.maxgraphService.assignToParent(traitShape, edgeSource);
        defaultTrait.baseCharacteristic = currentMetaModel;
        this.maxgraphService.assignToParent(source, traitShape);
        this.maxgraphService.formatCell(edgeSource);
      });
    }

    const traitWithProperty = traitShape.edges?.some(edge => MaxGraphHelper.getModelElement(edge.source) instanceof DefaultProperty);
    if (!traitWithProperty) {
      this.maxgraphService.moveCells([traitShape], source.getGeometry().x, source.getGeometry().y);
    }
    this.maxgraphService.formatCell(traitShape);
  }

  /**
   * Creates an entity and connects it with characteristic
   *
   * @param characteristic model element from which the plus button was clicked
   * @param source maxgraph shape from which the plus button was clicked
   */
  private createEntity(characteristic: Characteristic, source: Cell) {
    const defaultEntity = this.elementCreator.createEmptyElement(DefaultEntity);
    characteristic.dataType = defaultEntity;

    const selectedParentIncomingEdges = this.maxgraphAttributeService.graph.getIncomingEdges(source, null);
    selectedParentIncomingEdges.forEach(edge => {
      const edgeSource = edge.source;
      const edgeSourceMetaModelElement = MaxGraphHelper.getModelElement(edgeSource);

      if (edgeSourceMetaModelElement instanceof DefaultProperty) {
        // remove example value for complex datatypes
        edgeSourceMetaModelElement.exampleValue = null;
        this.refreshPropertiesLabel(edgeSource, edgeSourceMetaModelElement);
      }
    });

    const child = this.maxgraphService.renderModelElement(
      this.filtersService.createNode(defaultEntity, {parent: MaxGraphHelper.getModelElement(source)}),
    );

    this.maxgraphService.assignToParent(child, source);
    // add icon if we click on + button of an enumeration
    if (characteristic instanceof DefaultEnumeration) {
      this.maxgraphShapeOverlayService.removeOverlay(source, MaxGraphHelper.getNewShapeOverlayButton(source));
      characteristic.values = [];
    }
    this.maxgraphShapeOverlayService.checkComplexEnumerationOverlays(characteristic, source);

    if (characteristic.dataType) {
      // delete child cell dataType of the parent
      this.maxgraphService.graph.labelChanged(source, MaxGraphHelper.createPropertiesLabel(source), null);
    }
  }

  /**
   *
   * @param characteristic model element from which the plus button was clicked
   * @param source maxgraph shape from which the plus button was clicked
   * @returns a cell and model element for newly created Entity Value
   */
  private createEntityValue(characteristic: DefaultEnumeration, source: Cell): [Cell, DefaultEntityInstance] {
    const entityValue = new DefaultEntityInstance({
      name: 'entityInstance',
      metaModelVersion: config.currentSammVersion,
      aspectModelUrn: `${this.loadedFilesService.currentLoadedFile.namespace}#entityInstance`,
    });
    const characteristicDataType = characteristic.dataType as DefaultEntity;

    entityValue.type = characteristicDataType;
    characteristicDataType.properties.forEach(property =>
      entityValue.setAssertion(property.aspectModelUrn, new ScalarValue({value: '', type: property.characteristic?.dataType})),
    );
    entityValue.parents.push(characteristic);
    characteristic.values.push(entityValue);
    const metaModelElement = this.modelElementNamingService.resolveMetaModelElement(entityValue);
    const entityValueCell = this.maxgraphService.renderModelElement(
      this.filtersService.createNode(metaModelElement, {parent: MaxGraphHelper.getModelElement(source)}),
    );

    return [entityValueCell, entityValue];
  }

  /**
   * Creates a new Entity Value and connects it with Entity and Enumeration
   *
   * @param characteristic model element from which the plus button was clicked
   * @param source maxgraph shape from which the plus button was clicked
   */
  private handleEnumeration(characteristic: DefaultEnumeration, source: Cell) {
    // create new entity value
    const [entityValueCell, entityValue] = this.createEntityValue(characteristic, source);

    // connect: EntityValue - Enumeration
    this.maxgraphService.assignToParent(entityValueCell, source);
    const entityCell = this.maxgraphService.resolveCellByModelElement(entityValue.type);

    // connect: Entity - EntityValue
    this.maxgraphService.assignToParent(entityCell, entityValueCell);
    this.maxgraphService.graph.labelChanged(source, MaxGraphHelper.createPropertiesLabel(source), null);
    this.currentCachedFile.resolveInstance(entityValue);
    this.maxgraphService.formatShapes();
  }

  /**
   * Special case to add Trait: It will automatically create a default Constraint inside the Trait
   * and add it to the domain model.
   *
   * @param defaultTrait trait model
   * @param traitShape trait object
   */
  private addConstraint(defaultTrait: DefaultTrait, traitShape: Cell) {
    const defaultConstraint = this.elementCreator.createEmptyElement(DefaultConstraint);
    const constraintShape = this.maxgraphService.renderModelElement(
      this.filtersService.createNode(this.currentCachedFile.resolveInstance(defaultConstraint), {
        parent: MaxGraphHelper.getModelElement(traitShape),
      }),
    );

    useUpdater(defaultTrait).update(defaultConstraint);
    this.maxgraphService.assignToParent(constraintShape, traitShape);
  }
}
