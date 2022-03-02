import {Component} from '@angular/core';
import {MatDialogRef} from '@angular/material/dialog';

@Component({
  selector: 'bci-document',
  templateUrl: './document.component.html',
  styleUrls: ['./document.component.scss'],
})
export class DocumentComponent {
  BAMEDocumentationLink = 'http://docs.digital-twin.bosch-nexeed.com/bame-guide/2.9.2/introduction.html'; // NOSONAR
  BAMMDocumentationLink = 'https://openmanufacturingplatform.github.io/sds-bamm-aspect-meta-model/bamm-specification/v1.0.0/index.html';
  supportMail = 'Nexeed.Helpdesk@de.bosch.com';

  constructor(private dialogRef: MatDialogRef<DocumentComponent>) {}

  onClose(): void {
    this.dialogRef.close();
  }
}
