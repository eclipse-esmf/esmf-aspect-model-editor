import {Component, Inject} from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import {DialogOptions} from './confirm-dialog.service';

@Component({
  templateUrl: './confirm-dialog.component.html',
  styles: ['.dialog-title { font-size: 24px !important; }'],
})
export class ConfirmDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: DialogOptions, private dialogRef: MatDialogRef<ConfirmDialogComponent>) {}

  closeAndGiveResult(result: boolean) {
    this.dialogRef.close(result);
  }
}
