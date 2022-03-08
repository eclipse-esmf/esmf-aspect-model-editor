import {Component, Inject, OnInit, ViewChild} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {EditorService} from '@bame/editor';
import {catchError, of} from 'rxjs';
import {WorkspaceSummaryComponent} from '../workspace-summary/workspace-summary.component';
import {State, ZipUploaderService} from './zip-uploader.service';
import {RdfService} from '@bame/rdf/services';
import {NotificationsService} from '@bame/shared';

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
  public namespacesToReplace: string[] = null;
  public replacingFiles = false;
  public hasFilesToReplace = false;
  public imported = false;

  get hasError$() {
    return this.zipImporterService.hasError$;
  }

  constructor(
    private dialogRef: MatDialogRef<ZipUploaderComponent>,
    private zipImporterService: ZipUploaderService,
    private editorService: EditorService,
    private rdfService: RdfService,
    private notificationsService: NotificationsService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit() {
    this.state.loading = true;
    const subscription = this.zipImporterService.importZip(this.data.file).subscribe(result => {
      this.state = {
        ...this.state,
        loading: false,
        loaded: true,
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
    this.editorService.refreshSidebarNamespaces();
    this.state.subscription?.unsubscribe();
    this.dismiss();
  }

  replaceNamespace(namespace: string) {
    this.namespacesToReplace?.push(namespace);
  }

  keepNamespace(namespace: string) {
    this.namespacesToReplace = this.namespacesToReplace?.filter(n => namespace !== n);
  }

  replace() {
    if (!this.namespacesToReplace?.length) {
      this.summaryComponent.hasFilesToOverwrite = false;
      this.namespacesToReplace = null;
      return;
    }

    const files = this.state.rawResponse.correctFiles.map(file => file.aspectModelFileName);
    const toOverwrite = this.namespacesToReplace.reduce((acc: string[], namespace: string) => {
      return [...acc, ...files.filter((file: string) => file.startsWith(namespace))];
    }, []);

    this.replacingFiles = true;
    this.imported = false;
    this.zipImporterService
      .replaceFiles(toOverwrite)
      .pipe(catchError(() => of()))
      .subscribe(() => {
        this.imported = true;
        this.hasFilesToReplace = false;
        this.namespacesToReplace = null;
        this.replacingFiles = false;
        this.notificationsService.success(`Package ${this.data.name} was imported`);
        this.summaryComponent.hasFilesToOverwrite = false;
        toOverwrite.forEach(file => this.editorService.addAspectModelFileIntoStore(file).subscribe());
      });
  }
}
