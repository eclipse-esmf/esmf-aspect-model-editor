/*
 *  Copyright (c) 2020 Robert Bosch Manufacturing Solutions GmbH, Germany. All rights reserved.
 */
import {AfterViewInit, Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, NavigationEnd, Router} from '@angular/router';
import {filter, map, switchMap, takeUntil} from 'rxjs/operators';
import {of, Subject} from 'rxjs';
import {mxgraph} from 'mxgraph-factory';
import {MatDrawer} from '@angular/material/sidenav';
import {BciSidebarService} from '@bci-web-core/core';
import {ElementModelService} from '@bame/meta-model';
import {MxGraphService, MxGraphAttributeService, MxGraphShapeSelectorService, mxEvent, mxUtils, MxGraphHelper} from '@bame/mx-graph';
import {LogService, BindingsService} from '@bame/shared';
import {EditorDialogComponent, EditorService} from '@bame/editor';
import {ModelService} from '@bame/rdf/services';
import {FormGroup} from '@angular/forms';

@Component({
  selector: 'bci-editor-canvas',
  templateUrl: './editor-canvas.component.html',
  styleUrls: ['./editor-canvas.component.scss'],
})
export class EditorCanvasComponent implements AfterViewInit, OnInit, OnDestroy {
  @ViewChild(EditorDialogComponent) editorDialogComponent: EditorDialogComponent;
  @ViewChild('sideBar') sideBarDrawer: MatDrawer;

  private unsubscribe: Subject<void> = new Subject();
  private selectedShapeForUpdate: mxgraph.mxCell | null;

  public isSidebarOpened = false;
  public useDialogModeForEdit = false;

  constructor(
    private editorService: EditorService,
    private mxGraphService: MxGraphService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private modelService: ModelService,
    private logService: LogService,
    private bindingsService: BindingsService,
    private mxGraphAttributeService: MxGraphAttributeService,
    private mxGraphShapeSelectorService: MxGraphShapeSelectorService,
    private sidebarService: BciSidebarService,
    private elementModelService: ElementModelService
  ) {}

  ngAfterViewInit(): void {
    this.mxGraphAttributeService.graph.addListener(
      mxEvent.MOVE_CELLS,
      mxUtils.bind(this, () => {
        this.mxGraphAttributeService.graph.resetEdgesOnMove = true;
      })
    );
    this.mxGraphAttributeService.graph.addListener(mxEvent.FOLD_CELLS, () => this.mxGraphService.formatShapes());
    this.mxGraphAttributeService.graph.addListener(mxEvent.DOUBLE_CLICK, () => this.onEditSelectedCell());
    // actions for context menu
    this.bindingsService.registerAction('editElement', () => this.onEditSelectedCell());
    this.bindingsService.registerAction('deleteElement', () => this.editorService.deleteSelectedElements());
    // actions for hotkeys
    this.editorService.bindAction(
      'deleteElement',
      mxUtils.bind(this, () => this.editorService.deleteSelectedElements())
    );
    window['ng-editor-service'] = this.editorService;
  }

  ngOnInit() {
    this.router.events
      .pipe(
        takeUntil(this.unsubscribe),
        filter(event => event instanceof NavigationEnd),
        map(() => this.activatedRoute.root?.firstChild),
        switchMap(firstChild => {
          if (firstChild?.firstChild) {
            const targetRoot = firstChild.firstChild;
            return targetRoot.paramMap.pipe(map((paramMap: any) => paramMap.get('urn')));
          }
          return of(null);
        })
      )
      .subscribe(param => {
        if (param) {
          if (this.mxGraphService.navigateToCellByUrn(param)) {
            this.onEditSelectedCell();
          } else {
            this.onCloseEditDialog();
          }
          this.router.navigate(['editor']);
        }
      });
  }

  isDetailDialogOpen() {
    return !!this.editorDialogComponent?.isShown();
  }

  onCloseEditDialog() {
    if (this.modelService.getLoadedAspectModel().rdfModel) {
      this.editorDialogComponent.onClose();
    }
  }

  onToggleHideSidebar() {
    this.sidebarService.setSidebarState(false);
    this.isSidebarOpened = !this.isSidebarOpened;
  }

  onSave(formData: FormGroup) {
    if (this.selectedShapeForUpdate) {
      this.elementModelService.updateElement(this.selectedShapeForUpdate, formData);
    } else {
      this.logService.logInfo('Skip shape update because nothing is selected.');
    }

    this.resetSelectedShapeForUpdate();
  }

  resetSelectedShapeForUpdate() {
    this.selectedShapeForUpdate = null;
  }

  onEditSelectedCell() {
    this.selectedShapeForUpdate = this.mxGraphShapeSelectorService.getSelectedShape();

    if (!this.selectedShapeForUpdate) {
      return;
    }

    const modelElement = MxGraphHelper.getModelElement(this.selectedShapeForUpdate);
    this.editorDialogComponent.onEdit(modelElement);
  }

  ngOnDestroy(): void {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }
}
