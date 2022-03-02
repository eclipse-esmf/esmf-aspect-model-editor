/*
 *  Copyright (c) 2021 Robert Bosch Manufacturing Solutions GmbH, Germany. All rights reserved.
 */
import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {ElementModel} from '@bame/shared';

@Component({
  selector: 'bci-namespace-element-list',
  styleUrls: ['./namespace-element-list.component.scss'],
  templateUrl: './namespace-element-list.component.html',
})
export class NamespaceElementListComponent implements OnChanges {
  @Input() public type: string;
  @Input() public title: string;
  @Input() public elements: ElementModel[];

  public isExpanded = false;
  public filteredElements: ElementModel[];

  public ngOnChanges(changes: SimpleChanges) {
    if (changes.hasOwnProperty('elements') && this.type) {
      this.initList();
    }
  }

  public resetExpanded() {
    this.initList();
  }

  public expandList() {
    this.filteredElements = [...(this.elements || [])];
    this.isExpanded = true;
  }

  private initList() {
    this.filteredElements = [...(this.elements || [])];
    this.isExpanded = true;

    if (this.filteredElements.length > 3) {
      this.isExpanded = false;
      this.filteredElements.splice(3, this.filteredElements.length - 3);
    }
  }
}
