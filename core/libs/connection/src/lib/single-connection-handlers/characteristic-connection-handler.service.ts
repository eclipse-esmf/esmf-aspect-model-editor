import {NamespacesCacheService} from '@ame/cache';
import {FiltersService} from '@ame/loader-filters';
import {
  Characteristic,
  ModelElementNamingService,
  DefaultEnumeration,
  DefaultEntity,
  DefaultEntityValue,
  DefaultProperty,
  DefaultTrait,
  DefaultCollection,
  DefaultEither,
  DefaultConstraint,
} from '@ame/meta-model';
import {
  MxGraphService,
  MxGraphAttributeService,
  MxGraphShapeOverlayService,
  ModelInfo,
  MxGraphHelper,
  MxGraphVisitorHelper,
} from '@ame/mx-graph';
import {RdfModelUtil} from '@ame/rdf/utils';
import {LanguageSettingsService} from '@ame/settings-dialog';
import {Injectable} from '@angular/core';
import {mxgraph} from 'mxgraph-factory';
import {SingleShapeConnector} from '../models';

@Injectable({
  providedIn: 'root',
})
export class CharacteristicConnectionHandler implements SingleShapeConnector<Characteristic> {
  get currentCachedFile() {
    return this.namespacesCacheService.currentCachedFile;
  }

  constructor(
    private mxGraphService: MxGraphService,
    private modelElementNamingService: ModelElementNamingService,
    private namespacesCacheService: NamespacesCacheService,
    private mxGraphAttributeService: MxGraphAttributeService,
    private mxGraphShapeOverlayService: MxGraphShapeOverlayService,
    private languageSettingsService: LanguageSettingsService,
    private filtersService: FiltersService
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
      DefaultTrait.createInstance(),
      RdfModelUtil.capitalizeFirstLetter((incomingEdges.length ? incomingEdges[0].source.id : source.id)?.replace(/[[\]]/g, ''))
    );

    const traitShape = this.mxGraphService.renderModelElement(
      this.filtersService.createNode(this.currentCachedFile.resolveCachedElement(defaultTrait), {
        parent: MxGraphHelper.getModelElement(source),
      })
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

        sourceElementModel.delete(currentMetaModel);
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

    const child = this.mxGraphService.renderModelElement(
      this.filtersService.createNode(metaModelElement, {parent: MxGraphHelper.getModelElement(source)})
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
  private createEntityValue(characteristic: DefaultEnumeration, source: mxgraph.mxCell): [mxgraph.mxCell, DefaultEntityValue] {
    const entityValue = DefaultEntityValue.createInstance();
    const characteristicDataType = characteristic.dataType as DefaultEntity;

    entityValue.entity = characteristicDataType;
    characteristicDataType.properties.forEach(overWrittenProperty => entityValue.addProperty(overWrittenProperty));
    entityValue.parents.push(characteristic);
    characteristic.values.push(entityValue);
    const metaModelElement = this.modelElementNamingService.resolveMetaModelElement(entityValue);
    const entityValueCell = this.mxGraphService.renderModelElement(
      this.filtersService.createNode(metaModelElement, {parent: MxGraphHelper.getModelElement(source)})
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
    const entityCell = this.mxGraphService.resolveCellByModelElement(entityValue.entity);

    // connect: Entity - EntityValue
    this.mxGraphService.assignToParent(entityCell, entityValueCell);
    this.mxGraphService.graph.labelChanged(source, MxGraphHelper.createPropertiesLabel(source));
    this.currentCachedFile.resolveCachedElement(entityValue);
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
    const defaultConstraint = this.modelElementNamingService.resolveElementNaming(DefaultConstraint.createInstance());
    const constraintShape = this.mxGraphService.renderModelElement(
      this.filtersService.createNode(this.currentCachedFile.resolveCachedElement(defaultConstraint), {
        parent: MxGraphHelper.getModelElement(traitShape),
      })
    );

    defaultTrait.update(defaultConstraint);
    this.mxGraphService.assignToParent(constraintShape, traitShape);
  }
}
