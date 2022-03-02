import {Component, Input} from '@angular/core';
import {DefaultEvent} from '@bame/meta-model';
import {ModelElementEditorComponent} from '..';
import {EditorModelService} from '../../editor-model.service';

@Component({
  selector: 'bci-bame-event',
  templateUrl: './event.component.html',
})
export class EventComponent extends ModelElementEditorComponent<DefaultEvent> {
  @Input() parentForm;

  constructor(public metaModelDialogService: EditorModelService) {
    super(metaModelDialogService);
  }
}
