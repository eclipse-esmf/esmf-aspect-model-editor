/*
 * Copyright (c) 2026 Robert Bosch Manufacturing Solutions GmbH
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

import {LoadedFilesService} from '@ame/cache';
import {ConfigurationService} from '@ame/settings-dialog';
import {AssetsPath, BindingsService, BrowserService} from '@ame/shared';
import {LanguageTranslationService} from '@ame/translation';
import {inject, Injectable} from '@angular/core';
import {DefaultAspect, DefaultEntityInstance, DefaultTrait} from '@esmf/aspect-model-loader';
import {
  Cell,
  CellState,
  domUtils,
  Graph,
  InternalEvent,
  LayoutManager,
  MaxPopupMenu,
  Outline,
  Point,
  PopupMenuHandler,
  Rectangle,
  registerDefaultEdgeMarkers,
  registerDefaultEdgeStyles,
  registerDefaultPerimeters,
  registerDefaultShapes,
  SelectionHandler,
  StackLayout,
  styleUtils,
  VertexHandlerConfig,
} from '@maxgraph/core';
import {MaxGraphHelper, ShapeAttribute} from '../helpers';
import {GraphStylesRegistry} from '../themes';
import {MaxGraphAttributeService} from './max-graph-attribute.service';
import {MaxGraphShapeSelectorService} from './max-graph-shape-selector.service';

@Injectable({providedIn: 'root'})
export class MaxGraphSetupService {
  private readonly configurationService = inject(ConfigurationService);
  private readonly bindingsService = inject(BindingsService);
  private readonly browserService = inject(BrowserService);
  private readonly maxgraphShapeSelectorService = inject(MaxGraphShapeSelectorService);
  private readonly maxgraphAttributeService = inject(MaxGraphAttributeService);
  private readonly translate = inject(LanguageTranslationService);
  private readonly loadedFiles = inject(LoadedFilesService);

  private scrollTileSize: Rectangle;
  private graph: Graph;
  private graphSizeDidChange: () => void;
  private graphCellRedraw: (state: CellState, force?: boolean, rendering?: boolean) => void;
  private autoTranslate = false;
  private viewCoordinates = {
    x0: 0,
    y0: 0,
  };

  setUp() {
    registerDefaultEdgeMarkers();
    registerDefaultEdgeStyles();
    registerDefaultPerimeters();
    registerDefaultShapes();

    const container = document.getElementById('graph') as HTMLElement;
    InternalEvent.disableContextMenu(container);

    this.graph = new Graph(container);
    GraphStylesRegistry.setupStyles(this.graph);

    this.maxgraphAttributeService.graph = this.graph;

    this.scrollTileSize = new Rectangle(0, 0, this.graph.container.clientWidth, this.graph.container.clientHeight);
    this.graphSizeDidChange = this.graph.sizeDidChange;
    this.graphCellRedraw = this.graph.cellRenderer.redraw;

    this.graph.setPanning(true);
    this.graph.setCellsEditable(false);
    this.graph.setCellsResizable(false);
    this.graph.setCellsBendable(false);
    this.graph.setAllowDanglingEdges(false);
    this.graph.setCellsDisconnectable(false);
    this.graph.setHtmlLabels(true);
    this.graph.setTooltips(true);
    this.graph.isCellSelectable = (cell: Cell) => !cell.isEdge() && this.graph.isCellsSelectable();
    this.graph.isCellDeletable = () => this.graph.isCellsDeletable();
    this.graph.sizeDidChange = () => this.sizeDidChange();
    this.graph.view.getBackgroundPageBounds = () => this.getBackgroundPageBounds();
    this.graph.getPreferredPageSize = () => this.getPreferredPageSize();
    this.graph.convertValueToString = (cell: Cell) => this.convertValueToString(cell);
    this.graph.cellRenderer.redraw = (state: CellState, force: boolean, rendering: boolean) => this.redraw(state, force, rendering);
    this.graph.getTooltipForCell = (cell: Cell) => this.getTooltipForCell(cell);

    const popupMenuHandler = this.graph.getPlugin<PopupMenuHandler>('PopupMenuHandler');
    const selectionHandler = this.graph.getPlugin<SelectionHandler>('SelectionHandler');

    if (popupMenuHandler) {
      popupMenuHandler.factoryMethod = (menu: MaxPopupMenu, cell: Cell | null): void => this.getPopupFactoryMethod(menu, cell);
    } else {
      console.warn('No popup menu handler found.');
    }

    if (selectionHandler) {
      selectionHandler.setRemoveCellsFromParent(false);
    } else {
      console.warn('No selection handler found.');
    }

    const originalMoveCells = this.graph.moveCells.bind(this.graph);
    this.graph.moveCells = (cells: Cell[], dx = 0, dy = 0, clone = false, target?: Cell, evt?: MouseEvent, mapping?: any): Cell[] => {
      const {dx: adjDx, dy: adjDy} = MaxGraphHelper.avoidCellCollisions(this.graph, cells, dx, dy);
      return originalMoveCells(cells, adjDx, adjDy, clone, target, evt, mapping);
    };

    this.initializeGraphConstants();
    this.initLayout();

    this.graph.getLabel = (cell): any => {
      if (!cell.value && this.configurationService.getSettings().showConnectionLabels) {
        // label for edges
        return MaxGraphHelper.createEdgeLabel(cell, this.graph);
      }

      if (!cell.connectable) {
        // label for sub cells
        return;
      }

      return MaxGraphHelper.createPropertiesLabel(cell);
    };
  }

  // construct the path for the asset
  private resolveAssetsIcon(path: AssetsPath): string {
    return `${this.browserService.getAssetBasePath()}/${path}`;
  }

  private getTooltipForCell(cell: Cell): string {
    const metaModelElement = MaxGraphHelper.getModelElement(cell);
    if ([DefaultEntityInstance, DefaultTrait].some(e => metaModelElement instanceof e)) {
      return this.getToolTipContent(cell);
    }

    if (cell.isCollapsed()) {
      return this.getToolTipContent(cell);
    }
    return '';
  }

  private getToolTipContent(cell: Cell): string {
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

  centerGraph(): void {
    const vertices = this.graph?.getChildVertices?.(this.graph.getDefaultParent());
    if (!vertices || vertices.length === 0) return;

    const aspect = vertices.find((cell: Cell) => {
      const model = MaxGraphHelper.getModelElement(cell);
      return model instanceof DefaultAspect || (cell.style?.baseStyleNames && cell.style.baseStyleNames.includes('aspect'));
    });

    const targetCell = aspect || vertices[0];
    if (targetCell) {
      this.graph.scrollCellToVisible(targetCell, true);
    }
  }

  private initializeGraphConstants(): void {
    VertexHandlerConfig.selectionStrokeWidth = 2;
    VertexHandlerConfig.selectionDashed = false;
  }

  private initLayout(): void {
    const elementLayout = new StackLayout(this.graph, false);
    elementLayout.fill = true;
    elementLayout.marginTop = 30;
    elementLayout.marginBottom = 20;
    elementLayout.resizeParent = true;
    elementLayout.resizeParentMax = true;
    elementLayout.borderCollapse = false;

    const layoutManager = new LayoutManager(this.graph);
    layoutManager.getLayout = (cell: Cell) => {
      if (cell.isVertex() && cell.connectable) {
        return elementLayout;
      }
      return null;
    };

    // Necessary to display the minimap
    const outlineElement = document.getElementById('outline') as HTMLDivElement;
    new Outline(this.graph, outlineElement);
    outlineElement.style.maxWidth = '300px';
  }

  private convertValueToString(cell: Cell): any {
    if (domUtils.isNode(cell.value, null)) {
      return cell.getAttribute('parent') === 'yes' ? cell.getAttribute('name') : cell.getAttribute('label');
    }

    return cell.value;
  }

  /**
   * Returns the padding for pages in page view with scrollbars.
   * We have 400px width for namespace sidebar.
   */
  private getPagePadding(): Point {
    return new Point(
      Math.max(0, Math.round(this.graph.container.offsetWidth - 34)),
      Math.max(0, Math.round(this.graph.container.offsetHeight - 34)),
    );
  }

  /**
   * Returns the size of the page format scaled with the page size.
   */
  private getPageSize(): Rectangle {
    return this.graph.pageVisible
      ? new Rectangle(0, 0, this.graph.pageFormat.width * this.graph.pageScale, this.graph.pageFormat.height * this.graph.pageScale)
      : this.scrollTileSize;
  }

  /**
   * Returns a rectangle describing the position and count of the
   * background pages, where x and y are the position of the top,
   * left page and width and height are the vertical and horizontal
   * page count.
   */
  private getPageLayout(): Rectangle {
    const size = this.graph.pageVisible ? this.getPageSize() : this.scrollTileSize;
    const bounds = this.graph.getGraphBounds();

    if (bounds.width === 0 || bounds.height === 0) {
      return new Rectangle(0, 0, 1, 1);
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

      return new Rectangle(x0, y0, w0, h0);
    }
  }

  /**
   * Fits the number of background pages to the graph
   */
  private getBackgroundPageBounds(): Rectangle {
    const layout = this.getPageLayout();
    const page = this.getPageSize();

    return new Rectangle(
      this.graph.view.scale * (this.graph.view.translate.x + layout.x * page.width),
      this.graph.view.scale * (this.graph.view.translate.y + layout.y * page.height),
      this.graph.view.scale * layout.width * page.width,
      this.graph.view.scale * layout.height * page.height,
    );
  }

  private getPreferredPageSize(): Rectangle {
    const pages = this.getPageLayout();
    const size = this.getPageSize();

    return new Rectangle(0, 0, pages.width * size.width, pages.height * size.height);
  }

  private sizeDidChange(...args: any): void {
    if (this.graph.container != null && styleUtils.hasScrollbars(this.graph.container)) {
      const pages = this.getPageLayout();
      const pad = this.getPagePadding();
      const size = this.getPageSize();

      // Updates the minimum graph size
      const minWidth = Math.ceil((2 * pad.x) / this.graph.view.scale + pages.width * size.width);
      const minHeight = Math.ceil((2 * pad.y) / this.graph.view.scale + pages.height * size.height);

      const min = this.graph.minimumGraphSize;

      // After delayed call in window.resize event handler
      if (min == null || min.width !== minWidth || min.height !== minHeight) {
        this.graph.minimumGraphSize = new Rectangle(0, 0, minWidth, minHeight);
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

  private redraw(state: CellState, force: boolean, rendering: boolean): void {
    const cellHeight = MaxGraphHelper.getCellHeight(state.cell);
    if (cellHeight) {
      state.height = +cellHeight * state.view.scale;
    }

    this.graphCellRedraw.apply(this.graph.cellRenderer, [state, force, rendering]);
  }

  private getPopupFactoryMethod(menu: MaxPopupMenu, cell: Cell) {
    const selectedCells: Array<Cell> = this.maxgraphShapeSelectorService.getSelectedCells();
    if (cell && !cell.edge) {
      const modelElement = MaxGraphHelper.getModelElement(cell);

      menu.addItem(
        `${this.translate.language.editorCanvas.graphSetup.openIn} ${this.loadedFiles.isElementExtern(modelElement) ? 'new Window' : 'detail view'}`,
        this.resolveAssetsIcon(AssetsPath.OpenIcon),
        () => {
          this.bindingsService.fireAction('editElement');
        },
      );

      if (selectedCells.length === 2) {
        menu.addItem(this.translate.language.editorCanvas.graphSetup.connect, this.resolveAssetsIcon(AssetsPath.ConnectionOnIcon), () => {
          this.bindingsService.fireAction('connectElements');
        });
      } else if (selectedCells.length === 1) {
        menu.addItem(
          this.translate.language.editorCanvas.graphSetup.connectWith,
          this.resolveAssetsIcon(AssetsPath.ConnectionOnIcon),
          () => {
            this.bindingsService.fireAction('connect-with');
          },
        );
      }

      menu.addItem(this.translate.language.editorCanvas.graphSetup.selectAllReferences, this.resolveAssetsIcon(AssetsPath.Tree), () => {
        this.bindingsService.fireAction('select-tree');
      });
    }

    menu.addItem(this.translate.language.editorCanvas.graphSetup.format, this.resolveAssetsIcon(AssetsPath.FormatIcon), () => {
      this.bindingsService.fireAction('format');
    });

    if (cell && !cell.isEdge()) {
      menu.addSeparator();
      menu.addItem(this.translate.language.editorCanvas.graphSetup.delete, this.resolveAssetsIcon(AssetsPath.DeleteIcon), () => {
        this.bindingsService.fireAction('deleteElement');
      });
    } else if (!cell) {
      menu.addItem(this.translate.language.editorCanvas.graphSetup.copyToClipboard, this.resolveAssetsIcon(AssetsPath.Copy), () => {
        this.bindingsService.fireAction('copy-to-clipboard');
      });
    }
  }
}
