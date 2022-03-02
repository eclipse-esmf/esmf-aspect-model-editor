/*
 *  Copyright (c) 2020 Robert Bosch Manufacturing Solutions GmbH, Germany. All rights reserved.
 */
import {Component, Input} from '@angular/core';
import {UpdatedProperties} from '../properties/properties-button/properties-button.component';
import {EditorModelService} from '../../editor-model.service';
import {FormControl} from '@angular/forms';

@Component({
  selector: 'bci-bame-entity',
  templateUrl: './entity.component.html',
})
export class EntityComponent {
  @Input() parentForm;

  constructor(public metaModelDialogService: EditorModelService) {}

  overwriteProperties(data: UpdatedProperties) {
    this.parentForm.setControl('editedProperties', new FormControl(data));
  }
}
