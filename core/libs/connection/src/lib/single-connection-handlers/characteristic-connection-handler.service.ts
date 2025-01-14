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

import {LoadedFilesService} from '@ame/cache';
import {FiltersService} from '@ame/loader-filters';
import {ModelElementNamingService} from '@ame/meta-model';
import {
  ModelInfo,
  MxGraphAttributeService,
  MxGraphHelper,
  MxGraphService,
  MxGraphShapeOverlayService,
  MxGraphVisitorHelper,
} from '@ame/mx-graph';
import {RdfModelUtil} from '@ame/rdf/utils';
import {SammLanguageSettingsService} from '@ame/settings-dialog';
import {ElementCreatorService, config} from '@ame/shared';
import {useUpdater} from '@ame/utils';
import {Injectable} from '@angular/core';
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
} from '@esmf/aspect-model-loader';
import {ScalarValue} from 'libs/aspect-model-loader/src/lib/aspect-meta-model/scalar-value';
import {mxgraph} from 'mxgraph-factory';
import {SingleShapeConnector} from '../models';

@Injectable({
  providedIn: 'root',
})
export class CharacteristicConnectionHandler implements SingleShapeConnector<Characteristic> {
  get currentCachedFile() {
    return this.loadedFiles.currentLoadedFile.cachedFile;
  }

  constructor(
    private mxGraphService: MxGraphService,
    private modelElementNamingService: ModelElementNamingService,
    private mxGraphAttributeService: MxGraphAttributeService,
    private mxGraphShapeOverlayService: MxGraphShapeOverlayService,
    private sammLangService: SammLanguageSettingsService,
    private filtersService: FiltersService,
    private loadedFiles: LoadedFilesService,
    private elementCreator: ElementCreatorService,
  ) {}

  public connect(characteristic: Characteristic, source: mxgraph.mxCell, modelInfo: ModelInfo) {
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

    this.mxGraphService.formatCell(source);
    this.mxGraphService.formatShapes();
  }

  /**
   * Creates a Trait and a new Constraint and connects them with the characteristic from
   * which the plus button was clicked
   *
   * @param source mxgraph shape from which the plus button was clicked
   */
  private createTrait(source: mxgraph.mxCell) {
    // Add Trait Shape when clicking upper plus of characteristic
    const currentMetaModel = MxGraphHelper.getModelElement<Characteristic>(source);
    const incomingEdges = this.mxGraphAttributeService.graph.getIncomingEdges(source);

    // add trait
    const defaultTrait: DefaultTrait = this.modelElementNamingService.resolveElementNaming(
      this.elementCreator.createEmptyElement(DefaultTrait),
      RdfModelUtil.capitalizeFirstLetter((incomingEdges.length ? incomingEdges[0].source.id : source.id)?.replace(/[[\]]/g, '')),
    );

    const traitShape = this.mxGraphService.renderModelElement(
      this.filtersService.createNode(this.currentCachedFile.resolveInstance(defaultTrait), {
        parent: MxGraphHelper.getModelElement(source),
      }),
    );

    if (incomingEdges.length) {
      incomingEdges.forEach(edge => {
        const edgeSource = edge.source;
        const sourceElementModel = MxGraphHelper.getModelElement(edgeSource);

        if (sourceElementModel instanceof DefaultProperty) {
          sourceElementModel.characteristic = defaultTrait;
        } else if (sourceElementModel instanceof DefaultCollection) {
          sourceElementModel.elementCharacteristic = defaultTrait;
        } else if (sourceElementModel instanceof DefaultEither) {
          sourceElementModel.left.aspectModelUrn === MxGraphHelper.getModelElement(edge.target).aspectModelUrn
            ? (sourceElementModel.left = defaultTrait) // NOSONAR
            : (sourceElementModel.right = defaultTrait); // NOSONAR
        } else {
          return;
        }

        useUpdater(sourceElementModel).delete(currentMetaModel);
        MxGraphHelper.removeRelation(sourceElementModel, currentMetaModel);
        this.mxGraphService.removeCells([source.removeEdge(edge, false)]);

        this.mxGraphService.assignToParent(traitShape, edgeSource);
        defaultTrait.baseCharacteristic = currentMetaModel;
        this.mxGraphService.assignToParent(source, traitShape);
        this.mxGraphService.formatCell(edgeSource);
      });
    } else {
      defaultTrait.baseCharacteristic = currentMetaModel;
      this.mxGraphService.assignToParent(source, traitShape);
    }

    this.addConstraint(defaultTrait, traitShape);

    const traitWithProperty = traitShape.edges?.some(edge => MxGraphHelper.getModelElement(edge.source) instanceof DefaultProperty);
    if (!traitWithProperty) {
      this.mxGraphService.moveCells([traitShape], source.getGeometry().x, source.getGeometry().y);
    }
    this.mxGraphService.formatCell(traitShape);
  }

