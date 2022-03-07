import {Component, Inject, OnInit, ViewChild} from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import {EditorService} from '@bame/editor';
import {catchError, first, of} from 'rxjs';
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
  public state: State = {} as any;
  public validations = {};
  public errors: any[];
  public filesToOverwrite = null;
  public replacingFiles = false;
  public get hasFilesToReplace() {
    return Array.isArray(this.filesToOverwrite);
  }

  get hasError$() {
    return this.zipImporterService.hasError$;
  }

  constructor(
    private dialogRef: MatDialogRef<ZipUploaderComponent>,
    private zipImporterService: ZipUploaderService,
    private editorService: EditorService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit() {
    this.state.loading = true;
    const subscription = this.zipImporterService.importZip(this.data.file).subscribe(result => {
      this.state = {
        ...this.state,
        loading: false,
        ...result,
      } as any;
    });

    this.state.subscription = subscription;
  }

  dismiss() {
    this.editorService.refreshSidebarNamespaces();
    this.dialogRef.close();
  }

  cancel() {
    this.state.subscription?.unsubscribe();
    this.dismiss();
  }

  minimize() {
    this.dialogRef.close();
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

  pushFilesToWorkspace(files: string[]) {
    if (!files.length) {
      return;
    }
    this.zipImporterService.replaceFiles(files).pipe(first()).subscribe();
  }
}
