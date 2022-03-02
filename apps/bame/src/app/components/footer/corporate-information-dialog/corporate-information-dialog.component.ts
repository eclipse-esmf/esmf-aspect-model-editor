import {Component} from '@angular/core';
import {MatDialogRef} from '@angular/material/dialog';

@Component({
  templateUrl: './corporate-information-dialog.component.html',
  styleUrls: ['./corporate-information-dialog.component.scss'],
})
export class CorporateInformationDialogComponent {
  constructor(private dialogRef: MatDialogRef<CorporateInformationDialogComponent>) {}

  closeDialog() {
    this.dialogRef.close();
  }
}
