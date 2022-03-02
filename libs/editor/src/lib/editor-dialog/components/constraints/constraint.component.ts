/*
 *  Copyright (c) 2020 Robert Bosch Manufacturing Solutions GmbH, Germany. All rights reserved.
 */
import {Component, Input, OnDestroy} from '@angular/core';
import {FormGroup} from '@angular/forms';
import {PreviousFormDataSnapshot} from '../../interfaces';

@Component({
  selector: 'bci-bame-constraint',
  templateUrl: './constraint.component.html',
})
export class ConstraintComponent implements OnDestroy {
  public selectedConstraint: string;
  public previousData: PreviousFormDataSnapshot = {};

  @Input() parentForm: FormGroup;

  ngOnDestroy() {
    this.previousData = {};
  }

  onPreviousDataChange(previousData: PreviousFormDataSnapshot) {
    this.previousData = previousData;
  }

  onClassChange(constraint: string) {
    this.selectedConstraint = constraint;
  }
}
