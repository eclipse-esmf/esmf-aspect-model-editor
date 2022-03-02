import {Component, Input} from '@angular/core';
import {FormControl} from '@angular/forms';
import {DefaultAspect} from '@bame/meta-model';
import {ModelElementEditorComponent} from '..';
import {EditorModelService} from '../../editor-model.service';
import {UpdatedProperties} from '../properties/properties-button/properties-button.component';

@Component({
  selector: 'bci-bame-aspect',
  templateUrl: './aspect.component.html',
})
export class AspectComponent extends ModelElementEditorComponent<DefaultAspect> {
  @Input() parentForm;

  constructor(public metaModelDialogService: EditorModelService) {
    super(metaModelDialogService);
  }

  overwriteProperties(data: UpdatedProperties) {
    this.parentForm.setControl('editedProperties', new FormControl(data));
  }
}
