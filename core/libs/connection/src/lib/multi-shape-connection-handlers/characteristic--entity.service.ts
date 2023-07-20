import {NamespacesCacheService} from '@ame/cache';
import {DefaultCharacteristic, DefaultEntity, DefaultEnumeration, DefaultProperty, DefaultUnit, DefaultEntityValue} from '@ame/meta-model';
import {MxGraphService, MxGraphAttributeService, MxGraphShapeOverlayService, MxGraphHelper, MxGraphVisitorHelper} from '@ame/mx-graph';
import {LanguageSettingsService} from '@ame/settings-dialog';
import {Injectable} from '@angular/core';
import {MultiShapeConnector} from '../models';
import {mxgraph} from 'mxgraph-factory';

@Injectable({
  providedIn: 'root',
})
export class CharacteristicEntityConnectionHandler implements MultiShapeConnector<DefaultCharacteristic, DefaultEntity> {
  get currentCachedFile() {
    return this.namespacesCacheService.currentCachedFile;
  }

  constructor(
    private mxGraphService: MxGraphService,
    private mxGraphAttributeService: MxGraphAttributeService,
    private mxGraphShapeOverlayService: MxGraphShapeOverlayService,
    private languageSettingsService: LanguageSettingsService,
    private namespacesCacheService: NamespacesCacheService
  ) {}

  public connect(parentMetaModel: DefaultCharacteristic, childMetaModel: DefaultEntity, parent: mxgraph.mxCell, child: mxgraph.mxCell) {
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
      this.mxGraphShapeOverlayService.addComplexEnumerationShapeOverlay(parent);
      this.mxGraphShapeOverlayService.addBottomShapeOverlay(parent);
    }

    if (parentMetaModel.dataType) {
      MxGraphHelper.updateLabel(parent, this.mxGraphAttributeService.graph, this.languageSettingsService);
    }

    if (parentMetaModel.dataType?.isComplex()) {
      const parentIncomingEdges = this.mxGraphAttributeService.graph.getIncomingEdges(parent);
      parentIncomingEdges.forEach(edge => {
        const edgeSourceMetaModelElement = MxGraphHelper.getModelElement(edge.source);

        if (edgeSourceMetaModelElement instanceof DefaultProperty) {
          // remove example value for complex datatypes
          edgeSourceMetaModelElement.exampleValue = null;
          edge.source['configuration'].fields = MxGraphVisitorHelper.getElementProperties(
            edgeSourceMetaModelElement,
            this.languageSettingsService
          );
          MxGraphHelper.updateLabel(edge.source, this.mxGraphAttributeService.graph, this.languageSettingsService);
        }
      });
    }

    this.mxGraphService.assignToParent(child, parent);
    this.mxGraphService.formatShapes();
  }

  private removeCells(edge: mxgraph.mxCell, parent: mxgraph.mxCell) {
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
      for (const child of metaModel.children) {
        MxGraphHelper.removeRelation(metaModel, child);
      }

      this.mxGraphAttributeService.graph.getOutgoingEdges(edge.target).forEach(outEdge => this.removeCells(outEdge, null));
      this.mxGraphService.removeCells([edge.target]);
      this.currentCachedFile.removeCachedElement(metaModel.aspectModelUrn);
    }

    const parentModel = MxGraphHelper.getModelElement(edge.source);
    MxGraphHelper.removeRelation(parentModel, metaModel);
    this.mxGraphService.removeCells([edge]);
  }
}
