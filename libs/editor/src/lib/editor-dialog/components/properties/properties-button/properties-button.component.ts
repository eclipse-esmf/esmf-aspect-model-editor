import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {
  BaseMetaModelElement,
  DefaultAspect,
  DefaultEntity,
  OverWrittenProperty,
  OverWrittenPropertyKeys
} from '@bame/meta-model';
import {ModalWindowService} from '@bci-web-core/core';
import {first} from 'rxjs/operators';
import {PropertiesModalComponent} from '..';
import {EditorModelService} from '../../../editor-model.service';

export interface UpdatedProperties {
  [key: string]: OverWrittenPropertyKeys;
}

@Component({
  selector: 'bci-properties-button',
  templateUrl: './properties-button.component.html',
})
export class PropertiesButtonComponent implements OnInit {
  @Output() overwrite = new EventEmitter();
  metaModelElement: DefaultEntity | DefaultAspect;

  private propertiesClone: OverWrittenProperty[];

  constructor(private modalWindowService: ModalWindowService, public metaModelDialogService: EditorModelService) {
  }

  ngOnInit(): void {
    this.metaModelDialogService.getMetaModelElement().subscribe((metaModelElement: BaseMetaModelElement) => {
      if (metaModelElement instanceof DefaultEntity || metaModelElement instanceof DefaultAspect) {
        this.metaModelElement = metaModelElement;
      }
    });
  }

  openPropertiesTable() {
    this.modalWindowService
      .openDialogWithComponent(PropertiesModalComponent, {
        data: {
          name: this.metaModelElement.name,
          properties: this.propertiesClone || this.metaModelElement.properties,
          isExternalRef: this.metaModelElement.isExternalReference(),
        },
        autoFocus: false,
      })
      .afterClosed()
      .pipe(first())
      .subscribe((data: UpdatedProperties) => {
        if (!data) {
          return;
        }

        this.propertiesClone = JSON.parse(JSON.stringify(this.metaModelElement.properties)) as Array<OverWrittenProperty>;
        for (const {
          property: {aspectModelUrn},
          keys,
        } of this.propertiesClone) {
          keys.notInPayload = data[aspectModelUrn].notInPayload;
          keys.optional = data[aspectModelUrn].optional;
          keys.payloadName = data[aspectModelUrn].payloadName;
        }

        this.overwrite.emit(data);
      });
  }
}
