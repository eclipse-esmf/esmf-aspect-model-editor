/*
 *  Copyright (c) 2021 Robert Bosch Manufacturing Solutions GmbH, Germany. All rights reserved.
 */
import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {ElementModel} from '@bame/shared';

@Component({
  selector: 'bci-sidebar-namespace-elements',
  styleUrls: ['./sidebar-namespace-elements.component.scss'],
  templateUrl: './sidebar-namespace-elements.component.html',
})
export class SidebarNamespaceElementsComponent implements OnChanges {
  @Input() public namespace: string;
  @Input() public elements: ElementModel[];

  public filteredElements: ElementModel[];
  public elementsTypes = [
    {name: 'Properties', type: 'property', elements: []},
    {name: 'Operations', type: 'operation', elements: []},
    {name: 'Characteristics', type: 'characteristic', elements: []},
    {name: 'Entities', type: 'entity', elements: []},
    {name: 'Traits', type: 'trait', elements: []},
    {name: 'Constraints', type: 'constraint', elements: []},
    {name: 'Unit', type: 'unit', elements: []},
    {name: 'Event', type: 'event', elements: []}
  ];

  get fileName(): string {
    const namespaceParts = this.namespace.split(':');
    return namespaceParts[namespaceParts.length - 1];
  }

  public ngOnChanges(changes: SimpleChanges) {
    if (changes.hasOwnProperty('elements')) {
      this.filterElements(this.elements);
    }
  }

  public filterElements(elements: ElementModel[]) {
    this.filteredElements = elements;
    for (const type of this.elementsTypes) {
      type.elements = elements.filter(e => e.type === type.type);
    }
  }
}
