/*
 * Copyright (c) 2021 Bosch Software Innovations GmbH. All rights reserved.
 */
import {Component, Input} from '@angular/core';
import {FormGroup} from '@angular/forms';

@Component({
  selector: 'bci-bame-entity-value',
  templateUrl: './entity-value.component.html',
})
export class EntityValueComponent {
  @Input() parentForm: FormGroup;
}
