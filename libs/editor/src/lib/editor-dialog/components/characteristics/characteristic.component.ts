/*
 *  Copyright (c) 2020 Robert Bosch Manufacturing Solutions GmbH, Germany. All rights reserved.
 */
import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {Subscription} from 'rxjs';
import {EditorModelService} from '../../editor-model.service';
import {PreviousFormDataSnapshot} from '../../interfaces';

@Component({
  selector: 'bci-bame-characteristic',
  templateUrl: './characteristic.component.html',
})
export class CharacteristicComponent implements OnInit, OnDestroy {
  private subscription: Subscription;

  public property = false;
  public selectedCharacteristic: string;
  public previousData: PreviousFormDataSnapshot = {};

  @Input() parentForm;

  constructor(public metaModelDialogService: EditorModelService) {}

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }

  ngOnInit(): void {
    this.subscription = this.metaModelDialogService.getMetaModelElement().subscribe(() => {
      // TODO Should be solved better. Form does not seem to update correctly.
      this.property = false;
      requestAnimationFrame(() => (this.property = true));
    });
  }

  onPreviousDataChange(previousData: PreviousFormDataSnapshot) {
    requestAnimationFrame(() => {
      this.previousData = previousData;
    });
  }

  onClassChange(characteristic: string) {
    this.selectedCharacteristic = characteristic;
  }
}
