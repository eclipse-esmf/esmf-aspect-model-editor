import {Injectable} from '@angular/core';
import {PredefinedRemove} from './predefined-remove.type';
import {mxgraph} from 'mxgraph-factory';
import {BaseMetaModelElement} from '../../aspect-meta-model';
import {MxGraphHelper, MxGraphService} from '@ame/mx-graph';
import {ModelRootService} from '../model-root.service';
import {PredefinedEntities, PredefinedProperties} from '@ame/vocabulary';

@Injectable({
  providedIn: 'root',
})
export class FileResourceRemoveService implements PredefinedRemove {
  constructor(private modelRootService: ModelRootService, private mxGraphService: MxGraphService) {}

  delete(cell: mxgraph.mxCell): boolean {
    if (!cell) {
      return false;
    }

    const modelElement = MxGraphHelper.getModelElement(cell);
    if (!this.modelRootService.isPredefined(modelElement)) {
      return false;
    }

    if (['ResourcePath', 'MimeType'].includes(modelElement.name)) {
      return this.delete(this.mxGraphService.resolveParents(cell)?.[0]);
    }

    if ([PredefinedProperties.resource, PredefinedProperties.mimeType].includes(modelElement.name as PredefinedProperties)) {
      const parent = this.mxGraphService
        .resolveParents(cell)
        .find(p => MxGraphHelper.getModelElement(p).name === PredefinedEntities.FileResource);
      return this.removeTree(parent);
    }

    if (modelElement.name === PredefinedEntities.FileResource) {
      return this.removeTree(cell);
    }

    return false;
  }

  decouple(edge: mxgraph.mxCell, source: BaseMetaModelElement): boolean {
    if ([PredefinedProperties.resource, PredefinedProperties.mimeType].includes(source.name as PredefinedProperties)) {
      const parent = this.mxGraphService
        .resolveParents(edge.source)
        .find(p => MxGraphHelper.getModelElement(p).name === PredefinedEntities.FileResource);
      return this.removeTree(parent);
    }

    if (source.name === PredefinedEntities.FileResource) {
      return this.removeTree(edge.source);
    }

    return false;
  }

  private removeTree(cell: mxgraph.mxCell): boolean {
    if (!cell) {
      return false;
    }

    const toRemove = [cell];
    const stack = this.mxGraphService.graph.getOutgoingEdges(cell).map(edge => edge.target);

    while (stack.length) {
      const lastCell = stack.pop();
      stack.push(...this.mxGraphService.graph.getOutgoingEdges(lastCell).map(edge => edge.target));
      toRemove.push(lastCell);
    }

    toRemove.forEach(c => {
      const modelElement = MxGraphHelper.getModelElement(c);
      const elementModelService = this.modelRootService.getElementModelService(modelElement);
      elementModelService?.delete(c);
    });

    return true;
  }
}
