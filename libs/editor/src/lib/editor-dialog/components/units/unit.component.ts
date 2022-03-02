/*
 *  Copyright (c) 2020 Robert Bosch Manufacturing Solutions GmbH, Germany. All rights reserved.
 */
import {Component, Input} from '@angular/core';
import {FormGroup} from '@angular/forms';

@Component({
  selector: 'bci-bame-unit',
  templateUrl: './unit.component.html',
})
export class UnitComponent {
  @Input() parentForm: FormGroup;
}
