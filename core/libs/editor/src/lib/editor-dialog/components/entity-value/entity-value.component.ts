/*
 * Copyright (c) 2021 Bosch Software Innovations GmbH. All rights reserved.
 */
import {Component, Input} from '@angular/core';
import {FormGroup} from '@angular/forms';
import {EditorModelService} from '../../editor-model.service';

@Component({
  selector: 'ame-entity-value',
  templateUrl: './entity-value.component.html',
})
export class EntityValueComponent {
  @Input() parentForm: FormGroup;

  public element$ = this.metaModelDialogService.getMetaModelElement();

  constructor(public metaModelDialogService: EditorModelService) {}
}
