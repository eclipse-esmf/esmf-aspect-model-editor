import {EntityValueService} from '@ame/editor';
import {FiltersService} from '@ame/loader-filters';
import {DefaultAbstractEntity, DefaultAbstractProperty, DefaultEntity, DefaultProperty} from '@ame/meta-model';
import {MxGraphService, MxGraphHelper} from '@ame/mx-graph';
import {Injectable} from '@angular/core';
import {MultiShapeConnector} from '../models';
import {EntityPropertyConnectionHandler} from './entity--property.service';
import {PropertyAbstractPropertyConnectionHandler} from './property--abstract-property.service';
import {mxgraph} from 'mxgraph-factory';

@Injectable({
  providedIn: 'root',
})
export class AbstractEntityAbstractPropertyConnectionHandler
  implements MultiShapeConnector<DefaultAbstractEntity, DefaultAbstractProperty>
{
  constructor(
    private mxGraphService: MxGraphService,
    private entityValueService: EntityValueService,
    private propertyAbstractPropertyConnector: PropertyAbstractPropertyConnectionHandler,
    private entityPropertyConnector: EntityPropertyConnectionHandler,
    private filtersService: FiltersService
  ) {}

  public connect(
    parentMetaModel: DefaultAbstractEntity,
    childMetaModel: DefaultAbstractProperty,
    parentCell: mxgraph.mxCell,
    childCell: mxgraph.mxCell
  ) {
    if (!parentMetaModel.properties.find(({property}) => property.aspectModelUrn === childMetaModel.aspectModelUrn)) {
      const overWrittenProperty = {property: childMetaModel, keys: {}};
      parentMetaModel.properties.push(overWrittenProperty as any);
      parentMetaModel.children.push(childMetaModel);
      this.entityValueService.onNewProperty(overWrittenProperty as any, parentMetaModel);
    }

    const grandParents = this.mxGraphService.graph
      .getIncomingEdges(parentCell)
      .map(edge => edge.source)
      .filter(cell => MxGraphHelper.getModelElement(cell) instanceof DefaultEntity);

    for (const grandParent of grandParents) {
      const grandParentElement = MxGraphHelper.getModelElement<DefaultEntity>(grandParent);
      const alreadyExtended = grandParentElement.properties.some(
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
      property.children.push(childMetaModel);

      MxGraphHelper.establishRelation(property, childMetaModel);

      // adding property to its parent (entity)
      grandParentElement.properties.push({property, keys: {}});
      MxGraphHelper.establishRelation(grandParentElement, property);

      const propertyCell = this.mxGraphService.renderModelElement(this.filtersService.createNode(property, {parent: grandParentElement}));

      // connecting the elements
      this.entityPropertyConnector.connect(grandParentElement, property, grandParent, propertyCell);
      this.propertyAbstractPropertyConnector.connect(property, childMetaModel, propertyCell, childCell);
    }

    this.mxGraphService.assignToParent(childCell, parentCell);
    this.mxGraphService.formatShapes();
  }
}
