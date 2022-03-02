/*
 * Copyright (c) 2020 Bosch Software Innovations GmbH. All rights reserved.
 */
import {Component, Input} from '@angular/core';
import {DefaultState, DefaultEntity} from '@bame/meta-model';
import {ModelElementEditorComponent} from '../..';
import {EditorModelService} from '../../../editor-model.service';
import {PreviousFormDataSnapshot} from '../../../interfaces';

@Component({
  selector: 'bci-bame-state-characteristic',
  templateUrl: './state-characteristic.component.html',
})
export class StateCharacteristicComponent extends ModelElementEditorComponent<DefaultState> {
  @Input() previousData: PreviousFormDataSnapshot = {};
  @Input() parentForm: any;

  constructor(public metaModelDialogService: EditorModelService) {
    super(metaModelDialogService);
  }

  get hasEntityType(): boolean {
    return this.metaModelElement?.dataType instanceof DefaultEntity;
  }
}
