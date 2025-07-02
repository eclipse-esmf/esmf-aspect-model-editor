/*
 * Copyright (c) 2024 Robert Bosch Manufacturing Solutions GmbH
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

/**
 * Code taken from mxGraph github and updated per requirements
 * https://github.com/jgraph/mxgraph/blob/master/javascript/examples/extendcanvas.html
 */

import {LoadedFilesService} from '@ame/cache';
import {ConfigurationService} from '@ame/settings-dialog';
import {APP_CONFIG, AppConfig, AssetsPath, BindingsService, BrowserService} from '@ame/shared';
import {LanguageTranslationService} from '@ame/translation';
import {Inject, Injectable, NgZone} from '@angular/core';
import {DefaultEntity, DefaultEntityInstance, DefaultProperty, DefaultTrait} from '@esmf/aspect-model-loader';
import {mxgraph} from 'mxgraph-factory';
import {MxGraphHelper, ShapeAttribute} from '../helpers';
import {mxConstants, mxEditor, mxLayoutManager, mxOutline, mxPoint, mxRectangle, mxStackLayout, mxUtils} from '../providers';
import {MxGraphAttributeService} from './mx-graph-attribute.service';
import {MxGraphShapeSelectorService} from './mx-graph-shape-selector.service';

@Injectable()
export class MxGraphSetupService {
  private scrollTileSize: mxgraph.mxRectangle;
  private graph: mxgraph.mxGraph;
  private graphSizeDidChange: Function;
  private graphCellRedraw: Function;
  private autoTranslate = false;
  private viewCoordinates = {
    x0: 0,
    y0: 0,
  };

  constructor(
    @Inject(APP_CONFIG) private appConfig: AppConfig,
    private configurationService: ConfigurationService,
    private bindingsService: BindingsService,
    private browserService: BrowserService,
    private mxGraphShapeSelectorService: MxGraphShapeSelectorService,
    private mxGraphAttributeService: MxGraphAttributeService,
    private translate: LanguageTranslationService,
    private loadedFiles: LoadedFilesService,
    private ngZone: NgZone,
  ) {}

  setUp() {
    this.ngZone.runOutsideAngular(() => {
      const editor = (this.mxGraphAttributeService.editor = new mxEditor(
        mxUtils.load(this.appConfig.editorConfiguration).getDocumentElement(),
      ));
      this.graph = this.mxGraphAttributeService.graph = (editor as any).graph;

      this.scrollTileSize = new mxRectangle(0, 0, this.graph.container.clientWidth, this.graph.container.clientHeight);
      this.graphSizeDidChange = this.graph.sizeDidChange;
      this.graphCellRedraw = this.graph.cellRenderer.redraw;

      this.graph.setPanning(true);
      this.graph.setCellsEditable(false);
      this.graph.setCellsResizable(false);
      this.graph.graphHandler.setRemoveCellsFromParent(false);
      this.graph.setAllowDanglingEdges(false);
      this.graph.setCellsDisconnectable(false);

      this.graph.popupMenuHandler.factoryMethod = (menu: mxgraph.mxPopupMenu, cell: mxgraph.mxCell) =>
        this.getPopupFactoryMethod(menu, cell);
      this.graph.view.getBackgroundPageBounds = () => this.getBackgroundPageBounds();
      this.graph.getPreferredPageSize = () => this.getPreferredPageSize();
      this.graph.sizeDidChange = () => this.sizeDidChange();
      this.graph.convertValueToString = (cell: mxgraph.mxCell) => this.convertValueToString(cell);
      this.graph.cellRenderer.redraw = (state, force, rendering) => this.redraw(state, force, rendering);
      this.graph.getTooltipForCell = (cell: mxgraph.mxCell) => this.getTooltipForCell(cell);
      this.graph.isCellVisible = (cell: mxgraph.mxCell) => this.isCellVisible(cell);
      this.graph.setHtmlLabels(true);

      this.initializeGraphConstants();
      this.initLayout();

      this.graph.getLabel = (cell): any => {
        if (!cell.value && this.configurationService.getSettings().showConnectionLabels) {
          // label for edges
          return MxGraphHelper.createEdgeLabel(cell, this.graph);
        }

        if (!cell.connectable) {
          // label for sub cells
          return;
        }

        return MxGraphHelper.createPropertiesLabel(cell);
      };
    });
  }

