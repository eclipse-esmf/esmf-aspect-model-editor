/*
 * Copyright (c) 2022 Robert Bosch Manufacturing Solutions GmbH
 *
 * See the AUTHORS file(s) distributed with this work for
 * additional information regarding authorship.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * SPDX-License-Identifier: MPL-2.0
 */

import {AfterViewInit, Component, ElementRef, EventEmitter, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import {ModelApiService} from '@ame/api';
import {NamespacesCacheService} from '@ame/cache';
import {ConfirmDialogService, EditorService} from '@ame/editor';
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
} from '@ame/meta-model';
import {ElementModel, LoadingScreenOptions, LoadingScreenService, NamespaceModel, NotificationsService, SidebarService} from '@ame/shared';
import {catchError, finalize, first, Subscription, throwError} from 'rxjs';

@Component({
  selector: 'ame-editor-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class EditorCanvasSidebarComponent implements AfterViewInit, OnInit, OnDestroy {
  @ViewChild('sidebarNamespaces') sidebarNamespaces;
  @Output() closeSidebar = new EventEmitter();

  public selectedNamespace: string = null;
  public selectedNamespaceElements: ElementModel[];

  public view = 'default';
  public viewExpanded = false;

  private loadModelSubscription: Subscription;
  private refreshNamespacesSubscription: Subscription;

  constructor(
    private editorService: EditorService,
    private confirmDialogService: ConfirmDialogService,
    private namespaceCacheService: NamespacesCacheService,
    private modelApiService: ModelApiService,
    private loadingScreenService: LoadingScreenService,
    private notificationsService: NotificationsService,
    private elementRef: ElementRef,
    public sidebarService: SidebarService
  ) {}

  public ngAfterViewInit(): void {
    this.editorService.initCanvas();
    this.loadModelSubscription = this.editorService.loadModel$.subscribe(() => {
      this.selectedNamespace = null;
      this.selectedNamespaceElements = null;
      this.sidebarNamespaces?.clearSelections();
    });
  }

  public ngOnInit() {
    this.initNamespaces();
    this.refreshNamespacesSubscription = this.editorService.onRefreshNamespaces.subscribe(() => {
      this.sidebarService.resetNamespaces();
      this.initNamespaces();
    });
  }

  public ngOnDestroy() {
    this.loadModelSubscription.unsubscribe();
    this.refreshNamespacesSubscription.unsubscribe();
  }

  public onSelectNamespace(namespace: string) {
    if (namespace) {
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
            this.sidebarService.resetNamespaces();
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
    const subscription = this.modelApiService
      .loadAspectModelByUrn(namespaceFileName)
      .pipe(first())
      .subscribe((aspectModel: string) => {
        const loadingScreenOptions: LoadingScreenOptions = {
          title: 'Loading Aspect Model',
          hasCloseButton: true,
          closeButtonAction: () => {
            subscription.unsubscribe();
          },
        };
        this.loadingScreenService.open(loadingScreenOptions);
        this.editorService
          .loadNewAspectModel(aspectModel)
          .pipe(
            first(),
            catchError(error => {
              console.groupCollapsed('sidebar.component -> loadNamespaceFile', error);
              console.groupEnd();

              this.notificationsService.error(
                'Error when loading Aspect Model. Reverting to previous Aspect Model',
                `${error}`,
                null,
                5000
              );
              return throwError(() => error);
            }),
            finalize(() => this.loadingScreenService.close())
          )
          .subscribe();
      });
  }

  public close() {
    this.closeSidebar.emit();
  }

  public collapse() {
    this.viewExpanded = false;
    this.elementRef.nativeElement.style.width = '95px';
  }

  public expand(noDelay?: boolean) {
    this.viewExpanded = true;
    this.elementRef.nativeElement.style.width = '400px';
    if (!noDelay) {
      this.elementRef.nativeElement.style.transition = '0.5s all 0.5s';
    } else {
      this.elementRef.nativeElement.style.transition = '';
    }
  }

  public goToNamespaces() {
    this.view = 'namespaces';
    this.expand(true);
  }

  public goToDefault() {
    this.view = 'default';
  }

  private initNamespaces() {
    this.modelApiService.getAllNamespaces().subscribe((data: string[]) => {
      this.sidebarService.resetNamespaces();
      data.forEach((namespace: string) => {
        const namespaceParts = namespace.split(':');
        const namespaceFolder = namespace.slice(0, namespace.lastIndexOf(':'));
        const namespaceFile = namespaceParts[namespaceParts.length - 1];

        const parentNamespace = this.sidebarService.namespaces.find((ns: NamespaceModel) => ns.name === namespaceFolder);
        if (!parentNamespace) {
          this.sidebarService.namespaces.push(new NamespaceModel(namespaceFolder, [namespaceFile]));
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
