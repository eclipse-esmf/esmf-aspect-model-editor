import {Component, EventEmitter, Input, Output} from '@angular/core';

@Component({
  selector: 'bci-entity-value-search-bar',
  templateUrl: './entity-value-search-bar.component.html',
  styleUrls: ['./entity-value-search-bar.component.scss'],
})
export class EntityValueSearchBarComponent {
  @Input() count: number;
  @Input() disableAddNewEntityValue = false;
  @Output() newSearch = new EventEmitter<string>();
  @Output() add = new EventEmitter();

  sendNewSearchValue(newString: Event & {target: EventTarget & {value?: string}}): void {
    this.newSearch.emit(newString.target.value);
  }
}