  // construct the path for the asset
  private resolveAssetsIcon(path: AssetsPath): string {
    return `${this.browserService.getAssetBasePath()}/${path}`;
  }

  private getTooltipForCell(cell: mxgraph.mxCell) {
    const metaModelElement = MxGraphHelper.getModelElement(cell);
    if ([DefaultEntityInstance, DefaultTrait].some(e => metaModelElement instanceof e)) {
      return this.getToolTipContent(cell);
    }

    if (cell.isCollapsed()) {
      return this.getToolTipContent(cell);
    }
    return '';
  }

  private getToolTipContent(cell: mxgraph.mxCell) {
    const div = document.createElement('div');
    div.classList.add('cell-tooltip');

    const name = document.createElement('b');
    name.innerText = cell.id;
    div.appendChild(name);

    const configuration = cell['configuration'];

    if (configuration?.fields) {
      const table = document.createElement('table');
      if (!configuration?.baseProperties.isPredefined) {
        table.innerHTML += `<tr><td>Namespace</td><td>${configuration?.baseProperties.namespace}</td></tr>`;
        table.innerHTML += `<tr><td>SAMM Version</td><td>${configuration?.baseProperties.sammVersion}</td></tr>`;
        table.innerHTML += `<tr><td>Model Version</td><td>${configuration?.baseProperties.version}</td></tr>`;

        if (configuration?.baseProperties.fileName) {
          table.innerHTML += `<tr><td>File</td><td>${configuration?.baseProperties.fileName}</td></tr>`;
        }
      }

      configuration.fields.forEach((propLabel: ShapeAttribute) => {
        const [propName, ...propValue] = propLabel.label.split(' = ');
        table.innerHTML += `<tr><td>${propName}</td><td>${propValue.join(' = ')}</td></tr>`;
      });
      div.appendChild(table);
    }
    const container = document.createElement('div');
    container.appendChild(div);
    return container.innerHTML;
  }

  centerGraph() {
    const bounds = this.graph.getGraphBounds();
    const height = Math.max(bounds.height, this.scrollTileSize.height * this.graph.view.scale);

    const aspect = this.graph.getChildCells(this.graph.getDefaultParent(), true, false).find(({style}) => style.includes('aspect'));
    if (aspect) {
      const topCoordinate = Math.floor(Math.max(0, bounds.y - Math.max(0, (this.graph.container.clientHeight - height) / 2)));
      this.graph.scrollCellToVisible(aspect, true);
      this.graph.container.scrollTop = topCoordinate - aspect.geometry.height / 2;
    }
  }

  private initializeGraphConstants() {
    mxConstants.VERTEX_SELECTION_STROKEWIDTH = 2;
    mxConstants.EDGE_SELECTION_STROKEWIDTH = 2;
    mxConstants.VERTEX_SELECTION_DASHED = false;
    mxConstants.EDGE_SELECTION_DASHED = false;
  }

  private initLayout() {
    const elementLayout = new mxStackLayout(this.graph, false);
    elementLayout.fill = true;
    elementLayout.marginTop = 30;
    elementLayout.marginBottom = 20;
    elementLayout.resizeParent = true;
    elementLayout.resizeParentMax = true;
    elementLayout.borderCollapse = false;

    new mxLayoutManager(this.graph).getLayout = mxUtils.bind(this, (cell: mxgraph.mxCell) => {
      if (cell.vertex && cell.connectable) {
        return elementLayout;
      }
      return null;
    });

    // Necessary to display the minimap
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    new mxOutline(this.graph, document.getElementById('outline')); //NOSONAR
  }

