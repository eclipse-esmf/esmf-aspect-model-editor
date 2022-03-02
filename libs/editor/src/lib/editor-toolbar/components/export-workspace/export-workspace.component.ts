import {FlatTreeControl} from '@angular/cdk/tree';
import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import {MatTreeFlatDataSource, MatTreeFlattener} from '@angular/material/tree';
import {ModelApiService} from '@bame/api';
import {catchError, first, of, Subscription} from 'rxjs';

interface SelectableNamespaces {
  [namespace: string]: SelectableNamespace;
}

interface SelectableNamespace {
  [version: string]: string[];
}

interface FlatNode {
  expandable: boolean;
  name: string;
  level: number;
}

interface VersionNode {
  name: string;
  children?: VersionNode[];
}

@Component({
  selector: 'bci-export-workspace',
  templateUrl: './export-workspace.component.html',
  styleUrls: ['./export-workspace.component.scss'],
})
export class ExportWorkspaceComponent implements OnInit, OnDestroy {
  public treeControl = new FlatTreeControl<FlatNode>(
    node => node.level,
    node => node.expandable
  );

  public treeFlattener = new MatTreeFlattener(
    (node: VersionNode, level: number) => {
      return {
        expandable: !!node.children && node.children.length > 0,
        name: node.name,
        level: level,
      };
    },
    node => node.level,
    node => node.expandable,
    node => node.children
  );

  private readonly namespaceSplitter = ':';

  private filesToValidate: string[];
  private subscription = new Subscription();

  public namespaces: SelectableNamespaces;
  public validated = false;
  public validationStatus: any;
  public validating = false;
  public error: any = null;
  public exported = false;
  public validationHasErrors = false;

  public selectedNamespace: string;
  public structure = {
    namespace: null,
    dataSource: new MatTreeFlatDataSource(this.treeControl, this.treeFlattener),
  };

  constructor(
    private dialogRef: MatDialogRef<ExportWorkspaceComponent>,
    private modelApiService: ModelApiService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    this.modelApiService
      .getAllNamespaces()
      .pipe(first())
      .subscribe(namespaces => {
        this.namespaces = namespaces.reduce((acc: SelectableNamespaces, namespace: string) => {
          const parts = namespace.split(this.namespaceSplitter);
          const file = parts.pop();
          const version = parts.pop();
          const namespaceName = parts.join(this.namespaceSplitter);

          if (!acc[namespaceName]) {
            acc[namespaceName] = {[version]: [file]};
            return acc;
          }

          if (!acc[namespaceName][version]) {
            acc[namespaceName][version] = [file];
            return acc;
          }

          acc[namespaceName][version].push(file);
          return acc;
        }, {} as SelectableNamespaces);
      });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  showStructure(namespace: string) {
    this.structure.namespace = namespace;
    this.structure.dataSource.data = Object.entries(this.namespaces[namespace]).map(([version, files]) => {
      return {name: version, children: files.map(file => ({name: file}))};
    });
    this.treeControl.expandAll();
  }

  hasChild = (_: number, node: FlatNode) => node.expandable;

  validate() {
    const versions = this.namespaces[this.selectedNamespace];
    if (!versions) {
      return;
    }

    this.filesToValidate = Object.entries(versions).reduce((acc, [version, files]) => {
      return [...acc, ...files.map(file => `${this.selectedNamespace}:${version}:${file}`)];
    }, []);

    this.validating = true;
    this.error = null;
    this.validationStatus = null;

    const sub = this.modelApiService
      .validateFilesForExport(this.filesToValidate)
      .pipe(
        first(),
        catchError(error => {
          if (error.status >= 500) {
            this.error = {internalServerError: true};
          } else {
            this.error = {unexpectedError: true};
          }

          this.validating = false;
          return of();
        })
      )
      .subscribe(response => {
        this.validationStatus = response;
        this.validating = false;
        this.validated = true;
        this.validationHasErrors = this.hasResponseErrors();
      });

    this.subscription.add(sub);
  }

  export() {
    this.exported = false;
    const sub = this.modelApiService.getExportZipFile().subscribe(response => {
      const url = URL.createObjectURL(response);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'package.zip';
      a.click();
      this.exported = true;
    });

    this.subscription.add(sub);
  }

  close() {
    if (this.validating) {
      this.subscription.unsubscribe();
    }
    this.dialogRef.close();
  }

  hasResponseErrors() {
    return (
      !!this.validationStatus?.missingFiles.length ||
      Object.values<any>(this.validationStatus?.correctFiles).some(({validationErrors}) => !!validationErrors.length)
    );
  }
}
