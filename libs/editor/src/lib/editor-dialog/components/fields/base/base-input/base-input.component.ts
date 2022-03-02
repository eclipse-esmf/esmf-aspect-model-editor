import {Component, Input} from '@angular/core';
import {FormGroup} from '@angular/forms';
import {PreviousFormDataSnapshot} from '../../../../interfaces';

@Component({
  selector: 'bci-base-input',
  templateUrl: './base-input.component.html',
})
export class BaseInputComponent {
  @Input() hideDescription = false;
  @Input() hideSee = false;
  @Input() parentForm: FormGroup;
  @Input() previousData: PreviousFormDataSnapshot;
}
