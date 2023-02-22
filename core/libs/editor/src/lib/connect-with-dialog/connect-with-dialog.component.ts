import {BaseMetaModelElement} from '@ame/meta-model';
import {MxGraphHelper, MxGraphService} from '@ame/mx-graph';
import {Component, Inject} from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import {mxgraph} from 'mxgraph-factory';

interface Element {
  cell: mxgraph.mxCell;
  model: BaseMetaModelElement;
}

@Component({
  selector: 'ame-connect-with-dialog',
  templateUrl: './connect-with-dialog.component.html',
  styleUrls: ['./connect-with-dialog.component.scss'],
})
export class ConnectWithDialogComponent {
  public elements: Element[];
  public selectedElement: Element;
  public connectWithModel: BaseMetaModelElement;

  constructor(
    private mxGraphService: MxGraphService,
    private dialogRef: MatDialogRef<ConnectWithDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public connectWithCell
  ) {
    this.connectWithModel = MxGraphHelper.getModelElement(connectWithCell);
    this.elements = this.mxGraphService.getAllCells().map(e => {
      return {model: MxGraphHelper.getModelElement(e), cell: e};
    });
  }

  getClass(cell: mxgraph.mxCell) {
    const [elementClass] = cell.style.split(';');
    return elementClass || '';
  }

  getFirstLetter(cell: mxgraph.mxCell) {
    const elementClass = this.getClass(cell);
    const firstLetter = elementClass?.[0] || '';
    return firstLetter.toUpperCase();
  }

  isFiltered(element: Element, searched: string) {
    return (
      element.model.name.toLowerCase().includes(searched.toLowerCase()) &&
      element.model.aspectModelUrn !== this.connectWithModel.aspectModelUrn
    );
  }

  isSelected({model}: Element) {
    return this.selectedElement?.model.aspectModelUrn === model?.aspectModelUrn;
  }

  close() {
    this.dialogRef.close();
  }

  connect() {
    if (!this.selectedElement) {
      return;
    }

    this.dialogRef.close({...this.selectedElement});
  }
}
