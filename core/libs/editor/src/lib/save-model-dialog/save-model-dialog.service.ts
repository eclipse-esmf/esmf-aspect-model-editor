import {Injectable, inject} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {SaveModelDialogComponent} from './save-model-dialog.component';

@Injectable({providedIn: 'root'})
export class SaveModelDialogService {
  private matDialog = inject(MatDialog);

  openDialog() {
    return this.matDialog.open(SaveModelDialogComponent).afterClosed();
  }
}
