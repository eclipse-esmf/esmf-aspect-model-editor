/*
 * Copyright (c) 2020 Robert Bosch Manufacturing Solutions GmbH, Germany. All rights reserved.
 */
import {Component, Input} from '@angular/core';
import {FormGroup} from '@angular/forms';

@Component({
  selector: 'bci-bame-operation',
  templateUrl: './operation.component.html',
  styleUrls: [],
})
export class OperationComponent {
  @Input() parentForm: FormGroup;
}
