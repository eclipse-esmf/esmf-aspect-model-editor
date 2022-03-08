/*
 *  Copyright (c) 2021 Robert Bosch Manufacturing Solutions GmbH, Germany. All rights reserved.
 */
import {AfterViewInit, Component, ElementRef, EventEmitter, HostListener, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import {ModelApiService} from '@bame/api';
import {NamespacesCacheService} from '@bame/cache';
import {ConfirmDialogService, EditorService} from '@bame/editor';
import {
  BaseMetaModelElement,
  DefaultCharacteristic,
  DefaultConstraint,
  DefaultEntity,
  DefaultEvent,
  DefaultOperation,
  DefaultProperty,
  DefaultTrait,
  DefaultUnit,
} from '@bame/meta-model';
import {ElementModel, NamespaceModel, NotificationsService} from '@bame/shared';
import {LoadingScreenOptions, LoadingScreenService} from '@bci-web-core/core';
import {catchError, finalize, first, of, Subscription} from 'rxjs';

@Component({
  selector: 'bci-editor-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class EditorCanvasSidebarComponent implements AfterViewInit, OnInit, OnDestroy {
  @ViewChild('sidebarNamespaces') sidebarNamespaces;
  @Output() closeSidebar = new EventEmitter();

  public isExpanded = false;
  public selectedNamespace: string = null;
  public selectedNamespaceElements: ElementModel[];
  public namespaces: NamespaceModel[] = [];

  public view = 'default';
  public compactView = true;
  public isHoveredDefaultView = false;

  private loadModelSubscription: Subscription;
  private refreshNamespacesSubscription: Subscription;

  constructor(
    private editorService: EditorService,
    private confirmDialogService: ConfirmDialogService,
    private namespaceCacheService: NamespacesCacheService,
    private modelApiService: ModelApiService,
    private loadingScreenService: LoadingScreenService,
    private notificationsService: NotificationsService,
    private elementRef: ElementRef
  ) {}

  @HostListener('mouseenter')
  public hoverDefaultView() {
    if (this.view !== 'default') {
      return;
    }
    this.isHoveredDefaultView = true;
    setTimeout(() => {
      if (this.isHoveredDefaultView) {
        this.expand();
        this.compactView = false;
      }
    }, 1000);
  }

  @HostListener('mouseleave')
  public hoverOutDefaultView() {
    if (this.view !== 'default') {
      return;
    }
    this.isHoveredDefaultView = false;
    setTimeout(() => {
      if (!this.isHoveredDefaultView) {
        this.collapse();
        this.compactView = true;
      }
    }, 1000);
  }

  public ngAfterViewInit(): void {
    this.editorService.initCanvas();
    this.loadModelSubscription = this.editorService.loadModel$.subscribe(() => {
      this.selectedNamespace = null;
      this.selectedNamespaceElements = null;
      this.sidebarNamespaces?.clearSelections();
    });
    setTimeout(() => {
      // workaround
      // initalization of drag and drop for the elements needs to be done after initCanvas();
      this.close();
    });
  }

  public ngOnInit() {
    this.initNamespaces();
    this.refreshNamespacesSubscription = this.editorService.onRefreshNamespaces.subscribe(() => {
      this.namespaces = [];
      this.initNamespaces();
    });
  }

  public ngOnDestroy() {
    this.loadModelSubscription.unsubscribe();
    this.refreshNamespacesSubscription.unsubscribe();
  }

  public onSelectNamespace(namespace: string) {
    if (namespace) {
      this.expand();
      this.selectedNamespace = namespace;
      this.view = 'namespace-elements';
      const namespaceParts = namespace.split(':');
      const namespaceFolder = namespace.slice(0, namespace.lastIndexOf(':'));
      const namespaceFile = namespaceParts[namespaceParts.length - 1];
      this.getNamespaceElements(namespaceFolder, namespaceFile);
    }
  }

  public deleteNamespace(aspectModelFileName: string) {
    const aspectModelName = aspectModelFileName.split(':')[2].replace('.ttl', '');
    this.confirmDialogService
      .open({
        phrases: [
          `Are you sure you want to delete the Aspect Model "${aspectModelName}" from its namespace?`,
          'This action cannot be undone.',
        ],
        title: 'Delete Aspect Model',
      })
      .subscribe(confirmed => {
        if (confirmed) {
          this.modelApiService.deleteNamespace(aspectModelFileName).subscribe(() => {
            this.namespaces = [];
            this.initNamespaces();
          });
          this.selectedNamespace = null;
          this.selectedNamespaceElements = null;
          this.sidebarNamespaces?.clearSelections();
          this.editorService.removeAspectModelFileFromStore(aspectModelFileName);
        }
      });
  }

  public getNamespaceElements(namespaceFolder: string, namespaceFile: string) {
    this.selectedNamespaceElements = [];
    const cachedFile = this.namespaceCacheService.getNamespace(`urn:bamm:${namespaceFolder}#`)?.get(`${namespaceFolder}:${namespaceFile}`);
    if (cachedFile) {
      this.selectedNamespaceElements = cachedFile
        .getAllElements<BaseMetaModelElement>()
        .filter(elem => this.getType(elem))
        .map(
          (elem: BaseMetaModelElement) => new ElementModel(elem.aspectModelUrn, elem.name, this.getType(elem), elem.getDescription('en'))
        );
    } else {
      this.loadNamespace(namespaceFolder, namespaceFile);
    }
  }

  public loadNamespaceFile(namespaceFileName: string) {
    this.modelApiService
      .loadAspectModelByUrn(namespaceFileName)
      .pipe(first())
      .subscribe((aspectModel: string) => {
        const loadingScreenOptions: LoadingScreenOptions = {title: 'Loading Aspect Model', closeable: true};
        this.loadingScreenService.show(loadingScreenOptions);
        this.editorService
          .loadNewAspectModel(aspectModel)
          .pipe(
            first(),
            catchError(error =>
              of(
                this.notificationsService.error(
                  'Error when loading Aspect Model. Reverting to previous Aspect Model',
                  `${error}`,
                  null,
                  5000
                )
              )
            ),
            finalize(() => this.loadingScreenService.close())
          )
          .subscribe();
      });
  }

  public close() {
    this.closeSidebar.emit();
  }

  public collapse() {
    this.isExpanded = false;
    this.elementRef.nativeElement.style.width = '95px';
  }

  public expand() {
    this.isExpanded = true;
    this.elementRef.nativeElement.style.width = '400px';
  }

  public goToNamespaces() {
    this.expand();
    this.view = 'namespaces';
  }

  public goToDefault() {
    this.collapse();
    this.view = 'default';
    this.compactView = true;
  }

  private initNamespaces() {
    this.modelApiService.getAllNamespaces().subscribe((data: string[]) => {
      data.forEach((namespace: string) => {
        const namespaceParts = namespace.split(':');
        const namespaceFolder = namespace.slice(0, namespace.lastIndexOf(':'));
        const namespaceFile = namespaceParts[namespaceParts.length - 1];

        const parentNamespace = this.namespaces.find((ns: NamespaceModel) => ns.name === namespaceFolder);
        if (!parentNamespace) {
          this.namespaces.push(new NamespaceModel(namespaceFolder, [namespaceFile]));
        } else {
          parentNamespace.files.push(namespaceFile);
        }
      });
    });
  }

  private getType(modelElement: BaseMetaModelElement) {
    if (modelElement instanceof DefaultProperty) {
      return 'property';
    } else if (modelElement instanceof DefaultOperation) {
      return 'operation';
    } else if (modelElement instanceof DefaultTrait) {
      return 'trait';
    } else if (modelElement instanceof DefaultCharacteristic) {
      return 'characteristic';
    } else if (modelElement instanceof DefaultEntity) {
      return 'entity';
    } else if (modelElement instanceof DefaultConstraint) {
      return 'constraint';
    } else if (modelElement instanceof DefaultUnit) {
      return 'unit';
    } else if (modelElement instanceof DefaultEvent) {
      return 'event';
    } else {
      return null;
    }
  }

  private loadNamespace(namespaceFolder: string, namespaceFile: string) {
    const cachedFile = this.editorService.loadExternalAspectModel(`${namespaceFolder}:${namespaceFile}`);
    this.selectedNamespaceElements = cachedFile
      ?.getAllElements<BaseMetaModelElement>()
      .filter(elem => this.getType(elem))
      .map((elem: BaseMetaModelElement) => new ElementModel(elem.aspectModelUrn, elem.name, this.getType(elem), elem.getDescription('en')));
  }
}
