import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ElementModel } from '@bame/shared';

@Component({
  selector: 'bci-sidebar-new-element',
  templateUrl: './sidebar-new-element.component.html',
  styleUrls: ['./sidebar-new-element.component.scss'],
})
export class SidebarNewElementComponent implements OnInit {
  @Input()
  public compactView = false;

  @Output()
  public openWorkspaces: EventEmitter<void> = new EventEmitter();

  public elements: ElementModel[];

  public ngOnInit() {
    this.elements = [
      new ElementModel(null, 'Property', 'property', 'Named Value'),
      new ElementModel(null, 'Operation', 'operation', 'An Operation represents an action that can be triggered on the Aspect'),
      new ElementModel(null, 'Characteristic', 'characteristic', 'The meaning of a Property in the context of the Aspect'),
      new ElementModel(null, 'Entity', 'entity', 'The logical encapsulation of multiple values'),
      new ElementModel(null, 'Constraint', 'constraint', 'A limitation applied to a Characteristic'),
      new ElementModel(null, 'Trait', 'trait', 'Encapsulates multiple limitations to Characteristics'),
      new ElementModel(null, 'Unit', 'unit', 'A definition of a physical unit'),
      new ElementModel(null, 'Event', 'event', 'A definition of an Event supported by the Aspect'),
    ];
  }
}