  private convertValueToString(cell: mxgraph.mxCell) {
    if (mxUtils.isNode(cell.value, null)) {
      return cell.getAttribute('parent') === 'yes' ? cell.getAttribute('name') : cell.getAttribute('label');
    }

    return cell.value;
  }

  /**
   * Returns the padding for pages in page view with scrollbars.
   * We have 400px width for namespace sidebar.
   */
  private getPagePadding() {
    return new mxPoint(
      Math.max(0, Math.round(this.graph.container.offsetWidth - 34)),
      Math.max(0, Math.round(this.graph.container.offsetHeight - 34)),
    );
  }

  /**
   * Returns the size of the page format scaled with the page size.
   */
  private getPageSize() {
    return this.graph.pageVisible
      ? new mxRectangle(0, 0, this.graph.pageFormat.width * this.graph.pageScale, this.graph.pageFormat.height * this.graph.pageScale)
      : this.scrollTileSize;
  }

  /**
   * Returns a rectangle describing the position and count of the
   * background pages, where x and y are the position of the top,
   * left page and width and height are the vertical and horizontal
   * page count.
   */
  private getPageLayout() {
    const size = this.graph.pageVisible ? this.getPageSize() : this.scrollTileSize;
    const bounds = this.graph.getGraphBounds();

    if (bounds.width === 0 || bounds.height === 0) {
      return new mxRectangle(0, 0, 1, 1);
    } else {
      // Computes untransformed graph bounds
      const x = Math.ceil(bounds.x / this.graph.view.scale - this.graph.view.translate.x);
      const y = Math.ceil(bounds.y / this.graph.view.scale - this.graph.view.translate.y);
      const w = Math.floor(bounds.width / this.graph.view.scale);
      const h = Math.floor(bounds.height / this.graph.view.scale);

      const x0 = Math.floor(x / size.width);
      const y0 = Math.floor(y / size.height);
      const w0 = Math.ceil((x + w) / size.width) - x0;
      const h0 = Math.ceil((y + h) / size.height) - y0;

      return new mxRectangle(x0, y0, w0, h0);
    }
  }

  /**
   * Fits the number of background pages to the graph
   */
  private getBackgroundPageBounds() {
    const layout = this.getPageLayout();
    const page = this.getPageSize();

    return new mxRectangle(
      this.graph.view.scale * (this.graph.view.translate.x + layout.x * page.width),
      this.graph.view.scale * (this.graph.view.translate.y + layout.y * page.height),
      this.graph.view.scale * layout.width * page.width,
      this.graph.view.scale * layout.height * page.height,
    );
  }

  private getPreferredPageSize() {
    const pages = this.getPageLayout();
    const size = this.getPageSize();

    return new mxRectangle(0, 0, pages.width * size.width, pages.height * size.height);
  }

  private sizeDidChange(...args: any) {
    if (this.graph.container != null && mxUtils.hasScrollbars(this.graph.container)) {
      const pages = this.getPageLayout();
      const pad = this.getPagePadding();
      const size = this.getPageSize();

      // Updates the minimum graph size
      const minWidth = Math.ceil((2 * pad.x) / this.graph.view.scale + pages.width * size.width);
      const minHeight = Math.ceil((2 * pad.y) / this.graph.view.scale + pages.height * size.height);

      const min = this.graph.minimumGraphSize;

      // After delayed call in window.resize event handler
      if (min == null || min.width !== minWidth || min.height !== minHeight) {
        this.graph.minimumGraphSize = new mxRectangle(0, 0, minWidth, minHeight);
      }

      // Updates auto-translate to include padding and graph size
      const dx = pad.x / this.graph.view.scale - pages.x * size.width;
      const dy = pad.y / this.graph.view.scale - pages.y * size.height;

      if (!this.autoTranslate && (this.graph.view.translate.x !== dx || this.graph.view.translate.y !== dy)) {
        this.autoTranslate = true;
        this.viewCoordinates.x0 = pages.x;
        this.viewCoordinates.y0 = pages.y;

        const tx = this.graph.view.translate.x;
        const ty = this.graph.view.translate.y;
        // Sets initial scrollbar positions
        this.graph.view.setTranslate(dx, dy);
        this.graph.container.scrollLeft += (dx - tx) * this.graph.view.scale;
        this.graph.container.scrollTop += (dy - ty) * this.graph.view.scale;

        this.autoTranslate = false;
        return;
      }

      this.graphSizeDidChange.apply(this.graph, args);
    }
  }

