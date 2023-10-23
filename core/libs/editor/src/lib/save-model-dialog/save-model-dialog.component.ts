import {Component, NgZone} from '@angular/core';
import {MatDialogRef} from '@angular/material/dialog';
import {EditorService} from '@ame/editor';

@Component({
  templateUrl: 'save-model-dialog.component.html',
  styleUrls: ['save-model-dialog.component.scss'],
})
export class SaveModelDialogComponent {
  public disabledButton = false;

  constructor(private matDialogRef: MatDialogRef<SaveModelDialogComponent>, private editorService: EditorService, private zone: NgZone) {}

  close(destroyWindow: boolean) {
    this.matDialogRef.close(destroyWindow);
  }

  saveModel() {
    this.disabledButton = true;
    this.zone.run(() => {
      this.editorService.saveModel().subscribe(() => {
        this.disabledButton = false;
        this.matDialogRef.close(true);
      });
    });
  }
}
