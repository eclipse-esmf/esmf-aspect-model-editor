import {FiltersService} from '@ame/loader-filters';
import {
  DefaultAspect,
  DefaultAbstractProperty,
  DefaultProperty,
  DefaultCharacteristic,
  DefaultAbstractEntity,
  DefaultEntity,
  DefaultUnit,
  DefaultConstraint,
  DefaultTrait,
  DefaultOperation,
  DefaultEvent,
} from '@ame/meta-model';
import {ModelService} from '@ame/rdf/services';
import {ElementModel} from '@ame/shared';
import {Pipe, PipeTransform} from '@angular/core';

const elementMap = {
  aspect: DefaultAspect,
  abstractProperty: DefaultAbstractProperty,
  property: DefaultProperty,
  characteristic: DefaultCharacteristic,
  abstractEntity: DefaultAbstractEntity,
  entity: DefaultEntity,
  unit: DefaultUnit,
  constraint: DefaultConstraint,
  trait: DefaultTrait,
  operation: DefaultOperation,
  event: DefaultEvent,
};

@Pipe({
  name: 'sidebarElementFilter',
})
export class SidebarElementFilter implements PipeTransform {
  constructor(private filtersService: FiltersService, private modelService: ModelService) {}

  transform(element: ElementModel) {
    const visibleElements = this.filtersService.currentFilter.visibleElements;
    if (visibleElements.length) {
      element.locked = !visibleElements.some(c => elementMap[element.type] === c && this.isDisplayed(element));
    }
    return element;
  }

  private isDisplayed(element: ElementModel): boolean {
    return !(element.type === 'aspect' && this.modelService.getLoadedAspectModel().aspect);
  }
}
