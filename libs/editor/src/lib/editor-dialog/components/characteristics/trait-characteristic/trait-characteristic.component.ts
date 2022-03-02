import {Component, Input} from '@angular/core';
import {FormGroup} from '@angular/forms';

@Component({
  selector: 'bci-trait-characteristic',
  templateUrl: './trait-characteristic.component.html',
})
export class TraitCharacteristicComponent {
  @Input() parentForm: FormGroup;
}
