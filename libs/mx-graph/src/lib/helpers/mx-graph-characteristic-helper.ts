import {Injectable} from '@angular/core';
import {DefaultEntityValue, EntityValueProperty} from '@bame/meta-model';
import {mxgraph} from 'mxgraph-factory';

@Injectable({
  providedIn: 'root',
})
export class MxGraphCharacteristicHelper {
  /**
   * When we delete the edge between enumeration and entity,
   * entity values or the edges between enumeration and entity value must be deleted.
   *
   * @param edge the edge between enumeration and entity.
   */
  static findObsoleteEntityValues(edge: mxgraph.mxCell): Array<mxgraph.mxCell> {
    const obsoleteCells = [];
    edge.source.edges
      .filter(enumerationEdge => enumerationEdge.target.style.includes('entityValue'))
      .forEach(enumerationEntityValueEdge => {
        // if it has more than 2 edges this entity value is referenced into another enumeration too.
        const entityValue = enumerationEntityValueEdge.target;
        if (entityValue.edges.length > 2) {
          obsoleteCells.push(enumerationEntityValueEdge);
        } else {
          obsoleteCells.push(entityValue);
        }
      });

    return obsoleteCells;
  }

  static getChildEntityValuesToDelete(entityValue: DefaultEntityValue, notInclude: DefaultEntityValue[]): DefaultEntityValue[] {
    let entityValues = [];
    entityValue.properties.forEach((prop: EntityValueProperty) => {
      if (
        prop.value instanceof DefaultEntityValue &&
        (prop.value.parents.length === 0 || !prop.value.parents) &&
        !notInclude.includes(prop.value)
      ) {
        entityValues.push(prop.value);
        notInclude.push(prop.value);
        entityValues = [...entityValues, ...this.getChildEntityValuesToDelete(prop.value, notInclude)];
      }
    });
    return entityValues;
  }
}
