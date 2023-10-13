import {Observable} from 'rxjs';
import {BaseMetaModelElement, DefaultAbstractProperty, DefaultProperty} from '@ame/meta-model';
import {RdfModel} from '@ame/rdf/utils';
import {NamespacesCacheService} from '@ame/cache';

/**
 * Reads file via FileReader
 *
 * @param file specific file retrieved from a FileList object
 * @returns Observable with file content represented as a string
 * (completes automatically after receiving file's content)
 */
export const readFile = (file: File): Observable<string> => {
  return new Observable(observer => {
    const reader = new FileReader();
    try {
      reader.onload = () => {
        observer.next(reader.result.toString());
        observer.complete();
      };
      reader.readAsText(file);
    } catch (error) {
      console.error(`An error occurred while attempting to read "${file.name}" file:`, error);
      reader.onerror = () => observer.error(error);
    }
  });
};

/**
 * Sets a unique name for a given model element, ensuring no naming collisions in the provided RDF model.
 *
 * @param {BaseMetaModelElement} modelElement - The model element whose name should be set.
 * @param {RdfModel} rdfModel - The RDF model in which the element resides.
 * @param {NamespacesCacheService} namespaceCacheService - The service to check for namespace collisions.
 * @param {string} [name] - An optional initial name suggestion for the element.
 */
export const setUniqueElementName = (
  modelElement: BaseMetaModelElement,
  rdfModel: RdfModel,
  namespaceCacheService: NamespacesCacheService,
  name?: string
) => {
  name = name || `${modelElement.className}`.replace('Default', '');

  if (modelElement instanceof DefaultProperty || modelElement instanceof DefaultAbstractProperty) {
    name = name[0].toLowerCase() + name.substring(1);
  }

  let counter = 1;
  let tmpAspectModelUrnName: string = null;
  let tmpName: string = null;

  do {
    tmpName = `${name}${counter++}`;
    tmpAspectModelUrnName = `${rdfModel.getAspectModelUrn()}${tmpName}`;
  } while (namespaceCacheService.getElementFromNamespace(rdfModel.getAspectModelUrn(), tmpAspectModelUrnName));

  modelElement.aspectModelUrn = tmpAspectModelUrnName;
  modelElement.name = tmpName;
};