  private isCellVisible(cell: mxgraph.mxCell): boolean {
    if (!cell.isEdge()) {
      return true;
    }

    const target = MxGraphHelper.getModelElement(cell.target);
    const source = MxGraphHelper.getModelElement(cell.source);

    if (
      !this.configurationService.getSettings().showEntityValueEntityEdge &&
      source instanceof DefaultEntityInstance &&
      target instanceof DefaultEntity
    ) {
      return false;
    }

    if (
      !this.configurationService.getSettings().showAbstractPropertyConnection &&
      source instanceof DefaultProperty &&
      target instanceof DefaultProperty &&
      target.isAbstract
    ) {
      return false;
    }

    return true;
  }

  private redraw(state: mxgraph.mxCellState, force: boolean, rendering: boolean): boolean {
    const cellHeight = MxGraphHelper.getCellHeight(state.cell);
    if (cellHeight) {
      state.height = +cellHeight * state.view.scale;
    }
    return this.graphCellRedraw.apply(this.graph.cellRenderer, [state, force, rendering]);
  }

  private getPopupFactoryMethod(menu: mxgraph.mxPopupMenu, cell: mxgraph.mxCell) {
    const selectedCells: Array<mxgraph.mxCell> = this.mxGraphShapeSelectorService.getSelectedCells();
    if (cell && !cell.edge) {
      const modelElement = MxGraphHelper.getModelElement(cell);

      menu.addItem(
        `${this.translate.language.EDITOR_CANVAS.GRAPH_SETUP.OPEN_IN} ${this.loadedFiles.isElementExtern(modelElement) ? 'new Window' : 'detail view'}`,
        this.resolveAssetsIcon(AssetsPath.OpenIcon),
        () => {
          this.bindingsService.fireAction('editElement');
        },
      );

      if (selectedCells.length === 2) {
        menu.addItem(this.translate.language.EDITOR_CANVAS.GRAPH_SETUP.CONNECT, this.resolveAssetsIcon(AssetsPath.ConnectionOnIcon), () => {
          this.bindingsService.fireAction('connectElements');
        });
      } else if (selectedCells.length === 1) {
        menu.addItem(
          this.translate.language.EDITOR_CANVAS.GRAPH_SETUP.CONNECT_WITH,
          this.resolveAssetsIcon(AssetsPath.ConnectionOnIcon),
          () => {
            this.bindingsService.fireAction('connect-with');
          },
        );
      }

      menu.addItem(this.translate.language.EDITOR_CANVAS.GRAPH_SETUP.SELECT_ALL_REFERENCES, this.resolveAssetsIcon(AssetsPath.Tree), () => {
        this.bindingsService.fireAction('select-tree');
      });
    }

    menu.addItem(this.translate.language.EDITOR_CANVAS.GRAPH_SETUP.FORMAT, this.resolveAssetsIcon(AssetsPath.FormatIcon), () => {
      this.bindingsService.fireAction('format');
    });

    if (cell) {
      menu.addSeparator();
      menu.addItem(this.translate.language.EDITOR_CANVAS.GRAPH_SETUP.DELETE, this.resolveAssetsIcon(AssetsPath.DeleteIcon), () => {
        this.bindingsService.fireAction('deleteElement');
      });
    } else {
      menu.addItem(this.translate.language.EDITOR_CANVAS.GRAPH_SETUP.COPY_TO_CLIPBOARD, this.resolveAssetsIcon(AssetsPath.Copy), () => {
        this.bindingsService.fireAction('copy-to-clipboard');
      });
    }
  }
}
