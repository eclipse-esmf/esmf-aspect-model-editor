import {Injectable} from '@angular/core';
import {ModalWindowService} from '@bci-web-core/core';
import {first} from 'rxjs/operators';
import {ConfirmDialogComponent} from './confirm-dialog.component';

export interface DialogOptions {
  phrases: string[];
  title: string;
  closeButtonText?: string;
  okButtonText?: string;
}

@Injectable({providedIn: 'root'})
export class ConfirmDialogService {
  constructor(private matDialog: ModalWindowService) {}

  open({phrases, title, closeButtonText, okButtonText}: DialogOptions) {
    return this.matDialog
      .openDialogWithComponent(ConfirmDialogComponent, {
        data: {
          phrases,
          title,
          closeButtonText: closeButtonText || 'Close',
          okButtonText: okButtonText || 'Continue',
        },
        maxWidth: 650,
        minWidth: 550,
      })
      .afterClosed()
      .pipe(first());
  }
}
