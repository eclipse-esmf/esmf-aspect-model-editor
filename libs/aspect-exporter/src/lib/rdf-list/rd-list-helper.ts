import {DefaultProperty, DefaultStructuredValue, Type} from '@bame/meta-model';
import {DataFactory} from 'n3';
import {ListElement, ListElementType, OverWrittenListElement, ResolvedListElements, SourceElementType} from '.';

export class RdfListHelper {
  static resolveNewElements(source: SourceElementType & {dataType?: Type}, elements: ListElementType[]): ResolvedListElements {
    const overWrittenListElements: OverWrittenListElement[] = [];
    const listElements = elements.map(metaModelElement => {
      const {keys, property} = metaModelElement || {};
      if (property instanceof DefaultProperty && (keys?.optional || keys?.notInPayload || keys?.payloadName)) {
        const blankNode = DataFactory.blankNode();
        overWrittenListElements.push({
          metaModelElement,
          blankNode,
        });
        return blankNode;
      }

      const modelElement = property || metaModelElement;
      if (modelElement.aspectModelUrn) {
        return DataFactory.namedNode(modelElement.aspectModelUrn);
      } else if (modelElement?.value) {
        return DataFactory.namedNode(modelElement?.value);
      }

      return DataFactory.literal(
        modelElement,
        source.dataType && !(source instanceof DefaultStructuredValue) ? DataFactory.namedNode(source.dataType.getUrn()) : undefined
      );
    });

    return {
      listElements,
      overWrittenListElements,
    };
  }

  static getElementValue(element: ListElementType) {
    return element?.aspectModelUrn || element?.property?.aspectModelUrn || element?.value || element;
  }

  static filterDuplicates(elements: ListElementType[], exitingElements: ListElement[]) {
    return elements.filter(e => !exitingElements.find(({node, name}) => (name ? name : node.value) === RdfListHelper.getElementValue(e)));
  }
}