  /**
   * Creates an entity and connects it with characteristic
   *
   * @param characteristic model element from which the plus button was clicked
   * @param source mxgraph shape from which the plus button was clicked
   */
  private createEntity(characteristic: Characteristic, source: mxgraph.mxCell) {
    const defaultEntity = this.elementCreator.createEmptyElement(DefaultEntity);
    characteristic.dataType = defaultEntity;

    const metaModelElement = this.modelElementNamingService.resolveMetaModelElement(defaultEntity);
    const selectedParentIncomingEdges = this.mxGraphAttributeService.graph.getIncomingEdges(source);
    selectedParentIncomingEdges.forEach(edge => {
      const edgeSource = edge.source;
      const edgeSourceMetaModelElement = MxGraphHelper.getModelElement(edgeSource);

      if (edgeSourceMetaModelElement instanceof DefaultProperty) {
        // remove example value for complex datatypes
        edgeSourceMetaModelElement.exampleValue = null;
        edgeSource['configuration'].fields = MxGraphVisitorHelper.getElementProperties(edgeSourceMetaModelElement, this.sammLangService);
        this.mxGraphAttributeService.graph.labelChanged(edgeSource, MxGraphHelper.createPropertiesLabel(edgeSource));
      }
    });

    const child = this.mxGraphService.renderModelElement(
      this.filtersService.createNode(metaModelElement, {parent: MxGraphHelper.getModelElement(source)}),
    );

    this.mxGraphService.assignToParent(child, source);
    // add icon if we click on + button of an enumeration
    if (characteristic instanceof DefaultEnumeration) {
      this.mxGraphShapeOverlayService.removeOverlay(source, MxGraphHelper.getNewShapeOverlayButton(source));
      characteristic.values = [];
    }
    this.mxGraphShapeOverlayService.checkComplexEnumerationOverlays(characteristic, source);

    if (characteristic.dataType) {
      // delete child cell dataType of the parent
      this.mxGraphService.graph.labelChanged(source, MxGraphHelper.createPropertiesLabel(source));
    }
  }

  /**
   *
   * @param characteristic model element from which the plus button was clicked
   * @param source mxgraph shape from which the plus button was clicked
   * @returns a cell and model element for newly created Entity Value
   */
  private createEntityValue(characteristic: DefaultEnumeration, source: mxgraph.mxCell): [mxgraph.mxCell, DefaultEntityInstance] {
    const entityValue = new DefaultEntityInstance({
      name: 'entityInstance',
      metaModelVersion: config.currentSammVersion,
      aspectModelUrn: `${this.loadedFiles.currentLoadedFile.namespace}#entityInstance`,
    });
    const characteristicDataType = characteristic.dataType as DefaultEntity;

    entityValue.type = characteristicDataType;
    characteristicDataType.properties.forEach(property =>
      entityValue.setAssertion(property.aspectModelUrn, new ScalarValue({value: '', type: property.characteristic?.dataType})),
    );
    entityValue.parents.push(characteristic);
    characteristic.values.push(entityValue);
    const metaModelElement = this.modelElementNamingService.resolveMetaModelElement(entityValue);
    const entityValueCell = this.mxGraphService.renderModelElement(
      this.filtersService.createNode(metaModelElement, {parent: MxGraphHelper.getModelElement(source)}),
    );

    return [entityValueCell, entityValue];
  }

  /**
   * Creates a new Entity Value and connects it with Entity and Enumeration
   *
   * @param characteristic model element from which the plus button was clicked
   * @param source mxgraph shape from which the plus button was clicked
   */
  private handleEnumeration(characteristic: DefaultEnumeration, source: mxgraph.mxCell) {
    // create new entity value
    const [entityValueCell, entityValue] = this.createEntityValue(characteristic, source);

    // connect: EntityValue - Enumeration
    this.mxGraphService.assignToParent(entityValueCell, source);
    const entityCell = this.mxGraphService.resolveCellByModelElement(entityValue.type);

    // connect: Entity - EntityValue
    this.mxGraphService.assignToParent(entityCell, entityValueCell);
    this.mxGraphService.graph.labelChanged(source, MxGraphHelper.createPropertiesLabel(source));
    this.currentCachedFile.resolveInstance(entityValue);
    this.mxGraphService.formatShapes();
  }

  /**
   * Special case to add Trait: It will automatically create a default Constraint inside the Trait
   * and add it to the domain model.
   *
   * @param defaultTrait trait model
   * @param traitShape trait object
   */
  private addConstraint(defaultTrait: DefaultTrait, traitShape: mxgraph.mxCell) {
    const defaultConstraint = this.modelElementNamingService.resolveElementNaming(
      this.elementCreator.createEmptyElement(DefaultConstraint),
    );
    const constraintShape = this.mxGraphService.renderModelElement(
      this.filtersService.createNode(this.currentCachedFile.resolveInstance(defaultConstraint), {
        parent: MxGraphHelper.getModelElement(traitShape),
      }),
    );

    useUpdater(defaultTrait).update(defaultConstraint);
    this.mxGraphService.assignToParent(constraintShape, traitShape);
  }
}
