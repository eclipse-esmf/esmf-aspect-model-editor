import {Component} from '@angular/core';
import {MatDialogRef} from '@angular/material/dialog';

@Component({
  templateUrl: './legal-notice-dialog.component.html',
  styleUrls: ['./legal-notice-dialog.component.scss'],
})
export class LegalNoticeDialogComponent {
  constructor(private dialogRef: MatDialogRef<LegalNoticeDialogComponent>) {}

  closeDialog() {
    this.dialogRef.close();
  }
}
