import {Component, Inject, OnInit, ViewChild} from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import {NotificationService} from '@bci-web-core/core';
import {catchError, of} from 'rxjs';
import {WorkspaceSummaryComponent} from '../workspace-summary/workspace-summary.component';
import {State, ZipUploaderService} from './zip-uploader.service';

@Component({
  selector: 'bci-zip-uploader',
  templateUrl: './zip-uploader.component.html',
  styleUrls: ['./zip-uploader.component.scss'],
})
export class ZipUploaderComponent implements OnInit {
  @ViewChild(WorkspaceSummaryComponent) summaryComponent: WorkspaceSummaryComponent;

  public readonly icons = {
    violation: 'Bosch-Ic-notification-error',
    success: 'Bosch-Ic-notification-success',
  };

  public incorrectFiles: string[] = [];
  public showIncorrectFiles = false;
  public state: State;
  public validations = {};
  public errors: any[];
  public filesToOverwrite = null;
  public replacingFiles = false;
  public get hasFilesToReplace() {
    return Array.isArray(this.filesToOverwrite);
  }

  get namespaces() {
    if (!Object.keys(this.validations).length) {
      this.incorrectFiles = this.state?.incorrectFiles || [];

      this.state?.result.forEach(value => {
        const pieces = value.aspectModelFileName.split(':');
        const file = pieces.pop();
        const namespace = pieces.join(':');

        if (value.fileAlreadyDefined) {
          if (this.filesToOverwrite[namespace]) {
            this.filesToOverwrite[namespace].push(file);
          } else {
            this.filesToOverwrite[namespace] = [file];
          }
        }

        if (!this.validations[namespace]) {
          this.validations[namespace] = [];
        }

        const errors = (value?.validationErrors || []).map(error => {
          error.focusNode = error.focusNode?.split('#')[1];
          error.resultSeverity = error.resultSeverity?.split('#')[1]?.toLowerCase();
          error.resultMessage = error.resultMessage?.replace(/ \(see focusNode\)/g, '');
          return error;
        });

        this.validations[namespace].push({file, errors});
      });
    }
    console.log(this.validations, this.state);
    return this.validations;
  }

  get hasError$() {
    return this.zipImporterService.hasError$;
  }

  constructor(
    private dialogRef: MatDialogRef<ZipUploaderComponent>,
    private zipImporterService: ZipUploaderService,
    private notificationService: NotificationService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit() {
    if (this.data.index || this.data.index === 0) {
      this.state = this.zipImporterService.states[this.data.index];
      return;
    }

    // importing zip
    this.state = this.zipImporterService.tryImportZip(this.data.path, this.data.name);
  }

  dismiss() {
    const index = this.zipImporterService.states.findIndex(state => state?.path === this.state?.path);
    if (index < 0) {
      this.dialogRef.close();
      return;
    }

    this.zipImporterService.states.splice(index, 1);
    this.notificationService.information(`${this.state.name} was dismissed`);
    this.dialogRef.close();
  }

  cancel() {
    this.state.subscription?.unsubscribe();
    this.dismiss();
  }

  minimize() {
    this.dialogRef.close();
    this.notificationService.information(`${this.state.name} was minimized. You can find it in the left sidebar`);
  }

  replace() {
    if (!this.filesToOverwrite?.length) {
      this.summaryComponent.hasFilesToOverwrite = false;
      this.filesToOverwrite = null;
      return;
    }

    this.replacingFiles = true;
    this.zipImporterService
      .replaceFiles(this.filesToOverwrite)
      .pipe(catchError(() => of()))
      .subscribe(() => {
        this.filesToOverwrite = null;
        this.replacingFiles = false;
        this.summaryComponent.hasFilesToOverwrite = false;
      });
  }
}
